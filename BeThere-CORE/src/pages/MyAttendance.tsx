import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import PartyCard from "@/components/PartyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type Profile = { id: string; name: string | null; avatar_url: string | null };

type Party = {
  id: string;
  title: string;
  location: string;
  datetime: string;
  genre: string | null;
  created_by: string;
  description: string | null;
  is_public: boolean | null;
  created_at: string | null;
  entry_fee: number | null;
  access_id: string;
};

const MyAttendance = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [hosts, setHosts] = useState<{ [id: string]: Profile }>({});
  const [likesCount, setLikesCount] = useState<{ [id: string]: number }>({});
  const [attendeesCount, setAttendeesCount] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        fetchMyAttendance();
      } else {
        navigate("/auth");
      }
    };
    getSession();
  }, [navigate]);

  const fetchMyAttendance = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Parties finden, bei denen der User angemeldet ist
    const { data: attendances } = await supabase
      .from("party_attendees")
      .select("party_id")
      .eq("user_id", user.id)
      .eq("status", "attending");

    if (!attendances || attendances.length === 0) {
      setLoading(false);
      return;
    }

    const partyIds = attendances.map(a => a.party_id);

    let { data: parties, error } = await supabase
      .from("parties")
      .select("*")
      .in("id", partyIds)
      .order("datetime", { ascending: true });
    
    if (error) {
      setLoading(false);
      return;
    }
    
    setParties(parties || []);
    
    // Hosts laden
    const uniqueHostIds = Array.from(new Set((parties || []).map(p => p.created_by)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", uniqueHostIds);
    
    const hostsById: { [id: string]: Profile } = {};
    profiles?.forEach(profile => {
      hostsById[profile.id] = profile;
    });
    setHosts(hostsById);

    // Stats laden
    if (parties && parties.length > 0) {
      const likesPromises = partyIds.map(async (partyId) => {
        const { count } = await supabase
          .from("party_likes")
          .select("*", { count: "exact" })
          .eq("party_id", partyId);
        return { partyId, count: count || 0 };
      });

      const attendeesPromises = partyIds.map(async (partyId) => {
        const { count } = await supabase
          .from("party_attendees")
          .select("*", { count: "exact" })
          .eq("party_id", partyId)
          .eq("status", "attending");
        return { partyId, count: count || 0 };
      });

      const likesResults = await Promise.all(likesPromises);
      const attendeesResults = await Promise.all(attendeesPromises);

      const likesCountObj: { [id: string]: number } = {};
      const attendeesCountObj: { [id: string]: number } = {};

      likesResults.forEach(({ partyId, count }) => {
        likesCountObj[partyId] = count;
      });

      attendeesResults.forEach(({ partyId, count }) => {
        attendeesCountObj[partyId] = count;
      });

      setLikesCount(likesCountObj);
      setAttendeesCount(attendeesCountObj);
    }

    setLoading(false);
  };

  const handleInviteLinkSubmit = async () => {
    if (!inviteLink) {
      toast({ title: "Fehler", description: "Bitte geben Sie eine Party-ID ein." });
      return;
    }

    const accessId = inviteLink;

    if (!accessId) {
      toast({ title: "Fehler", description: "Ungültige Party-ID." });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Fehler", description: "Sie müssen angemeldet sein." });
      setLoading(false);
      return;
    }

    try {
      const { data: party, error: partyError } = await supabase
        .from("parties")
        .select("*")
        .eq("access_id", accessId)
        .single();

      if (partyError || !party) {
        throw new Error("Party nicht gefunden oder Zugriff verweigert.");
      }

      if (party.is_public) {
        throw new Error("Dies ist eine öffentliche Party und sollte bereits sichtbar sein.");
      }

      // Check if already attending
      const { data: existingAttendance } = await supabase
        .from("party_attendees")
        .select("*")
        .eq("party_id", party.id)
        .eq("user_id", user.id)
        .single();

      if (existingAttendance) {
        toast({ title: "Bereits angemeldet", description: "Sie sind bereits für diese Party angemeldet." });
        setLoading(false);
        return;
      }

      // Add user to party_attendees
      const { error: attendeeError } = await supabase
        .from("party_attendees")
        .insert({
          party_id: party.id,
          user_id: user.id,
          status: "attending" // Default status
        });

      if (attendeeError) {
        throw attendeeError;
      }

      toast({ title: "Party hinzugefügt", description: "Die private Party wurde zu Ihren Anmeldungen hinzugefügt." });
      setInviteLink(""); // Clear input
      fetchMyAttendance(); // Refresh the list

    } catch (error: any) {
      toast({ title: "Fehler", description: error.message || "Ein unbekannter Fehler ist aufgetreten." });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]">Lädt...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-4 px-2 sm:mt-8 sm:px-0 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Meine Anmeldungen</h1>

      <div className="flex gap-2">
        <Input
          placeholder="Private Party-ID eingeben"
          value={inviteLink}
          onChange={(e) => setInviteLink(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleInviteLinkSubmit} disabled={loading}>
          Hinzufügen
        </Button>
      </div>
      
      {parties.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          Sie sind für keine Parties angemeldet.
        </div>
      ) : (
        parties.map(party => (
          <PartyCard
            key={party.id}
            party={party}
            host={hosts[party.created_by]}
            likesCount={likesCount[party.id] || 0}
            attendeesCount={attendeesCount[party.id] || 0}
          />
        ))
      )}
    </div>
  );
};

export default MyAttendance;
