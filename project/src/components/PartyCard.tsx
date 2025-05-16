import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Music, Calendar, DollarSign, Lock, Unlock } from 'lucide-react';
import { Party } from '../lib/supabase';
import { format } from 'date-fns';

interface PartyCardProps {
  party: Party;
}

const PartyCard: React.FC<PartyCardProps> = ({ party }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-white rounded-xl shadow-sm overflow-hidden mb-4 border border-neutral-200"
    >
      <Link to={`/party/${party.id}`}>
        <div className="relative">
          {/* Party image or gradient placeholder */}
          <div 
            className="h-40 bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center"
          >
            <h3 className="text-2xl font-bold text-white px-4 text-center">
              {party.title}
            </h3>
          </div>
          
          {/* Public/Private indicator */}
          <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full shadow-sm">
            {party.is_public ? 
              <Unlock size={16} className="text-success-500" /> : 
              <Lock size={16} className="text-warning-500" />
            }
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex flex-col space-y-2">
            {/* Location */}
            <div className="flex items-center text-sm">
              <MapPin size={16} className="text-neutral-500 mr-2 flex-shrink-0" />
              <span className="text-neutral-700 truncate">{party.location}</span>
            </div>
            
            {/* Date */}
            <div className="flex items-center text-sm">
              <Calendar size={16} className="text-neutral-500 mr-2 flex-shrink-0" />
              <span className="text-neutral-700">
                {format(new Date(party.date), 'PPP')} at {format(new Date(party.date), 'p')}
              </span>
            </div>
            
            {/* Entry fee if it exists */}
            {party.entry_fee && party.entry_fee > 0 && (
              <div className="flex items-center text-sm">
                <DollarSign size={16} className="text-neutral-500 mr-2 flex-shrink-0" />
                <span className="text-neutral-700">
                  {party.entry_fee.toFixed(2)} €
                </span>
              </div>
            )}
            
            {/* Music genre if it exists */}
            {party.music_genre && (
              <div className="flex items-center text-sm">
                <Music size={16} className="text-neutral-500 mr-2 flex-shrink-0" />
                <span className="text-neutral-700">{party.music_genre}</span>
              </div>
            )}
          </div>
          
          {/* CTA Button */}
          <div className="mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              View Details
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PartyCard;