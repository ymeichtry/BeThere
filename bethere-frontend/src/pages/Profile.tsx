import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-3xl text-indigo-600">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {user?.email}
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaSignOutAlt className="mr-2" />
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 