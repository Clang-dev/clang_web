import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useUser} from '../hooks/UserContext';

const ProtectedRoute = () => {
  const {user, loading} = useUser();

  if (loading) {
    // You can return a loading spinner or a blank page while checking auth
    return <div>Loading...</div>;
  }

  if (!user) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child route content
  return <Outlet />;
};

export default ProtectedRoute;