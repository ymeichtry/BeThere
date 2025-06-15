import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Music, DollarSign, UserCircle, Share2, Users, ThumbsUp, Clock } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Party, PartyAttendee, Profile } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import MapView from '../components/MapView';

const PartyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [party, setParty] = useState<Party | null>(null);
  const [host, setHost] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState<PartyAttendee[]>([]);
  const [userRsvp, setUserRsvp] = useState<PartyAttendee | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (id) {
      fetchParty(id);
      if (user) {
        fetchUserRsvp(id);
      }
      fetchAttendees(id);
    }
  }, [id, user]);

  const fetchParty = async (partyId: string) => {
    try {
      const { data, error } = await supabase
        .from('parties')
        .select('*, host:profiles(*)')
        .eq('id', partyId)
        .single();
      
      if (error) throw error;
      
      setParty(data as Party);
      setHost(data.host as Profile);
    } catch (error: any) {
      console.error('Error fetching party:', error);
      toast.error('Failed to load party details');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async (partyId: string) => {
    try {
      const { data, error } = await supabase
        .from('party_attendees')
        .select('*, profile:profiles(*)')
        .eq('party_id', partyId)
        .eq('status', 'going');
      
      if (error) throw error;
      
      setAttendees(data as PartyAttendee[]);
    } catch (error: any) {
      console.error('Error fetching attendees:', error);
    }
  };

  const fetchUserRsvp = async (partyId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('party_attendees')
        .select('*')
        .eq('party_id', partyId)
        .eq('profile_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "No rows returned" - this is expected if user hasn't RSVP'd
        console.error('Error fetching user RSVP:', error);
      }
      
      setUserRsvp(data as PartyAttendee || null);
    } catch (error: any) {
      console.error('Error fetching user RSVP:', error);
    }
  };

  const handleRsvp = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!user || !party) return;
    
    setRsvpLoading(true);
    
    try {
      if (userRsvp) {
        // Update existing RSVP
        const { error } = await supabase
          .from('party_attendees')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', userRsvp.id);
        
        if (error) throw error;
      } else {
        // Create new RSVP
        const { error } = await supabase
          .from('party_attendees')
          .insert({
            party_id: party.id,
            profile_id: user.id,
            status
          });
        
        if (error) throw error;
      }
      
      // Refresh RSVP and attendees
      await fetchUserRsvp(party.id);
      await fetchAttendees(party.id);
      
      toast.success(`You're ${status === 'going' ? 'attending' : status === 'maybe' ? 'maybe attending' : 'not attending'} this party!`);
    } catch (error: any) {
      console.error('Error updating RSVP:', error);
      toast.error('Failed to update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleShare = async () => {
    if (!party) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: party.title,
          text: `Check out this party: ${party.title}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Party link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-neutral-500 mb-4">Party not found</p>
          <Button onClick={() => navigate('/search')} variant="outline">
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header 
        title={party.title} 
        rightElement={
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <Share2 size={18} className="text-neutral-700" />
          </button>
        }
      />
      
      <div className="flex-1">
        {/* Party Banner */}
        <div className="relative h-48 bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-white px-4 text-center">
            {party.title}
          </h1>
          
          {/* Public/Private badge */}
          <div className="absolute top-4 right-4 bg-white/90 py-1 px-3 rounded-full shadow-sm text-xs font-medium flex items-center">
            {party.is_public ? 
              <span className="text-success-600">Public</span> : 
              <span className="text-warning-600">Private</span>
            }
          </div>
        </div>
        
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-4 border border-neutral-200 -mt-10 relative z-10"
          >
            {/* Party Info */}
            <div className="space-y-4">
              {/* Host info */}
              <div className="flex items-center">
                <UserCircle size={24} className="text-neutral-500 mr-2" />
                <div>
                  <p className="text-sm text-neutral-500">Hosted by</p>
                  <p className="font-medium text-neutral-800">{host?.username}</p>
                </div>
              </div>
              
              {/* Date and Time */}
              <div className="flex items-start">
                <Calendar size={24} className="text-neutral-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-neutral-500">Date & Time</p>
                  <p className="font-medium text-neutral-800">
                    {format(new Date(party.date), 'PPPP')}
                  </p>
                  <p className="text-neutral-700">
                    {format(new Date(party.date), 'p')}
                  </p>
                </div>
              </div>
              
              {/* Location */}
              <div className="flex items-start">
                <MapPin size={24} className="text-neutral-500 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-500">Location</p>
                  <p className="font-medium text-neutral-800">{party.location}</p>
                  
                  {/* Show/Hide Map button */}
                  {party.latitude && party.longitude && (
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="text-primary-600 text-sm font-medium mt-1 hover:text-primary-700"
                    >
                      {showMap ? 'Hide Map' : 'Show Map'}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Conditional Map View */}
              {showMap && party.latitude && party.longitude && (
                <div className="h-48 rounded-lg overflow-hidden border border-neutral-200">
                  <MapView
                    parties={[party]}
                    userLocation={party.latitude && party.longitude ? [party.latitude, party.longitude] : undefined}
                  />
                </div>
              )}
              
              {/* Entry Fee if exists */}
              {party.entry_fee !== null && party.entry_fee > 0 && (
                <div className="flex items-center">
                  <DollarSign size={24} className="text-neutral-500 mr-2" />
                  <div>
                    <p className="text-sm text-neutral-500">Entry Fee</p>
                    <p className="font-medium text-neutral-800">{party.entry_fee.toFixed(2)} €</p>
                  </div>
                </div>
              )}
              
              {/* Music Genre if exists */}
              {party.music_genre && (
                <div className="flex items-center">
                  <Music size={24} className="text-neutral-500 mr-2" />
                  <div>
                    <p className="text-sm text-neutral-500">Music</p>
                    <p className="font-medium text-neutral-800">{party.music_genre}</p>
                  </div>
                </div>
              )}
              
              {/* Description if exists */}
              {party.description && (
                <div className="border-t border-neutral-200 pt-4 mt-4">
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">About this party</h3>
                  <p className="text-neutral-700 whitespace-pre-line">{party.description}</p>
                </div>
              )}
              
              {/* Attendees */}
              <div className="border-t border-neutral-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-neutral-800">Who's coming</h3>
                  <span className="text-sm text-neutral-500">
                    {attendees.length} {attendees.length === 1 ? 'person' : 'people'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {attendees.slice(0, 8).map((attendee) => (
                    <div key={attendee.id} className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 text-sm font-bold">
                        {attendee.profile?.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-neutral-600 mt-1">
                        {attendee.profile?.username.substring(0, 8)}
                        {attendee.profile?.username.length > 8 ? '...' : ''}
                      </span>
                    </div>
                  ))}
                  
                  {attendees.length > 8 && (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-700 text-sm font-medium">
                        +{attendees.length - 8}
                      </div>
                      <span className="text-xs text-neutral-600 mt-1">More</span>
                    </div>
                  )}
                  
                  {attendees.length === 0 && (
                    <p className="text-neutral-500 text-sm">No one has RSVP'd yet. Be the first!</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* RSVP Section */}
            {user && user.id !== party.host_id && (
              <div className="mt-6 border-t border-neutral-200 pt-4">
                <h3 className="text-lg font-medium text-neutral-800 mb-3">Are you attending?</h3>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleRsvp('going')}
                    variant={userRsvp?.status === 'going' ? 'primary' : 'outline'}
                    leftIcon={<ThumbsUp size={16} />}
                    isLoading={rsvpLoading}
                    className="flex-1"
                  >
                    Going
                  </Button>
                  
                  <Button
                    onClick={() => handleRsvp('maybe')}
                    variant={userRsvp?.status === 'maybe' ? 'primary' : 'outline'}
                    leftIcon={<Clock size={16} />}
                    isLoading={rsvpLoading}
                    className="flex-1"
                  >
                    Maybe
                  </Button>
                  
                  <Button
                    onClick={() => handleRsvp('not_going')}
                    variant={userRsvp?.status === 'not_going' ? 'danger' : 'outline'}
                    isLoading={rsvpLoading}
                    className="flex-1"
                  >
                    Can't Go
                  </Button>
                </div>
              </div>
            )}
            
            {/* Host Controls */}
            {user && user.id === party.host_id && (
              <div className="mt-6 border-t border-neutral-200 pt-4">
                <h3 className="text-lg font-medium text-neutral-800 mb-3">Host Controls</h3>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(`/party/${party.id}/edit`)}
                    variant="outline"
                    fullWidth
                  >
                    Edit Party
                  </Button>
                  
                  <Button
                    onClick={() => navigate(`/party/${party.id}/guests`)}
                    variant="outline"
                    leftIcon={<Users size={16} />}
                    fullWidth
                  >
                    Manage Guest List
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PartyDetail;