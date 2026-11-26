import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import strings from '../constants/strings.json';

export function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  const activeUser = user || (() => {
    try {
      const saved = localStorage.getItem('cineforge_guest_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  if (isLoading && !activeUser) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-stone-500 animate-pulse">{strings.common.loading}</div>
      </div>
    );
  }

  if (!activeUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
