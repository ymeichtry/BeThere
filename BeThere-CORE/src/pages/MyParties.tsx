import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PartyCard from "@/components/PartyCard";
import { Plus } from "lucide-react";

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

const MyParties = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [hosts, setHosts] = useState<{ [id: string]: Profile }>({});
  const [likesCount, setLikesCount] = useState<{ [id: string]: number }>({});
  const [attendeesCount, setAttendeesCount] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) {
        fetchMyParties();
      } else {
        navigate("/auth");
      }
    };
    getSession();
  }, [navigate]);

  const fetchMyParties = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let { data: parties, error } = await supabase
      .from("parties")
      .select("*")
      .eq("created_by", user.id)
      .order("datetime", { ascending: true });
    
    if (error) {
      setLoading(false);
      return;
    }
    
    setParties(parties || []);
    
    // Host-Profile laden
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      setHosts({ [user.id]: profile });
    }

    // Stats laden
    if (parties && parties.length > 0) {
      const partyIds = parties.map(p => p.id);
      
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

  const handleEdit = (party: Party) => {
    navigate(`/create-party?edit=${party.id}`);
  };

  const handleDelete = (partyId: string) => {
    setParties(prev => prev.filter(p => p.id !== partyId));
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]">Lädt...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-4 px-2 sm:mt-8 sm:px-0 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Meine Parties</h1>
        <Button onClick={() => navigate("/create-party")} className="w-full sm:w-auto flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Neue Party erstellen
        </Button>
      </div>
      
      {parties.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p className="mb-4">Sie haben noch keine Parties erstellt.</p>
          <Button onClick={() => navigate("/create-party")} className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Erste Party erstellen
          </Button>
        </div>
      ) : (
        parties.map(party => (
          <PartyCard
            key={party.id}
            party={party}
            host={hosts[party.created_by]}
            likesCount={likesCount[party.id] || 0}
            attendeesCount={attendeesCount[party.id] || 0}
            isOwner={true}
            showActions={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
};

export default MyParties;
