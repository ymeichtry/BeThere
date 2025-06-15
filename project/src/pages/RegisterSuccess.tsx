import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Button from '../components/Button';

const RegisterSuccess: React.FC = () => {
  const navigate = useNavigate();

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/login');
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 border border-neutral-200 text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-100">
            <CheckCircle className="h-12 w-12 text-success-600" />
          </div>
        </motion.div>
        
        <h1 className="text-2xl font-bold text-neutral-800 mb-3">
          Registration Successful!
        </h1>
        
        <p className="text-neutral-600 mb-8">
          Your account has been created. You can now sign in with your credentials.
        </p>
        
        <Button 
          onClick={() => navigate('/login')}
          fullWidth
        >
          Continue to Login
        </Button>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-sm text-neutral-500"
        >
          Redirecting you to login page in a few seconds...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default RegisterSuccess;