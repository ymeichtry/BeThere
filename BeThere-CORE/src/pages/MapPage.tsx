import { useEffect, useState } from 'react';
import Map, { Marker, NavigationControl, ViewStateChangeEvent } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Users, Calendar, MapPin, Music } from 'lucide-react';

interface Party {
  id: string;
  title: string;
  latitude?: number | null;
  longitude?: number | null;
  // Weitere Felder nach Bedarf
}

interface PartyDetails {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  datetime?: string | null;
  genre?: string | null;
  entry_fee?: number | null;
  created_by?: string;
}

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

const MapPage = () => {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState({
    longitude: 8.5417,
    latitude: 47.3769,
    zoom: 12
  });
  const [userLocation, setUserLocation] = useState<[number, number]>([8.5417, 47.3769]); // Default to Zurich
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [partyDetails, setPartyDetails] = useState<PartyDetails | null>(null);
  const [host, setHost] = useState<Profile | null>(null);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [attendeesCount, setAttendeesCount] = useState<number>(0);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(newLocation);
          setViewState(prev => ({
            ...prev,
            longitude: newLocation[0],
            latitude: newLocation[1]
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // Echte Partys aus Supabase laden
    const fetchParties = async () => {
      const { data, error } = await supabase
        .from('parties')
        .select('id, title, latitude, longitude')
        .eq('is_public', true);
      if (error) {
        console.error('Fehler beim Laden der Partys:', error);
        return;
      }
      // Nur Partys mit gültigen Koordinaten anzeigen
      setParties((data || []).filter(p => p.latitude && p.longitude));
    };
    fetchParties();

    // Session für Like-Button
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  useEffect(() => {
    if (!selectedParty) {
      setPartyDetails(null);
      setHost(null);
      setLikesCount(0);
      setIsLiked(false);
      setAttendeesCount(0);
      return;
    }
    setLoadingDetails(true);
    // Details, Host, Likes, Attendees laden
    const fetchDetails = async () => {
      const { data: partyData } = await supabase
        .from('parties')
        .select('*')
        .eq('id', selectedParty.id)
        .single();
      setPartyDetails(partyData);
      // Host
      if (partyData?.created_by) {
        const { data: hostData } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('id', partyData.created_by)
          .single();
        setHost(hostData);
      }
      // Likes
      const { count: likesCountData } = await supabase
        .from('party_likes')
        .select('*', { count: 'exact' })
        .eq('party_id', selectedParty.id);
      setLikesCount(likesCountData || 0);
      // Attendees
      const { count: attendeesCountData } = await supabase
        .from('party_attendees')
        .select('*', { count: 'exact' })
        .eq('party_id', selectedParty.id)
        .eq('status', 'attending');
      setAttendeesCount(attendeesCountData || 0);
      // Like-Status
      if (session?.user) {
        const { data: userLike } = await supabase
          .from('party_likes')
          .select('id')
          .eq('party_id', selectedParty.id)
          .eq('user_id', session.user.id)
          .maybeSingle();
        setIsLiked(!!userLike);
      }
      setLoadingDetails(false);
    };
    fetchDetails();
  }, [selectedParty, session]);

  const handleLike = async () => {
    if (!session?.user || !selectedParty) return;
    if (isLiked) {
      const { error } = await supabase
        .from('party_likes')
        .delete()
        .eq('party_id', selectedParty.id)
        .eq('user_id', session.user.id);
      if (!error) {
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      }
    } else {
      const { error } = await supabase
        .from('party_likes')
        .insert({ party_id: selectedParty.id, user_id: session.user.id });
      if (!error) {
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    }
  };

  const handleMarkerClick = (party: Party) => {
    setSelectedParty(party);
  };

  const onMove = (evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  };

  const closeModal = () => setSelectedParty(null);

  return (
    <div className="relative h-screen w-full">
      <div className="h-full w-full">
        <Map
          {...viewState}
          onMove={onMove}
          mapLib={maplibregl}
          mapStyle="https://tiles.stadiamaps.com/styles/osm_bright.json"
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl />
          {/* User location marker */}
          <Marker longitude={userLocation[0]} latitude={userLocation[1]}>
            <div style={{
              width: 24,
              height: 24,
              background: 'radial-gradient(circle at 50% 50%, #3b82f6 70%, #1e40af 100%)',
              borderRadius: '50%',
              border: '2px solid #fff',
              boxShadow: '0 0 8px #3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }} />
          </Marker>
          {/* Party markers */}
          {parties.map((party) => (
            <Marker
              key={party.id}
              longitude={party.longitude!}
              latitude={party.latitude!}
              color="#ff0000"
              onClick={() => handleMarkerClick(party)}
            />
          ))}
        </Map>
      </div>
      {/* Side Panel für Party-Details */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] z-50 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${selectedParty ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col`}
        style={{ boxShadow: selectedParty ? 'rgba(0,0,0,0.2) -4px 0px 24px' : undefined }}
      >
        {selectedParty && (
          <div className="relative h-full flex flex-col">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
              aria-label="Close"
            >
              ×
            </button>
            {loadingDetails ? (
              <div className="flex-1 flex items-center justify-center">Lädt...</div>
            ) : partyDetails && (
              <div className="p-8 pt-16 flex-1 flex flex-col gap-4 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-2">{partyDetails.title}</h2>
                {partyDetails.description && <div className="mb-2 text-gray-700">{partyDetails.description}</div>}
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span>{partyDetails.datetime ? new Date(partyDetails.datetime).toLocaleString() : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span>{partyDetails.location}</span>
                </div>
                {partyDetails.genre && (
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Music className="w-5 h-5 text-purple-500" />
                    <span>{partyDetails.genre}</span>
                  </div>
                )}
                {partyDetails.entry_fee && (
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <span className="font-medium">Eintritt: {partyDetails.entry_fee}€</span>
                  </div>
                )}
                {host && (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={host.avatar_url || '/placeholder.svg'} alt="Host" className="w-10 h-10 rounded-full object-cover border" />
                    <span className="text-sm">Host: {host.name || 'Unbekannt'}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>{attendeesCount} Teilnehmer</span>
                  </div>
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 px-3 py-1 rounded border ${isLiked ? 'bg-red-100 border-red-400 text-red-600' : 'bg-gray-100 border-gray-300 text-gray-600'} transition`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{likesCount}</span>
                  </button>
                </div>
                <button
                  onClick={() => navigate(`/party/${partyDetails.id}`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-8 w-full"
                >
                  View Full Details
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage; 