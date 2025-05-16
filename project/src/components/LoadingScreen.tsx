import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-primary-500 border-r-primary-300 border-b-primary-100 border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.2
                }}
                style={{
                  width: `${4 - i * 0.5}rem`,
                  height: `${4 - i * 0.5}rem`,
                  opacity: 1 - i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-neutral-700"
        >
          Loading...
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-neutral-500 mt-2"
        >
          Preparing your parties
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;