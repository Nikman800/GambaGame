import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = cookies.get("TOKEN");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;