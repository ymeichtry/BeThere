import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import Header from '../components/Header';
import Button from '../components/Button';
import { MapPin, Calendar, Clock, Music, DollarSign, Users, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface FormInputs {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  entryFee: string;
  musicGenre: string;
  isPublic: boolean;
}

const CreateParty: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      isPublic: true
    }
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!user) {
      toast.error('You must be logged in to create a party');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format date and time
      const dateTime = new Date(`${data.date}T${data.time}`);
      
      // Get coordinates for the location (in a real app, would use geocoding service)
      // For this demo, we'll use random coordinates near the specified location
      const baseLatitude = 51.0; // Example base coordinates in Germany
      const baseLongitude = 10.0;
      const randomLat = baseLatitude + (Math.random() * 2 - 1);
      const randomLng = baseLongitude + (Math.random() * 2 - 1);
      
      const { data: party, error } = await supabase
        .from('parties')
        .insert({
          title: data.title,
          description: data.description,
          host_id: user.id,
          location: data.location,
          latitude: randomLat,
          longitude: randomLng,
          date: dateTime.toISOString(),
          entry_fee: data.entryFee ? parseFloat(data.entryFee) : 0,
          music_genre: data.musicGenre,
          is_public: data.isPublic
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Party created successfully!');
      navigate(`/party/${party.id}`);
    } catch (error: any) {
      console.error('Error creating party:', error);
      toast.error('Failed to create party');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header title="Create Party" />
      
      <div className="flex-1 p-4">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl shadow-sm p-4 border border-neutral-200"
        >
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                Party Title *
              </label>
              <input
                id="title"
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.title ? 'border-error-300' : 'border-neutral-300'
                }`}
                placeholder="Summer Bash 2025"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-error-500">{errors.title.message}</p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Tell people about your party..."
                {...register('description')}
              />
            </div>
            
            {/* Location */}
            <div>
              <div className="flex items-center mb-1">
                <MapPin size={16} className="text-neutral-500 mr-1" />
                <label htmlFor="location" className="text-sm font-medium text-neutral-700">
                  Location *
                </label>
              </div>
              <input
                id="location"
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.location ? 'border-error-300' : 'border-neutral-300'
                }`}
                placeholder="123 Party Street, Berlin"
                {...register('location', { required: 'Location is required' })}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-error-500">{errors.location.message}</p>
              )}
            </div>
            
            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-1">
                  <Calendar size={16} className="text-neutral-500 mr-1" />
                  <label htmlFor="date" className="text-sm font-medium text-neutral-700">
                    Date *
                  </label>
                </div>
                <input
                  id="date"
                  type="date"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.date ? 'border-error-300' : 'border-neutral-300'
                  }`}
                  {...register('date', { required: 'Date is required' })}
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-error-500">{errors.date.message}</p>
                )}
              </div>
              
              <div>
                <div className="flex items-center mb-1">
                  <Clock size={16} className="text-neutral-500 mr-1" />
                  <label htmlFor="time" className="text-sm font-medium text-neutral-700">
                    Time *
                  </label>
                </div>
                <input
                  id="time"
                  type="time"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.time ? 'border-error-300' : 'border-neutral-300'
                  }`}
                  {...register('time', { required: 'Time is required' })}
                />
                {errors.time && (
                  <p className="mt-1 text-xs text-error-500">{errors.time.message}</p>
                )}
              </div>
            </div>
            
            {/* Entry Fee */}
            <div>
              <div className="flex items-center mb-1">
                <DollarSign size={16} className="text-neutral-500 mr-1" />
                <label htmlFor="entryFee" className="text-sm font-medium text-neutral-700">
                  Entry Fee (€)
                </label>
              </div>
              <input
                id="entryFee"
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="0.00"
                {...register('entryFee')}
              />
              <p className="mt-1 text-xs text-neutral-500">Leave empty for free entry</p>
            </div>
            
            {/* Music Genre */}
            <div>
              <div className="flex items-center mb-1">
                <Music size={16} className="text-neutral-500 mr-1" />
                <label htmlFor="musicGenre" className="text-sm font-medium text-neutral-700">
                  Music Genre
                </label>
              </div>
              <select
                id="musicGenre"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
                {...register('musicGenre')}
              >
                <option value="">Select a genre</option>
                <option value="Electronic">Electronic</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Rock">Rock</option>
                <option value="Pop">Pop</option>
                <option value="Techno">Techno</option>
                <option value="Latin">Latin</option>
                <option value="Jazz">Jazz</option>
                <option value="R&B">R&B</option>
                <option value="Mixed">Mixed</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Public/Private Toggle */}
            <div className="pt-2">
              <div className="flex items-center mb-2">
                <Users size={16} className="text-neutral-500 mr-1" />
                <label className="text-sm font-medium text-neutral-700">
                  Party Visibility
                </label>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="true"
                    checked={true}
                    {...register('isPublic')}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 border ${true ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'}`}>
                      {true && <div className="w-2 h-2 mx-auto mt-1 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center">
                      <Unlock size={14} className="text-success-500 mr-1" />
                      <span className="text-sm text-neutral-700">Public</span>
                    </div>
                  </div>
                </label>
                
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="false"
                    {...register('isPublic')}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 border ${false ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'}`}>
                      {false && <div className="w-2 h-2 mx-auto mt-1 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center">
                      <Lock size={14} className="text-warning-500 mr-1" />
                      <span className="text-sm text-neutral-700">Private (invite only)</span>
                    </div>
                  </div>
                </label>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Public parties will be visible to everyone
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
            >
              Create Party
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateParty;