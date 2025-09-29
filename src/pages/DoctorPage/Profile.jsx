import React from 'react';
import { useAuth } from '../../context/authContext';

const Profile = () => {
  const { user } = useAuth();
  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {user?.fullName}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
};

export default Profile;


