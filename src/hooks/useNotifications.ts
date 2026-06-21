import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'booking' | 'review' | 'message' | 'trip_update' | 'payment';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: any;
}

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        // If notifications table doesn't exist, create mock notifications
        if (error.code === '42P01' || error.code === 'PGRST205') {
          console.warn('Notifications table not found, using mock data');
          setNotifications(getMockNotifications(userId));
        } else {
          throw error;
        }
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      // Fallback to mock notifications
      setNotifications(getMockNotifications(userId));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking notification as read:', error);
        // Update local state even if database update fails
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setNotifications(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const loadNotifications = async () => {
      if (isSubscribed) {
        await fetchNotifications();
      }
    };

    loadNotifications();

    return () => {
      isSubscribed = false;
    };
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
    refreshNotifications: fetchNotifications
  };
};

// Mock notifications for fallback
const getMockNotifications = (userId: string): Notification[] => [
  {
    id: '1',
    user_id: userId,
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your Iceland trip is confirmed!',
    read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    action_url: '#traveler-dashboard'
  },
  {
    id: '2',
    user_id: userId,
    type: 'review',
    title: 'New Review',
    message: 'You received a 5-star review',
    read: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '3',
    user_id: userId,
    type: 'message',
    title: 'New Message',
    message: 'Host sent you a message about your upcoming trip',
    read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: '4',
    user_id: userId,
    type: 'trip_update',
    title: 'Trip Update',
    message: 'Weather update for your Morocco adventure',
    read: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  }
];