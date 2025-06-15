import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, MapPin, Calendar, Music, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import PartyCard from '../components/PartyCard';
import Button from '../components/Button';
import { supabase, Party } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('parties')
        .select('*, host:profiles(*)')
        .eq('is_public', true)
        .order('date', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setParties(data as Party[]);
    } catch (error: any) {
      toast.error('Failed to load parties');
      console.error('Error fetching parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterParties = () => {
    if (!searchQuery && !locationFilter && !genreFilter && !dateFilter) {
      return parties;
    }
    
    return parties.filter(party => {
      const matchesSearch = searchQuery 
        ? party.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (party.description && party.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
        
      const matchesLocation = locationFilter
        ? party.location.toLowerCase().includes(locationFilter.toLowerCase())
        : true;
        
      const matchesGenre = genreFilter
        ? party.music_genre && party.music_genre.toLowerCase().includes(genreFilter.toLowerCase())
        : true;
        
      const matchesDate = dateFilter
        ? new Date(party.date).toLocaleDateString().includes(dateFilter)
        : true;
        
      return matchesSearch && matchesLocation && matchesGenre && matchesDate;
    });
  };

  const filteredParties = filterParties();

  const resetFilters = () => {
    setLocationFilter('');
    setGenreFilter('');
    setDateFilter('');
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header 
        title="Discover Parties" 
        showBackButton={false}
        rightElement={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Sliders size={16} />}
          >
            Filter
          </Button>
        }
      />
      
      <div className="p-4">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search for parties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          />
          <SearchIcon className="absolute left-3 top-3.5 text-neutral-400" size={18} />
        </div>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 overflow-hidden"
            >
              <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Filters</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center mb-1">
                      <MapPin size={14} className="text-neutral-500 mr-1" />
                      <label className="text-xs text-neutral-600">Location</label>
                    </div>
                    <input
                      type="text"
                      placeholder="Filter by location"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1">
                      <Music size={14} className="text-neutral-500 mr-1" />
                      <label className="text-xs text-neutral-600">Music Genre</label>
                    </div>
                    <input
                      type="text"
                      placeholder="Filter by genre"
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1">
                      <Calendar size={14} className="text-neutral-500 mr-1" />
                      <label className="text-xs text-neutral-600">Date</label>
                    </div>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredParties.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">
                {filteredParties.length} {filteredParties.length === 1 ? 'party' : 'parties'} found
              </p>
              
              <div className="space-y-4">
                {filteredParties.map((party) => (
                  <PartyCard key={party.id} party={party} />
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <p className="text-neutral-500 mb-4">No parties found</p>
              <Button
                onClick={() => navigate('/create')}
                variant="outline"
              >
                Create a Party
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Search;