import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";

const CreatePartyPage = () => {
  const [session, setSession] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    datetime: "",
    dresscode: "",
    genre: "",
    entry_fee: "",
    is_public: true,
  });
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/auth");
      } else {
        setSession(data.session);
      }
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (editId) {
      (async () => {
        const { data, error } = await supabase.from("parties").select("*", { count: "exact" }).eq("id", editId).single();
        if (error || !data) {
          toast({ title: "Fehler", description: "Party konnte nicht geladen werden." });
          navigate("/my-parties");
          return;
        }
        setForm({
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          datetime: data.datetime ? data.datetime.slice(0, 16) : "",
          dresscode: data.dresscode || "",
          genre: data.genre || "",
          entry_fee: data.entry_fee?.toString() || "",
          is_public: data.is_public ?? true,
        });
      })();
    }
    // eslint-disable-next-line
  }, [editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && "checked" in e.target) {
      setForm(f => ({
        ...f,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm(f => ({
        ...f,
        [name]: value,
      }));
      if (name === "location") {
        setGeoError(null);
        setForm(f => ({ ...f, latitude: "", longitude: "" }));
      }
    }
  };

  const geocodeAddress = async () => {
    if (!form.location) return;
    setGeoLoading(true);
    setGeoError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        setForm(f => ({
          ...f,
          latitude: data[0].lat,
          longitude: data[0].lon,
        }));
        setGeoError(null);
      } else {
        setGeoError("Adresse nicht gefunden oder zu ungenau. Bitte präziser eingeben.");
        setForm(f => ({ ...f, latitude: "", longitude: "" }));
      }
    } catch (e) {
      setGeoError("Fehler beim Geocoding");
      setForm(f => ({ ...f, latitude: "", longitude: "" }));
    }
    setGeoLoading(false);
  };

  const handleLocationBlur = () => {
    if (form.location) {
      geocodeAddress();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const entry_fee = form.entry_fee !== "" ? Number(form.entry_fee) : null;
    const latitude = form.latitude !== "" ? Number(form.latitude) : null;
    const longitude = form.longitude !== "" ? Number(form.longitude) : null;
    let error;
    if (editId) {
      // Update
      const { error: updateError } = await supabase.from("parties").update({
        ...form,
        latitude,
        longitude,
        datetime: form.datetime,
        entry_fee,
      }).eq("id", editId);
      error = updateError;
      if (!error) {
        NotificationBell.addNotification({
          user_id: session.user.id,
          type: 'party_edited',
          title: 'Party bearbeitet',
          message: `Die Party "${form.title}" wurde erfolgreich bearbeitet.`
        });
      }
    } else {
      // Insert
      const { error: insertError } = await supabase.from("parties").insert({
        ...form,
        latitude,
        longitude,
        datetime: form.datetime,
        entry_fee,
        created_by: session.user.id,
      });
      error = insertError;
      if (!error) {
        NotificationBell.addNotification({
          user_id: session.user.id,
          type: 'party_created',
          title: 'Party erstellt',
          message: `Die Party "${form.title}" wurde erfolgreich erstellt.`
        });
      }
    }
    setLoading(false);
    if (error) {
      toast({ title: "Fehler", description: error.message });
    } else {
      toast({ title: editId ? "Party aktualisiert!" : "Party erstellt!" });
      navigate("/parties");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-xl bg-white shadow flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-2">{editId ? "Party bearbeiten" : "Party erstellen"}</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input name="title" value={form.title} onChange={handleChange} placeholder="Titel" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Beschreibung" className="border px-3 py-2 rounded focus:outline-none" />
        <Input
          name="location"
          value={form.location}
          onChange={handleChange}
          onBlur={handleLocationBlur}
          placeholder="Adresse (z.B. Musterstr. 1, Zürich)"
          required
        />
        <div className="flex gap-2">
          <Input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Breitengrad" required readOnly className="w-1/2" />
          <Input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Längengrad" required readOnly className="w-1/2" />
        </div>
        {geoError && <div className="text-red-500 text-sm">{geoError}</div>}
        <div>
          <span className="block font-medium mb-1">Datum & Uhrzeit</span>
          <Input name="datetime" value={form.datetime} onChange={handleChange} type="datetime-local" required />
        </div>
        <Input name="dresscode" value={form.dresscode} onChange={handleChange} placeholder="Dresscode" />
        <Input name="genre" value={form.genre} onChange={handleChange} placeholder="Musikgenre" />
        <Input name="entry_fee" value={form.entry_fee} onChange={handleChange} type="number" step="0.01" placeholder="Eintritt (optional)" />
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_public} name="is_public" onChange={handleChange} id="is_public" />
          <label htmlFor="is_public">Öffentlich machen</label>
        </div>
        <Button type="submit" disabled={loading || !form.latitude || !form.longitude || !!geoError}>{loading ? "Wird gespeichert..." : (editId ? "Speichern" : "Erstellen")}</Button>
      </form>
    </div>
  );
};
export default CreatePartyPage;
