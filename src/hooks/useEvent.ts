import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MemoryEvent } from '@/types/event';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useEvents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch Events Query
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(e => ({
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
        isLiveFeedEnabled: e.is_live_feed_enabled,
        uploads: []
      })) as MemoryEvent[];
    },
    enabled: !!user,
  });

  // Create Event Mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<MemoryEvent, 'id' | 'hostId' | 'shareCode' | 'createdAt' | 'uploads' | 'isUploadsEnabled' | 'isMessagesEnabled' | 'isLocked' | 'isLiveFeedEnabled'>) => {
      if (!user) throw new Error('User not authenticated');

      const slug = `${eventData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

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
          is_locked: false,
          is_live_feed_enabled: false
        })
        .select()
        .single();

      if (error) throw error;
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
        isLiveFeedEnabled: data.is_live_feed_enabled,
        uploads: []
      } as MemoryEvent;
    },
    onSuccess: () => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create event');
    }
  });

  // Update Event Mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MemoryEvent> }) => {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.title = updates.name;
      if (updates.type) dbUpdates.event_type = updates.type;
      if (updates.customType) dbUpdates.custom_type = updates.customType;
      if (updates.coverImage) dbUpdates.cover_image = updates.coverImage;
      if (updates.eventDate) dbUpdates.event_date = updates.eventDate;
      if (typeof updates.isLocked !== 'undefined') dbUpdates.is_locked = updates.isLocked;
      if (typeof updates.isUploadsEnabled !== 'undefined') dbUpdates.is_uploads_enabled = updates.isUploadsEnabled;
      if (typeof updates.isMessagesEnabled !== 'undefined') dbUpdates.is_messages_enabled = updates.isMessagesEnabled;
      if (typeof updates.isLiveFeedEnabled !== 'undefined') dbUpdates.is_live_feed_enabled = updates.isLiveFeedEnabled;

      const { error } = await supabase
        .from('events')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Event updated');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update event');
      console.error(error);
    }
  });

  // Delete Event Mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const cleanId = id.trim();

      // First delete associated messages
      const { error: msgError } = await supabase
        .from('messages')
        .delete()
        .eq('event_id', cleanId);

      if (msgError) throw msgError;

      // Then delete associated media
      const { error: mediaError } = await supabase
        .from('media')
        .delete()
        .eq('event_id', cleanId);

      if (mediaError) throw mediaError;

      // Finally delete the event
      const { data, error } = await supabase
        .from('events')
        .delete()
        .eq('id', cleanId)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;
      return (data?.length || 0) > 0;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Delete failed', error);
    }
  });

  // Verify Event Deleted (Helper)
  const verifyEventDeleted = async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (error) return false;
    return data === null;
  };

  // Helper getters from cache
  const getEventByShareCode = (shareCode: string) => {
    return events.find(e => e.shareCode === shareCode) || null;
  };

  const getEventById = (id: string) => {
    return events.find(e => e.id === id) || null;
  };

  // Delete Upload Mutation
  const deleteUploadMutation = useMutation({
    mutationFn: async ({ uploadId }: { uploadId: string }) => {
      // Just try to delete from messages, if 0 rows, try media.
      const { error: msgError, count: msgCount } = await supabase.from('messages').delete({ count: 'exact' }).eq('id', uploadId);
      if (msgError) throw msgError;
      if (msgCount !== null && msgCount > 0) return;

      const { error: mediaError } = await supabase.from('media').delete().eq('id', uploadId);
      if (mediaError) throw mediaError;
    },
    onSuccess: () => {
      toast.success('Content deleted');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      toast.error('Failed to delete content');
      console.error(error);
    }
  });

  return {
    events,
    isLoading,
    createEvent: createEventMutation.mutateAsync,
    updateEvent: (id: string, updates: Partial<MemoryEvent>) => updateEventMutation.mutateAsync({ id, updates }),
    deleteEvent: deleteEventMutation.mutateAsync,
    verifyEventDeleted,
    getEventByShareCode,
    getEventById,
    deleteUpload: (uploadId: string) => deleteUploadMutation.mutateAsync({ uploadId }),
    refreshEvents: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  };
};
