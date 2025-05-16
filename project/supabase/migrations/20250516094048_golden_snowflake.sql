/*
  # Initial schema setup for Party Planner application
  
  1. New Tables
    - profiles: User profile information
    - parties: Party event details
    - party_attendees: RSVP management
    - party_invites: Private party invitations
  
  2. Security
    - Enable RLS on all tables
    - Add policies for data access control
    - Set up user profile creation trigger
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (for user profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Parties table
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  date TIMESTAMPTZ NOT NULL,
  entry_fee FLOAT DEFAULT 0,
  music_genre TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Party attendees (for RSVPs)
CREATE TABLE IF NOT EXISTS party_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(party_id, profile_id)
);

-- Party invites (for private parties)
CREATE TABLE IF NOT EXISTS party_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(party_id, profile_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_invites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Parties policies
CREATE POLICY "Public parties are viewable by everyone" 
ON parties FOR SELECT USING (is_public = true OR host_id = auth.uid());

CREATE POLICY "Users can create their own parties" 
ON parties FOR INSERT WITH CHECK (host_id = auth.uid());

CREATE POLICY "Users can update their own parties" 
ON parties FOR UPDATE USING (host_id = auth.uid());

CREATE POLICY "Users can delete their own parties" 
ON parties FOR DELETE USING (host_id = auth.uid());

-- Party attendees policies
CREATE POLICY "Attendees are viewable by party host and attendee" 
ON party_attendees FOR SELECT USING (
  profile_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM parties WHERE id = party_id AND host_id = auth.uid())
);

CREATE POLICY "Users can RSVP to public parties or parties they're invited to" 
ON party_attendees FOR INSERT WITH CHECK (
  profile_id = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM parties 
      WHERE id = party_id AND is_public = true
    ) OR 
    EXISTS (
      SELECT 1 FROM party_invites 
      WHERE party_id = party_attendees.party_id AND profile_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own RSVP" 
ON party_attendees FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own RSVP" 
ON party_attendees FOR DELETE USING (profile_id = auth.uid());

-- Party invites policies
CREATE POLICY "Invites are viewable by invite recipient and party host" 
ON party_invites FOR SELECT USING (
  profile_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM parties WHERE id = party_id AND host_id = auth.uid())
);

CREATE POLICY "Only party hosts can send invites" 
ON party_invites FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM parties WHERE id = party_id AND host_id = auth.uid())
);

CREATE POLICY "Users can update status of invites sent to them" 
ON party_invites FOR UPDATE USING (
  (profile_id = auth.uid() AND NEW.party_id = OLD.party_id AND NEW.profile_id = OLD.profile_id) OR
  EXISTS (SELECT 1 FROM parties WHERE id = party_id AND host_id = auth.uid())
);

CREATE POLICY "Only hosts can delete invites" 
ON party_invites FOR DELETE USING (
  EXISTS (SELECT 1 FROM parties WHERE id = party_id AND host_id = auth.uid())
);

-- Function to handle new user sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  raw_data JSONB;
  username TEXT;
BEGIN
  raw_data := (row_to_json(NEW))::JSONB;
  
  -- Extract username from raw data or use email
  username := COALESCE(
    raw_data->'raw_user_meta_data'->>'username',
    raw_data->>'email'
  );
  
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    username,
    ''
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();