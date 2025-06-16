
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PartyCard from "@/components/PartyCard";
import PartyFilters from "@/components/PartyFilters";

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

const Parties = () => {
  const [allParties, setAllParties] = useState<Party[]>([]);
  const [filteredParties, setFilteredParties] = useState<Party[]>([]);
  const [hosts, setHosts] = useState<{ [id: string]: Profile }>({});
  const [likesCount, setLikesCount] = useState<{ [id: string]: number }>({});
  const [attendeesCount, setAttendeesCount] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Available filter options
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) {
        fetchParties();
      } else {
        navigate("/auth");
      }
    };
    getSession();
  }, [navigate]);

  useEffect(() => {
    applyFilters();
  }, [allParties, searchTerm, selectedGenre, selectedLocation, dateFilter]);

  const fetchParties = async () => {
    setLoading(true);
    let { data: parties, error } = await supabase
      .from("parties")
      .select("*")
      .eq("is_public", true)
      .order("datetime", { ascending: true });
    
    if (error) {
      setLoading(false);
      return;
    }
    
    setAllParties(parties || []);
    
    // Extract unique genres and locations for filters
    const genres = Array.from(new Set((parties || []).map(p => p.genre).filter(Boolean))) as string[];
    const locations = Array.from(new Set((parties || []).map(p => p.location).filter(Boolean))) as string[];
    setAvailableGenres(genres);
    setAvailableLocations(locations);
    
    // Load hosts
    const uniqueHostIds = Array.from(new Set((parties || []).map(p => p.created_by)));
    const { data: profiles } = await supabase.from("profiles").select("id, name, avatar_url").in("id", uniqueHostIds);
    const hostsById: { [id: string]: Profile } = {};
    profiles?.forEach(profile => {
      hostsById[profile.id] = profile;
    });
    setHosts(hostsById);

    // Load stats
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

  const applyFilters = () => {
    let filtered = [...allParties];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(party =>
        party.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Genre filter
    if (selectedGenre !== "all") {
      filtered = filtered.filter(party => party.genre === selectedGenre);
    }

    // Location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter(party => party.location === selectedLocation);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      filtered = filtered.filter(party => {
        const partyDate = new Date(party.datetime);
        switch (dateFilter) {
          case "today":
            return partyDate >= today && partyDate < tomorrow;
          case "tomorrow":
            return partyDate >= tomorrow && partyDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
          case "week":
            return partyDate >= today && partyDate <= weekEnd;
          case "month":
            return partyDate >= today && partyDate <= monthEnd;
          default:
            return true;
        }
      });
    }

    setFilteredParties(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenre("all");
    setSelectedLocation("all");
    setDateFilter("all");
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]">Lädt...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alle öffentlichen Partys</h1>
        <Button onClick={() => navigate("/create-party")}>
          Party erstellen
        </Button>
      </div>

      <PartyFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onClearFilters={clearFilters}
        genres={availableGenres}
        locations={availableLocations}
      />
      
      {filteredParties.length === 0 ? (
        <div className="text-gray-500 text-center mt-10">
          {allParties.length === 0 ? "Keine öffentlichen Partys gefunden." : "Keine Partys entsprechen den Filterkriterien."}
        </div>
      ) : (
        filteredParties.map(party => (
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

export default Parties;
