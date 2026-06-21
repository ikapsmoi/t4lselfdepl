import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { HostDashboard } from '../dashboard/HostDashboard';
import { TravelerDashboard } from '../dashboard/TravelerDashboard';
import { AdminDashboard } from '../admin/AdminDashboard';
import { HomePage } from '../../pages/HomePage';

interface RoleBasedRouterProps {
  currentPage: string;
}

export const RoleBasedRouter: React.FC<RoleBasedRouterProps> = ({ currentPage }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-white mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2">Loading Travel4life...</h2>
          <p className="text-white opacity-80">Preparing your adventure dashboard</p>
        </div>
      </div>
    );
  }

  // Handle static pages that don't require authentication
  const staticPages = ['about', 'careers', 'terms', 'privacy', 'help', 'safety', 'trips'];
  if (staticPages.includes(currentPage)) {
    // Return the appropriate static page component
    // This would be handled by your existing routing logic
    return null;
  }

  // Handle dashboard routing based on user role
  if (user) {
    switch (currentPage) {
      case 'host-dashboard':
        return user.role === 'host' ? <HostDashboard /> : <HomePage />;
      case 'traveler-dashboard':
        return user.role === 'traveler' ? <TravelerDashboard /> : <HomePage />;
      case 'admin-dashboard':
        return user.role === 'admin' ? <AdminDashboard /> : <HomePage />;
      default:
        // Default dashboard based on user role
        switch (user.role) {
          case 'host':
            return <HostDashboard />;
          case 'admin':
            return <AdminDashboard />;
          default:
            return <TravelerDashboard />;
        }
    }
  }

  // Default to home page for unauthenticated users
  return <HomePage />;
};