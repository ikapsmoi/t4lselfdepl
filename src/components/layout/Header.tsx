import React, { useState } from 'react';
import {Globe, Menu, X, User, Bell, Search, Plus, Plane } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { EnhancedAuthModal } from '../auth/EnhancedAuthModal';
import { CreatorApplicationModal } from '../creator/CreatorApplicationModal';

// Mock Instagram users data
const mockInstagramUsers = [
  { name: 'Sarah', handle: 'sarah_adventures' },
  { name: 'Mike', handle: 'mike_travels' },
  { name: 'Emma', handle: 'emma_explores' },
  { name: 'Alex', handle: 'alex_wanderlust' },
  { name: 'Priya', handle: 'priya_journeys' },
  { name: 'David', handle: 'david_discovers' },
  { name: 'Lisa', handle: 'lisa_roams' },
  { name: 'Ryan', handle: 'ryan_adventures' },
  { name: 'Maya', handle: 'maya_travels' },
  { name: 'Jake', handle: 'jake_explores' },
  { name: 'Zoe', handle: 'zoe_wanderer' },
  { name: 'Sam', handle: 'sam_nomad' },
  { name: 'Aria', handle: 'aria_globe' },
  { name: 'Leo', handle: 'leo_journey' },
  { name: 'Nina', handle: 'nina_quest' },
  { name: 'Max', handle: 'max_roamer' },
  { name: 'Ivy', handle: 'ivy_trails' },
  { name: 'Ben', handle: 'ben_voyager' },
  { name: 'Mia', handle: 'mia_explorer' },
  { name: 'Tom', handle: 'tom_adventure' },
  { name: 'Ava', handle: 'ava_travels' },
  { name: 'Dan', handle: 'dan_discovers' },
  { name: 'Zara', handle: 'zara_wanders' },
  { name: 'Luke', handle: 'luke_journeys' },
  { name: 'Ella', handle: 'ella_explores' },
  { name: 'Noah', handle: 'noah_nomadic' },
  { name: 'Chloe', handle: 'chloe_roams' },
  { name: 'Ethan', handle: 'ethan_trails' },
  { name: 'Grace', handle: 'grace_globe' },
  { name: 'Owen', handle: 'owen_odyssey' },
  { name: 'Ruby', handle: 'ruby_roamer' },
  { name: 'Finn', handle: 'finn_voyager' },
  { name: 'Luna', handle: 'luna_wanderlust' },
  { name: 'Cole', handle: 'cole_compass' },
  { name: 'Iris', handle: 'iris_journey' },
  { name: 'Jude', handle: 'jude_explorer' },
  { name: 'Sage', handle: 'sage_travels' },
  { name: 'Reed', handle: 'reed_roams' },
  { name: 'Wren', handle: 'wren_wanders' },
  { name: 'Knox', handle: 'knox_nomad' },
  { name: 'Skye', handle: 'skye_sojourns' },
  { name: 'Cruz', handle: 'cruz_compass' },
  { name: 'Jade', handle: 'jade_journeys' },
  { name: 'Kai', handle: 'kai_adventures' },
  { name: 'Nora', handle: 'nora_nomadic' },
  { name: 'Zion', handle: 'zion_explorer' },
  { name: 'Vera', handle: 'vera_voyager' },
  { name: 'Axel', handle: 'axel_odyssey' },
  { name: 'Lila', handle: 'lila_wanderer' },
  { name: 'Jax', handle: 'jax_globe_trotter' }
];

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id || '');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreatorApplicationModal, setShowCreatorApplicationModal] = useState(false);

  const handleAuthClick = (mode: 'login' | 'signup' | 'forgot') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (user: any) => {
    setShowAuthModal(false);
    
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'admin') {
      window.location.hash = 'admin-dashboard';
    } else if (user.role === 'host') {
      window.location.hash = 'host-dashboard';
    } else {
      window.location.hash = 'traveler-dashboard';
    }
  };
  const openIndiaSpecials = () => {
    window.location.hash = 'trips?type=indian_special';
    setIsMenuOpen(false);
  };
  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate there first
    const currentHash = window.location.hash;
    if (currentHash !== '' && currentHash !== '#home') {
      window.location.hash = 'home';
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate to action URL if provided
    if (notification.action_url) {
      window.location.hash = notification.action_url.replace('#', '');
    }
    
    // Close notifications panel
    setShowNotifications(false);
  };

  return (
    <>
      <header className="site-header-brand-wash sticky top-0 z-40 shadow-none border-b border-gray-100/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <button
              onClick={() => {
                window.location.hash = 'home';
                setIsMenuOpen(false);
              }}
              className="flex shrink-0 items-center cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Go to home page"
            >
              <img
                src="/optimized/logo.webp"
                alt="Travel4life Logo"
                loading="eager"
                decoding="async"
                width={36}
                height={36}
                className="h-8 w-8 object-contain sm:h-9 sm:w-9"
              />
              <span className="ml-1.5 whitespace-nowrap text-base font-display font-bold tracking-tight text-gray-900 sm:ml-2 sm:text-lg">Travel4life</span>
            </button>

            {/* Secret Miles group link */}
            <div className="ml-auto mr-2 inline-flex shrink-0 items-center sm:ml-3 sm:mr-0">
              <a
                href="https://chat.whatsapp.com/IFy99NyGI38JgcTHtsvxlI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join the Secret Miles WhatsApp group"
                className="inline-flex min-h-11 items-center justify-end gap-1.5 whitespace-nowrap px-1 text-[9px] font-bold uppercase tracking-wide text-gray-900 transition-colors hover:text-[#bd2f20] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bd2f20] focus-visible:ring-offset-2 sm:gap-2 sm:px-2 sm:text-xs"
              >
                <span>Join Secret Miles</span>
                <Plane className="h-4 w-4 shrink-0 rotate-[-18deg] text-[#bd2f20] sm:h-5 sm:w-5" aria-hidden="true" />
              </a>
            </div>


            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 ml-8">
              <button onClick={() => {
                window.location.hash = 'home';
                setTimeout(() => {
                  const element = document.getElementById('top-rated-adventures');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 300);
                setIsMenuOpen(false);
              }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200">Global</button>
              <button onClick={openIndiaSpecials} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200">India</button>
              <a
                href="/tomorrowland/"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                Festival planning
              </a>
             {/*
             <button onClick={() => {
                window.location.hash = 'testimonials';
                setIsMenuOpen(false);
              }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200">Community</button>
              <button
                onClick={() => {
                  window.location.hash = 'how-it-works';
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                How it Works
              </button>
              */}
              <button
                onClick={() => {
                  window.location.hash = 'creator-trips';
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
               Top Host
              </button>
            <button
                onClick={() => {
                  window.location.hash = 'safety';
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
              Safety
              </button>

            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                      className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-sky-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                              <p className="text-sm">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                                  !notification.read ? 'bg-sky-50/50' : ''
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                                    <p className="text-gray-500 text-xs mt-0.5">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.created_at)}</p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-sky-500 rounded-full ml-3 mt-1 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-100">
                            <button
                              onClick={() => {
                                setShowNotifications(false);
                                if (user?.role === 'host') {
                                  window.location.hash = 'host-dashboard';
                                } else {
                                  window.location.hash = 'traveler-dashboard';
                                }
                              }}
                              className="text-xs text-sky-600 hover:text-sky-700 font-medium w-full text-center"
                            >
                              View all notifications
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (user.role === 'host') {
                          window.location.hash = 'host-dashboard';
                        } else {
                          window.location.hash = 'traveler-dashboard';
                        }
                      }}
                      aria-label={`Go to ${user.role} dashboard`}
                      className="flex items-center space-x-2 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.points} pts</div>
                      </div>
                    </button>
                    <button
                      onClick={logout}
                      className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button onClick={() => handleAuthClick('login')} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200">
                    Sign In
                  </button>
                  <button onClick={() => handleAuthClick('signup')} data-auth-signup className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl transition-all duration-200 shadow-sm">
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="lg:hidden flex min-h-11 min-w-11 items-center justify-center rounded-xl p-2.5 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-6 border-t">
              <div className="flex flex-col space-y-6">
                <button onClick={() => { 
                  window.location.hash = 'home';
                  setTimeout(() => scrollToSection('top-rated-adventures'), 300);
                  setIsMenuOpen(false); 
                }} className="text-gray-700 hover:text-primary-600 transition-colors font-sans font-semibold text-lg text-left">Browse Adventures</button>
                <button onClick={openIndiaSpecials} className="text-gray-700 hover:text-primary-600 transition-colors font-sans font-semibold text-lg text-left">India Specials</button>
                <a
                  href="/tomorrowland/"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-primary-600 transition-colors font-sans font-semibold text-lg text-left"
                >
                  Tomorrowland planning
                </a>
                <button onClick={() => { window.location.hash = 'safety'; setIsMenuOpen(false); }} className="text-gray-700 hover:text-primary-600 transition-colors font-sans font-semibold text-lg text-left">Safety & Trust</button>
                <button onClick={() => { window.location.hash = 'reviews'; setIsMenuOpen(false); }} className="text-gray-700 hover:text-primary-600 transition-colors font-sans font-semibold text-lg text-left">Reviews</button>
                <button onClick={() => {
                  window.location.hash = 'how-it-works';
                  setIsMenuOpen(false);
                }} className="text-gray-700 hover:text-primary-600 transition-colors font-sans font-semibold text-lg text-left">How it Works</button>
                <button onClick={() => {
                  window.location.hash = 'creator-trips';
                  setIsMenuOpen(false);
                }} className="text-gray-700 hover:text-primary-600 transition-colors font-sans font-semibold text-lg text-left">Creators</button>
              {/*  <Button
                  variant="primary"
                  size="md"
                  data-host-signup
                  onClick={() => { setShowCreatorApplicationModal(true); setIsMenuOpen(false); }}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full font-heading font-bold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-lg animate-pulse"
                  style={{ color: '#0F2F6B' }}
                >
                  ⭐ Apply as Creator
                </Button>*/}
                
                {user ? (
                  <div className="flex flex-col space-y-4 pt-6 border-t">
                    <div className="flex items-center space-x-4 pt-4">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full font-heading font-bold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-lg animate-pulse">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-base font-sans font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 font-medium">{user.points} points</div>
                      </div>
                    </div>
                     {/* Dashboard Button for Mobile */}
                    <button
                      onClick={() => {
                        if (user.role === 'host') {
                          window.location.hash = 'host-dashboard';
                        } else {
                          window.location.hash = 'traveler-dashboard';
                        }
                        setIsMenuOpen(false);
                      }}
                      className="text-gray-700 hover:text-primary-600 transition-colors font-sans font-semibold text-lg text-left py-2"
                    >
                      Dashboard
                    </button>
  
                    <button 
                      onClick={logout} 
                      className="text-base font-sans font-medium text-gray-500 hover:text-gray-700 text-left transition-colors py-2"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4 pt-6 border-t">
                    <Button variant="outline" size="sm" onClick={() => { handleAuthClick('login'); setIsMenuOpen(false); }}>
                      Sign In
                    </Button>
                    <Button variant="primary" size="md" onClick={() => { handleAuthClick('signup'); setIsMenuOpen(false); }} data-auth-signup>
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
      </header>

      <EnhancedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
        onSuccess={handleAuthSuccess}
      />

      <CreatorApplicationModal
        isOpen={showCreatorApplicationModal}
        onClose={() => setShowCreatorApplicationModal(false)}
      />
    </>
  );
};
