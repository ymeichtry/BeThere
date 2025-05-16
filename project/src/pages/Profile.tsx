import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pencil, LogOut, CalendarClock, Users } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import PartyCard from '../components/PartyCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Party } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [userParties, setUserParties] = useState<Party[]>([]);
  const [attendingParties, setAttendingParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hosting' | 'attending'>('hosting');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserParties();
      fetchAttendingParties();
    }
  }, [user]);

  const fetchUserParties = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('host_id', user.id)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      setUserParties(data as Party[]);
    } catch (error: any) {
      console.error('Error fetching hosted parties:', error);
    }
  };

  const fetchAttendingParties = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('party_attendees')
        .select('party_id, party:parties(*)')
        .eq('profile_id', user.id)
        .eq('status', 'going');
      
      if (error) throw error;
      
      const parties = data.map(item => item.party) as Party[];
      setAttendingParties(parties);
    } catch (error: any) {
      console.error('Error fetching attending parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header 
        title="Profile" 
        showBackButton={false} 
        rightElement={
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <Pencil size={18} className="text-neutral-700" />
          </button>
        }
      />
      
      <div className="flex-1 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200 mb-6"
        >
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary-500 text-2xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">{profile.username}</h2>
                <p className="text-primary-50">{user?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-neutral-500">Parties Hosted</div>
                <div className="text-xl font-semibold">{userParties.length}</div>
              </div>
              
              <div>
                <div className="text-sm text-neutral-500">Parties Attending</div>
                <div className="text-xl font-semibold">{attendingParties.length}</div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut size={16} />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </motion.div>
        
        <div className="mb-4">
          <div className="flex border-b border-neutral-200">
            <button
              className={`flex items-center justify-center py-3 px-4 text-sm font-medium ${
                activeTab === 'hosting'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
              onClick={() => setActiveTab('hosting')}
            >
              <CalendarClock size={16} className="mr-2" />
              Hosting
            </button>
            
            <button
              className={`flex items-center justify-center py-3 px-4 text-sm font-medium ${
                activeTab === 'attending'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
              onClick={() => setActiveTab('attending')}
            >
              <Users size={16} className="mr-2" />
              Attending
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'hosting' && (
              <>
                {userParties.length > 0 ? (
                  <div className="space-y-4">
                    {userParties.map((party) => (
                      <PartyCard key={party.id} party={party} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-500 mb-4">You haven't hosted any parties yet</p>
                    <Button
                      onClick={() => navigate('/create')}
                      variant="outline"
                    >
                      Create Your First Party
                    </Button>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'attending' && (
              <>
                {attendingParties.length > 0 ? (
                  <div className="space-y-4">
                    {attendingParties.map((party) => (
                      <PartyCard key={party.id} party={party} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-500 mb-4">You're not attending any parties yet</p>
                    <Button
                      onClick={() => navigate('/search')}
                      variant="outline"
                    >
                      Discover Parties
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;