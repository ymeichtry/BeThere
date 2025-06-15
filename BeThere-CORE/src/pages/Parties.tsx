
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
};

const Parties = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [hosts, setHosts] = useState<{ [id: string]: Profile }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchParties();
    // eslint-disable-next-line
  }, []);

  const fetchParties = async () => {
    setLoading(true);
    let { data: parties, error } = await supabase
      .from("parties")
      .select("id, title, location, datetime, genre, created_by, description, is_public, created_at")
      .eq("is_public", true)
      .order("datetime", { ascending: true });
    if (error) {
      setLoading(false);
      return;
    }
    setParties(parties || []);
    // Lade alle Hosts (nur einmal pro Host)
    const uniqueHostIds = Array.from(new Set((parties || []).map(p => p.created_by)));
    const { data: profiles } = await supabase.from("profiles").select("id, name, avatar_url").in("id", uniqueHostIds);
    const hostsById: { [id: string]: Profile } = {};
    profiles?.forEach(profile => {
      hostsById[profile.id] = profile;
    });
    setHosts(hostsById);
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]">Lädt...</div>;
  if (parties.length === 0) return <div className="text-gray-500 text-center mt-10">Keine öffentlichen Partys gefunden.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 flex flex-col gap-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Alle öffentlichen Partys</h1>
      {parties.map(party => (
        <div
          key={party.id}
          className="border rounded-lg shadow flex flex-col md:flex-row items-center gap-4 px-6 py-4 bg-white"
        >
          <div className="flex flex-col items-center min-w-[100px]">
            <img
              src={hosts[party.created_by]?.avatar_url || "/placeholder.svg"}
              alt="Host"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <span className="text-center text-sm mt-2">{hosts[party.created_by]?.name || "Host"}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">{party.title}</span>
              {!party.is_public && (<span className="ml-2 text-xs text-yellow-600 bg-yellow-200 rounded px-2">Privat</span>)}
            </div>
            <div className="mb-2 text-gray-600 whitespace-pre-line">{party.description}</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-1">
              <span className="font-medium">Ort:</span> <span>{party.location}</span>
              <span className="font-medium">Datum:</span> <span>{party.datetime && new Date(party.datetime).toLocaleString()}</span>
              <span className="font-medium">Genre:</span> <span>{party.genre ?? "-"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Parties;
