import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './profileicon.css';

const ProfileIcon = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/profile');
  };

  return (
    <div className="profile-icon" onClick={handleClick}>
      <FaUserCircle size={32} />
    </div>
  );
};

export default ProfileIcon;