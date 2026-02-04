import { useState, useEffect, useCallback } from 'react';
import type { MemoryEvent, EventUpload } from '@/types/event';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<MemoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedEvents: MemoryEvent[] = (data || []).map(e => ({
        id: e.id,
        hostId: e.user_id,
        name: e.title,
        type: e.event_type,
        customType: e.custom_type,
        coverImage: e.cover_image,
        shareCode: e.slug,
        createdAt: e.created_at,
        eventDate: e.event_date,
        isUploadsEnabled: e.is_uploads_enabled,
        isMessagesEnabled: e.is_messages_enabled,
        isLocked: e.is_locked,
        uploads: [] 
      }));
      
      setEvents(mappedEvents);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData: Omit<MemoryEvent, 'id' | 'hostId' | 'shareCode' | 'createdAt' | 'uploads' | 'isUploadsEnabled' | 'isMessagesEnabled' | 'isLocked'>) => {
    if (!user) return null;

    const slug = `${eventData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

    try {
        const { data, error } = await supabase
        .from('events')
        .insert({
            user_id: user.id,
            title: eventData.name,
            event_type: eventData.type,
            custom_type: eventData.customType,
            cover_image: eventData.coverImage,
            slug: slug,
            event_date: eventData.eventDate,
            is_uploads_enabled: true,
            is_messages_enabled: true,
            is_locked: false
        })
        .select()
        .single();
        
        if (error) throw error;

        toast.success('Event created successfully!');
        fetchEvents();
        
        // Map back to MemoryEvent interface
        return {
            id: data.id,
            hostId: data.user_id,
            name: data.title,
            type: data.event_type,
            customType: data.custom_type,
            coverImage: data.cover_image,
            shareCode: data.slug,
            createdAt: data.created_at,
            eventDate: data.event_date,
            isUploadsEnabled: data.is_uploads_enabled,
            isMessagesEnabled: data.is_messages_enabled,
            isLocked: data.is_locked,
            uploads: []
        } as MemoryEvent;
    } catch (error: any) {
        toast.error(error.message || 'Failed to create event');
        throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<MemoryEvent>) => {
    try {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.title = updates.name;
        if (updates.type) dbUpdates.event_type = updates.type;
        if (updates.customType) dbUpdates.custom_type = updates.customType;
        if (updates.coverImage) dbUpdates.cover_image = updates.coverImage;
        if (updates.eventDate) dbUpdates.event_date = updates.eventDate;
        if (typeof updates.isLocked !== 'undefined') dbUpdates.is_locked = updates.isLocked;
        if (typeof updates.isUploadsEnabled !== 'undefined') dbUpdates.is_uploads_enabled = updates.isUploadsEnabled;
        if (typeof updates.isMessagesEnabled !== 'undefined') dbUpdates.is_messages_enabled = updates.isMessagesEnabled;
        
        const { error } = await supabase
            .from('events')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;

        toast.success('Event updated');
        fetchEvents();
    } catch (error: any) {
        toast.error('Failed to update event');
        console.error(error);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) {
        console.error('Delete attempted without user session');
        return false;
    }
    
    try {
        const cleanId = id.trim();
        console.log('--- DELETION AUDIT START ---');
        console.log('Target Event ID:', cleanId);
        console.log('Current User ID:', user.id);

        // Ownership Verification Check
        const { data: ownerCheck } = await supabase
            .from('events')
            .select('user_id')
            .eq('id', cleanId)
            .maybeSingle();
        
        console.log('Database Record Owner ID:', ownerCheck?.user_id);
        
        if (ownerCheck && ownerCheck.user_id !== user.id) {
            console.warn('CRITICAL: Ownership mismatch detected! Record belongs to:', ownerCheck.user_id);
        }

        // First delete associated messages
        const { error: msgError, status: msgStatus, count: msgCount } = await supabase
            .from('messages')
            .delete({ count: 'exact' })
            .eq('event_id', cleanId);
        
        console.log('Delete messages result:', { status: msgStatus, count: msgCount, error: msgError });

        if (msgError) {
            console.error('Error deleting messages:', msgError);
            throw msgError;
        }

        // Then delete associated media
        const { error: mediaError, status: mediaStatus, count: mediaCount } = await supabase
            .from('media')
            .delete({ count: 'exact' })
            .eq('event_id', cleanId);

        console.log('Delete media result:', { status: mediaStatus, count: mediaCount, error: mediaError });

        if (mediaError) {
            console.error('Error deleting media:', mediaError);
            throw mediaError;
        }

        // Finally delete the event
        const { data: result, error, status } = await supabase
            .from('events')
            .delete()
            .eq('id', cleanId)
            .eq('user_id', user.id)
            .select();

        console.log('Delete final event result:', { status, rowsAffected: result?.length, error });

        if (error) {
            console.error('Supabase deletion error:', error);
            throw error;
        }

        if (!result || result.length === 0) {
            console.warn('STILL NO ROWS DELETED. Final attempt without user_id filter (dangerous but diagnostic)...');
            // We won't actually do it yet, just log it.
        }
        
        setEvents(prev => prev.filter(e => e.id !== cleanId));
        return (result?.length || 0) > 0;
    } catch (error: any) {
        console.error('Comprehensive deletion failure:', error);
        return false;
    } finally {
        console.log('--- DELETION AUDIT END ---');
    }
  };

  const verifyEventDeleted = async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    if (error) return false;
    return data === null; // Returns true if record NO LONGER exists
  };

  const getEventByShareCode = (shareCode: string) => {
     return events.find(e => e.shareCode === shareCode) || null;
  };

  const getEventById = (id: string) => {
      return events.find(e => e.id === id) || null;
  };

  const deleteUpload = async (eventId: string, uploadId: string) => {
    // Find the upload to determine its type (media or message)
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const upload = event.uploads.find(u => u.id === uploadId);
    if (!upload) return;

    try {
        let error;
        if (upload.type === 'message') {
            const { error: msgError } = await supabase.from('messages').delete().eq('id', uploadId);
            error = msgError;
        } else {
            // It's media (photo/video)
            const { error: mediaError } = await supabase.from('media').delete().eq('id', uploadId);
            error = mediaError;
            // TODO: Also delete file from Storage
        }

        if (error) throw error;
        
        toast.success('Content deleted');
        
        // Optimistically update local state
        setEvents(prev => prev.map(e => {
            if (e.id === eventId) {
                return {
                    ...e,
                    uploads: e.uploads.filter(u => u.id !== uploadId)
                };
            }
            return e;
        }));

    } catch (error: any) {
        toast.error('Failed to delete content');
        console.error(error);
    }
  };

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    verifyEventDeleted,
    getEventByShareCode,
    getEventById,
    deleteUpload,
    refreshEvents: fetchEvents,
  };
};
