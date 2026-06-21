import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  trip_id?: string;
  content: string;
  created_at: string;
  read: boolean;
  sender?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  trip?: {
    id: string;
    title: string;
  };
}

export const useMessages = (userId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, name, email, avatar_url),
          trip:trips(id, title)
        `)
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const messagesData = data || [];
      setMessages(messagesData);
      
      // Group messages into conversations
      const convos: Record<string, Message[]> = {};
      messagesData.forEach(message => {
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
        if (!convos[otherUserId]) {
          convos[otherUserId] = [];
        }
        convos[otherUserId].push(message);
      });
      
      // Sort messages within each conversation by timestamp
      Object.keys(convos).forEach(key => {
        convos[key].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });
      
      setConversations(convos);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Use mock data for now
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverId: string, content: string, tripId?: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          receiver_id: receiverId,
          trip_id: tripId,
          content,
          read: false
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh messages
      await fetchMessages();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    let channel: any = null;
    let isSubscribed = true;

    try {
      channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
          },
          (payload) => {
            if (!isSubscribed) return;
            try {
              const newMessage = payload.new as Message;
              setMessages(prev => [newMessage, ...prev]);

              // Update conversations
              setConversations(prev => {
                const otherUserId = newMessage.sender_id;
                const updated = { ...prev };
                if (!updated[otherUserId]) {
                  updated[otherUserId] = [];
                }
                updated[otherUserId] = [...updated[otherUserId], newMessage].sort(
                  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                return updated;
              });
            } catch (err) {
              console.error('Error processing new message:', err);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
          },
          (payload) => {
            if (!isSubscribed) return;
            try {
              const updatedMessage = payload.new as Message;
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === updatedMessage.id ? updatedMessage : msg
                )
              );
            } catch (err) {
              console.error('Error processing message update:', err);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIPTION_ERROR') {
            console.error('Failed to subscribe to messages channel');
          }
        });
    } catch (err) {
      console.error('Error setting up real-time subscription:', err);
    }

    return () => {
      isSubscribed = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId]);

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    markAsRead,
    refreshMessages: fetchMessages
  };
};