import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

export type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

export type Party = {
  id: string;
  title: string;
  description: string | null;
  host_id: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  entry_fee: number | null;
  music_genre: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  host?: Profile;
};

export type PartyAttendee = {
  id: string;
  party_id: string;
  profile_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
  updated_at: string;
  profile?: Profile;
};

export type PartyInvite = {
  id: string;
  party_id: string;
  profile_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  profile?: Profile;
};