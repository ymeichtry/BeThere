-- Tabelle für Party-Anmeldungen/Teilnehmer
CREATE TABLE public.attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  party_id uuid NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, party_id) -- Ein Benutzer kann sich nur einmal für eine Party anmelden
);

ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;

-- RLS für attendees:
-- Jeder angemeldete Nutzer kann sich für eine Party anmelden
CREATE POLICY "Users can attend parties" ON public.attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Nutzer können sehen, welche Partys sie besuchen
CREATE POLICY "Users can view their attendance" ON public.attendees
  FOR SELECT USING (auth.uid() = user_id);

-- Party-Besitzer können sehen, wer sich für ihre Party angemeldet hat
CREATE POLICY "Party owner can view attendees" ON public.attendees
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.parties WHERE id = party_id AND created_by = auth.uid()));

-- Nutzer können ihre Anmeldung stornieren
CREATE POLICY "Users can cancel attendance" ON public.attendees
  FOR DELETE USING (auth.uid() = user_id); 