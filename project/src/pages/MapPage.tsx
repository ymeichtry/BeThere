import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, List } from 'lucide-react';
import Header from '../components/Header';
import MapView from '../components/MapView';
import PartyCard from '../components/PartyCard';
import { supabase, Party } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const MapPage: React.FC = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>(undefined);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    fetchParties();
    getUserLocation();
  }, []);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parties')
        .select('*, host:profiles(*)')
        .eq('is_public', true)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Filter out parties without coordinates
      const partiesWithLocation = (data as Party[]).filter(
        party => party.latitude && party.longitude
      );
      
      setParties(partiesWithLocation);
    } catch (error: any) {
      toast.error('Failed to load parties');
      console.error('Error fetching parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude
          ]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a central location if user location is not available
          setUserLocation([51.165691, 10.451526]); // Germany center
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      setUserLocation([51.165691, 10.451526]); // Germany center
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header 
        title="Party Map" 
        showBackButton={false}
        rightElement={
          <button
            onClick={() => setShowList(!showList)}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            {showList ? 
              <MapPin size={20} className="text-neutral-700" /> : 
              <List size={20} className="text-neutral-700" />
            }
          </button>
        }
      />
      
      <div className="flex-1 relative">
        {!showList && (
          <div style={{ height: "calc(100vh - 120px)" }}>
            {!loading && userLocation && (
              <MapView parties={parties} userLocation={userLocation} />
            )}
          </div>
        )}
        
        {showList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4"
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : parties.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-neutral-500">
                  {parties.length} {parties.length === 1 ? 'party' : 'parties'} with location
                </p>
                
                <div className="space-y-4">
                  {parties.map((party) => (
                    <PartyCard key={party.id} party={party} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-neutral-500">No parties with location found</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MapPage;