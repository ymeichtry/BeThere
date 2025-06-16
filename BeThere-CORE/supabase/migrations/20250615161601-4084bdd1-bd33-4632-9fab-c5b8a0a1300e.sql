
-- Tabelle zur Speicherung von Benutzerprofilen (linked via Supabase Auth 'users')
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabelle für Parties
CREATE TABLE public.parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  datetime timestamptz NOT NULL,
  dresscode text,
  genre text,
  entry_fee numeric,
  is_public boolean DEFAULT true,
  access_id uuid NOT NULL DEFAULT gen_random_uuid(), -- für private Partys/Links
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS für profiles: Nur der eingeloggte Nutzer sieht/ändert sein Profil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Self profile read" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Self profile update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS für parties: 
-- Lesen: Öffentlich=alle, Privat=nur per Link ODER Besitzer
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public parties listable" ON public.parties
  FOR SELECT USING (is_public OR created_by = auth.uid());
CREATE POLICY "Preview private party by link" ON public.parties
  FOR SELECT USING (true);
-- Erstellen: Jeder angemeldete Nutzer kann Party erstellen
CREATE POLICY "Users can create parties" ON public.parties
  FOR INSERT WITH CHECK (created_by = auth.uid());
-- Updaten/Löschen: Nur Besitzer
CREATE POLICY "Party owner can update" ON public.parties
  FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Party owner can delete" ON public.parties
  FOR DELETE USING (created_by = auth.uid());

-- Trigger: Automatisches Anlegen eines Profils bei Registrierung
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name', NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars'); 