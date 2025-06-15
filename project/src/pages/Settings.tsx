import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle, Save } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Settings: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState(profile?.username || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await updateProfile({ username });
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header title="Settings" />
      
      <div className="flex-1 p-4">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200"
        >
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100">
              <UserCircle className="h-10 w-10 text-primary-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Your username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile?.id ? profile.id : ''}
                disabled
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500"
              />
              <p className="mt-1 text-xs text-neutral-500">Email cannot be changed</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              type="submit"
              fullWidth
              leftIcon={<Save size={18} />}
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Settings;