import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Heart, MessageCircle, Users, Calendar, MapPin, Music, Copy } from "lucide-react";
import Map, { Marker } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import NotificationBell from "@/components/NotificationBell";

type Party = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  datetime: string;
  genre: string | null;
  dresscode: string | null;
  entry_fee: number | null;
  is_public: boolean;
  created_by: string;
  access_id: string;
  latitude: string | null;
  longitude: string | null;
};

type Profile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
};

type Comment = {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: Profile;
};

type Attendee = {
  id: string;
  status: string;
  user_id: string;
  profiles: Profile;
};

const PartyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [party, setParty] = useState<Party | null>(null);
  const [host, setHost] = useState<Profile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [newComment, setNewComment] = useState("");
  const [session, setSession] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isAttending, setIsAttending] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log("PartyDetails - isAttending:", isAttending);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) {
        fetchPartyDetails(data.session);
      } else {
        navigate("/auth");
      }
    };
    getSession();
  }, [id, navigate]);

  const fetchPartyDetails = async (currentSession: any = session) => {
    if (!id) return;

    // Party Details laden
    const { data: partyData, error: partyError } = await supabase
      .from("parties")
      .select("*")
      .eq("id", id)
      .single();

    if (partyError || !partyData) {
      toast({ title: "Fehler", description: "Party nicht gefunden" });
      navigate("/parties");
      return;
    }

    setParty(partyData);

    // Host-Profil laden
    const { data: hostData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", partyData.created_by)
      .single();

    setHost(hostData);

    // Kommentare laden
    const { data: commentsData } = await supabase
      .from("party_comments")
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq("party_id", id)
      .order("created_at", { ascending: false });

    setComments(commentsData || []);

    // Teilnehmer laden
    const { data: attendeesData } = await supabase
      .from("party_attendees")
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq("party_id", id)
      .eq("status", "attending");

    setAttendees(attendeesData || []);

    // Likes zählen
    const { count: likesCountData } = await supabase
      .from("party_likes")
      .select("*", { count: "exact" })
      .eq("party_id", id);

    setLikesCount(likesCountData || 0);

    // Check if user liked
    if (currentSession?.user) {
      const { data: userLike } = await supabase
        .from("party_likes")
        .select("id")
        .eq("party_id", id)
        .eq("user_id", currentSession.user.id)
        .maybeSingle();

      setIsLiked(!!userLike);

      // Check if user is attending
      const { data: userAttendance } = await supabase
        .from("party_attendees")
        .select("id")
        .eq("party_id", id)
        .eq("user_id", currentSession.user.id)
        .maybeSingle();

      setIsAttending(!!userAttendance);
    }

    setLoading(false);
  };

  const handleLike = async () => {
    if (!session?.user || !id) return;

    if (isLiked) {
      const { error } = await supabase
        .from("party_likes")
        .delete()
        .eq("party_id", id)
        .eq("user_id", session.user.id);

      if (!error) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        toast({ title: "Like entfernt", description: "Sie haben Ihr Like entfernt" });
        // Keine Notification beim Entfernen des Likes
      }
    } else {
      const { error } = await supabase
        .from("party_likes")
        .insert({
          party_id: id,
          user_id: session.user.id,
        });

      if (!error) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        toast({ title: "Geliked", description: "Sie haben die Party geliked" });
        // Notification nur für den aktuellen User
        if (party) {
          NotificationBell.addNotification({
            user_id: session.user.id,
            type: 'party_liked',
            title: 'Party geliked',
            message: `Du hast die Party "${party.title}" geliked.`,
            read_at: null
          });
        }
      }
    }
  };

  const handleAttendance = async () => {
    if (!session?.user || !id) return;

    if (isAttending) {
      const { error } = await supabase
        .from("party_attendees")
        .delete()
        .eq("party_id", id)
        .eq("user_id", session.user.id);

      if (!error) {
        setIsAttending(false);
        toast({ title: "Abgemeldet", description: "Sie haben sich von der Party abgemeldet" });
        fetchPartyDetails(); // Refresh attendees list
      }
    } else {
      const { error } = await supabase
        .from("party_attendees")
        .insert({
          party_id: id,
          user_id: session.user.id,
          status: "attending",
        });

      if (!error) {
        setIsAttending(true);
        toast({ title: "Angemeldet", description: "Sie haben sich für die Party angemeldet" });
        fetchPartyDetails(); // Refresh attendees list
        // Notification nur für den aktuellen User
        if (party) {
          NotificationBell.addNotification({
            user_id: session.user.id,
            type: 'party_signup',
            title: 'Angemeldet',
            message: `Du hast dich für die Party "${party.title}" angemeldet.`,
            read_at: null
          });
        }
      }
    }
  };

  const handleAddComment = async () => {
    if (!session?.user || !id || !newComment.trim()) return;

    const { error } = await supabase
      .from("party_comments")
      .insert({
        party_id: id,
        user_id: session.user.id,
        comment: newComment.trim(),
      });

    if (!error) {
      setNewComment("");
      fetchPartyDetails(); // Refresh comments
    } else {
      toast({ title: "Fehler", description: "Kommentar konnte nicht hinzugefügt werden" });
    }
  };

  const handleMapClick = useCallback(() => {
    navigate('/map');
  }, [navigate]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Lädt...</div>;
  }

  if (!party) {
    return <div className="text-center mt-10">Party nicht gefunden</div>;
  }

  // Map-Snippet nur anzeigen, wenn Koordinaten vorhanden
  const hasCoords = party.latitude && party.longitude;

  // Markerfarbe bestimmen
  let markerColor = '#6b7280'; // grau
  if (session?.user?.id === party.created_by) markerColor = '#a21caf'; // host
  else if (isAttending) markerColor = '#ef4444'; // angemeldet

  const partyLink = party.access_id;

  return (
    <div className="max-w-3xl mx-auto mt-4 px-2 sm:mt-8 sm:px-0 flex flex-col gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          {party.title}
        </h1>
        {hasCoords && (
          <div
            className="my-4 rounded-lg overflow-hidden border shadow cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
            style={{ width: '100%', minWidth: 350, maxWidth: 700, height: 300 }}
            onClick={handleMapClick}
            title="Zur Kartenansicht"
          >
            <Map
              initialViewState={{
                longitude: Number(party.longitude),
                latitude: Number(party.latitude),
                zoom: 15,
              }}
              mapLib={maplibregl}
              mapStyle="https://api.maptiler.com/maps/basic-v2/style.json?key=DEfQaoKmexkJVxeAeLQg"
              style={{ width: '100%', height: '100%' }}
              attributionControl={false}
            >
              <Marker longitude={Number(party.longitude)} latitude={Number(party.latitude)}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g filter="url(#shadow)">
                    <path d="M16 3C10.477 3 6 7.477 6 13c0 6.075 7.09 14.09 9.293 16.293a1 1 0 0 0 1.414 0C18.91 27.09 26 19.075 26 13c0-5.523-4.477-10-10-10Zm0 12.5A2.5 2.5 0 1 1 16 10a2.5 2.5 0 0 1 0 5Z" fill={markerColor} stroke="#fff" strokeWidth="2" />
                  </g>
                  <defs>
                    <filter id="shadow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={markerColor} floodOpacity="0.3" />
                    </filter>
                  </defs>
                </svg>
              </Marker>
            </Map>
          </div>
        )}
      </div>

      {!party.is_public && party.access_id && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
          <p className="text-blue-800 text-sm font-medium">Dies ist eine private Party. Teilen Sie diese ID, um andere einzuladen:</p>
          <Input
            type="text"
            value={partyLink}
            readOnly
            className="flex-grow border-blue-300 bg-blue-100 text-blue-900"
          />
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Copy className="h-4 w-4 mr-1" /> Kopieren
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>{new Date(party.datetime).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" />
          <span>{party.location}</span>
        </div>
        {party.genre && (
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-500" />
            <span>{party.genre}</span>
          </div>
        )}
        {party.entry_fee && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Eintritt: {party.entry_fee}€</span>
          </div>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <Button
          onClick={handleAttendance}
          variant={isAttending ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          {isAttending ? "Abmelden" : "Anmelden"}
        </Button>
        
        <Button
          onClick={handleLike}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          {likesCount} {isLiked ? "Geliked" : "Likes"}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Teilnehmer ({attendees.length})
        </h2>
        <div className="flex flex-wrap gap-4">
          {attendees.map((attendee) => (
            <div key={attendee.id} className="flex items-center gap-2">
              <img
                src={attendee.profiles.avatar_url || "/placeholder.svg"}
                alt={attendee.profiles.name || "User"}
                className="w-8 h-8 rounded-full object-cover border"
              />
              <span className="text-sm">{attendee.profiles.name || "Unbekannt"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Kommentare
        </h2>
        
        <div className="flex gap-2 mb-6">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Schreibe einen Kommentar..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <Button onClick={handleAddComment} disabled={!newComment.trim()}>
            Senden
          </Button>
        </div>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={comment.profiles.avatar_url || "/placeholder.svg"}
                alt={comment.profiles.name || "User"}
                className="w-8 h-8 rounded-full object-cover border"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.profiles.name || "Unbekannt"}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.comment}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500 text-center">Noch keine Kommentare</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartyDetails;
