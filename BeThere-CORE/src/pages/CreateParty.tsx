import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const CreatePartyPage = () => {
  const [session, setSession] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    datetime: "",
    dresscode: "",
    genre: "",
    entry_fee: "",
    is_public: true,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Save as number if entry_fee is set
    const entry_fee = form.entry_fee !== "" ? Number(form.entry_fee) : null;
    const { error } = await supabase.from("parties").insert({
      ...form,
      datetime: form.datetime,
      entry_fee,
      created_by: session.user.id,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Fehler", description: error.message });
    } else {
      toast({ title: "Party erstellt!" });
      navigate("/parties");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-xl bg-white shadow flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-2">Party erstellen</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input name="title" value={form.title} onChange={handleChange} placeholder="Titel" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Beschreibung" className="border px-3 py-2 rounded focus:outline-none" />
        <Input name="location" value={form.location} onChange={handleChange} placeholder="Ort" required />
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
        <Button type="submit" disabled={loading}>{loading ? "Wird gespeichert..." : "Erstellen"}</Button>
      </form>
    </div>
  );
};
export default CreatePartyPage;
