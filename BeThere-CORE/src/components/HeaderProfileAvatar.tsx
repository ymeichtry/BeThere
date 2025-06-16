import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const HeaderProfileAvatar = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAvatar = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile avatar for header:", error);
          setAvatarUrl(null);
        } else if (data) {
          setAvatarUrl(data.avatar_url);
        }
      } else {
        setAvatarUrl(null);
      }
      setLoading(false);
    };

    fetchProfileAvatar();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfileAvatar(); // Re-fetch on auth state change
      } else {
        setAvatarUrl(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null; // Or a small loading spinner if desired
  }

  return (
    <Link to="/profile" className="ml-auto flex items-center gap-2 hover:underline p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border"
        />
      )}
      Profil
    </Link>
  );
};

export default HeaderProfileAvatar; 