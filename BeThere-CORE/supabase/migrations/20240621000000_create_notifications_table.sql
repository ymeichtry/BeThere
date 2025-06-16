CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL, -- e.g., 'party_deleted', 'party_joined'
  title text NOT NULL,
  message text,
  read_at timestamptz, -- NULL if unread
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- No INSERT policy needed here as notifications will be created by triggers or admin functions 