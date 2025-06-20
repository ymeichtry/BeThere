import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";

const ProfilePage = () => {
  const [profile, setProfile] = useState<{ id: string; name: string | null; avatar_url: string | null }>({ id: "", name: "", avatar_url: null });
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate("/auth");
        return;
      }

      const { user } = session.session;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) {
        toast({ title: "Fehler", description: error.message });
        navigate("/auth");
      } else {
        setProfile(data);
        setName(data.name || "");
        setLoading(false);
        console.log("Fetched profile avatar_url:", data.avatar_url);
      }
    };
    getProfile();
  }, [navigate]);

  const handleNameUpdate = async () => {
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("id", profile.id);
    setLoading(false);
    if (error) toast({ title: "Fehler", description: error.message });
    else {
      toast({ title: "Profil aktualisiert", description: "Dein Name wurde aktualisiert." });
      setProfile(prev => ({ ...prev, name }));
      NotificationBell.addNotification({
        user_id: profile.id,
        type: 'profile_updated',
        title: 'Profil aktualisiert',
        message: 'Dein Name wurde erfolgreich geändert.',
        read_at: null
      });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // Erstelle einen eindeutigen Dateinamen
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      // Upload zu Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Hole die öffentliche URL
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Debugging: Log the generated public URL
      console.log("Generated Public URL:", data.publicUrl);

      // Aktualisiere das Profil mit der neuen URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", profile.id);

      if (updateError) {
        throw updateError;
      }

      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      toast({ title: "Profilbild aktualisiert" });
      NotificationBell.addNotification({
        user_id: profile.id,
        type: 'avatar_updated',
        title: 'Profilbild aktualisiert',
        message: 'Dein Profilbild wurde erfolgreich geändert.',
        read_at: null
      });
    } catch (error: unknown) {
      toast({ 
        title: "Fehler beim Upload", 
        description: (error as Error).message || "Unbekannter Fehler" 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Abgemeldet" });
    navigate("/auth");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Lädt ...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow bg-white flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Profil</h1>
      <div className="flex flex-col items-center gap-2">
        <img
          src={profile.avatar_url || "/placeholder.svg"}
          alt="Avatar"
          className="w-24 h-24 object-cover rounded-full border"
        />
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Lädt hoch..." : "Profilbild ändern"}
        </Button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleUpload}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Name</label>
        <Input value={name} onChange={e => setName(e.target.value)} />
        <Button className="mt-2" onClick={handleNameUpdate} disabled={loading}>
          Speichern
        </Button>
      </div>
      <Button variant="destructive" onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default ProfilePage;
