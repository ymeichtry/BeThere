
-- Tabelle für Party-Anmeldungen (RSVP)
CREATE TABLE public.party_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(party_id, user_id)
);

-- RLS für party_attendees
ALTER TABLE public.party_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view party attendees" ON public.party_attendees
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own party attendance" ON public.party_attendees
  FOR ALL USING (auth.uid() = user_id);

-- Tabelle für Party-Kommentare
CREATE TABLE public.party_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS für party_comments
ALTER TABLE public.party_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view party comments" ON public.party_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.party_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.party_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.party_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Tabelle für Party-Likes
CREATE TABLE public.party_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(party_id, user_id)
);

-- RLS für party_likes
ALTER TABLE public.party_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view party likes" ON public.party_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON public.party_likes
  FOR ALL USING (auth.uid() = user_id);
