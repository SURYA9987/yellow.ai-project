import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Chat, Message } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useChats(projectId?: string) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && projectId) {
      fetchChats();
    } else {
      setChats([]);
      setLoading(false);
    }
  }, [user, projectId]);

  const fetchChats = async () => {
    if (!user || !projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (title: string) => {
    if (!user || !projectId) throw new Error('User not authenticated or no project selected');

    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          title,
          project_id: projectId,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    setChats(prev => [data, ...prev]);
    return data;
  };

  const updateChat = async (id: string, updates: Partial<Chat>) => {
    const { data, error } = await supabase
      .from('chats')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setChats(prev => prev.map(c => c.id === id ? data : c));
    return data;
  };

  const deleteChat = async (id: string) => {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setChats(prev => prev.filter(c => c.id !== id));
  };

  return {
    chats,
    loading,
    createChat,
    updateChat,
    deleteChat,
    refetch: fetchChats,
  };
}

export function useMessages(chatId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && chatId) {
      fetchMessages();
      
      // Subscribe to real-time updates
      const subscription = supabase
        .channel('messages')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `chat_id=eq.${chatId}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [user, chatId]);

  const fetchMessages = async () => {
    if (!user || !chatId) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!user || !chatId) throw new Error('User not authenticated or no chat selected');

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          content,
          role,
          chat_id: chatId,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return {
    messages,
    loading,
    addMessage,
    refetch: fetchMessages,
  };
}