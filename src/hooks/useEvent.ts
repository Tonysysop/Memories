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
        .select(`
          *,
          media(id, file_type, created_at, is_approved),
          messages(id, created_at),
          gifts(id, amount, message, created_at, status)
        `)
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
        isGiftingEnabled: e.is_gifting_enabled,
        isLocked: e.is_locked,
        isLiveFeedEnabled: e.is_live_feed_enabled,
        isGiftTotalHidden: e.is_gift_total_hidden,
        groomFirstName: e.groom_first_name,
        groomLastName: e.groom_last_name,
        brideFirstName: e.bride_first_name,
        brideLastName: e.bride_last_name,
        religiousRiteVenue: e.religious_rite_venue,
        religiousRiteStartTime: e.religious_rite_start_time,
        religiousRiteEndTime: e.religious_rite_end_time,
        receptionVenue: e.reception_venue,
        receptionStartTime: e.reception_start_time,
        receptionEndTime: e.reception_end_time,
        isLocationPublic: e.is_location_public,
        uploads: [
          ...(e.media || []).map((m: any) => ({
            id: m.id,
            type: m.file_type as 'photo' | 'video' | 'gift',
            createdAt: m.created_at,
            isApproved: m.is_approved
          })),
          ...(e.messages || []).map((m: any) => ({
            id: m.id,
            type: 'message' as const,
            createdAt: m.created_at,
            isApproved: true
          })),
          ...(e.gifts || []).filter((g: any) => g.status === 'successful').map((g: any) => ({
            id: g.id,
            type: 'gift' as const,
            createdAt: g.created_at,
            isApproved: true,
            giftAmount: g.amount,
            giftMessage: g.message
          }))
        ]
      })) as MemoryEvent[];
    },
    enabled: !!user,
  });

  // Create Event Mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<MemoryEvent, 'id' | 'hostId' | 'shareCode' | 'createdAt' | 'uploads' | 'isUploadsEnabled' | 'isMessagesEnabled' | 'isGiftingEnabled' | 'isLocked' | 'isLiveFeedEnabled'>) => {
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
          is_gifting_enabled: false,
          is_locked: false,
          is_live_feed_enabled: false,
          groom_first_name: eventData.groomFirstName,
          groom_last_name: eventData.groomLastName,
          bride_first_name: eventData.brideFirstName,
          bride_last_name: eventData.brideLastName,
          religious_rite_venue: eventData.religiousRiteVenue,
          religious_rite_start_time: eventData.religiousRiteStartTime,
          religious_rite_end_time: eventData.religiousRiteEndTime,
          reception_venue: eventData.receptionVenue,
          reception_start_time: eventData.receptionStartTime,
          reception_end_time: eventData.receptionEndTime,
          is_location_public: eventData.isLocationPublic ?? true
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
        isGiftingEnabled: data.is_gifting_enabled,
        isLocked: data.is_locked,
        isLiveFeedEnabled: data.is_live_feed_enabled,
        groomFirstName: data.groom_first_name,
        groomLastName: data.groom_last_name,
        brideFirstName: data.bride_first_name,
        brideLastName: data.bride_last_name,
        religiousRiteVenue: data.religious_rite_venue,
        religiousRiteStartTime: data.religious_rite_start_time,
        religiousRiteEndTime: data.religious_rite_end_time,
        receptionVenue: data.reception_venue,
        receptionStartTime: data.reception_start_time,
        receptionEndTime: data.reception_end_time,
        isLocationPublic: data.is_location_public,
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
      if (typeof updates.isGiftingEnabled !== 'undefined') dbUpdates.is_gifting_enabled = updates.isGiftingEnabled;
      if (typeof updates.isLiveFeedEnabled !== 'undefined') dbUpdates.is_live_feed_enabled = updates.isLiveFeedEnabled;
      if (typeof updates.isGiftTotalHidden !== 'undefined') dbUpdates.is_gift_total_hidden = updates.isGiftTotalHidden;
      if (updates.groomFirstName) dbUpdates.groom_first_name = updates.groomFirstName;
      if (updates.groomLastName) dbUpdates.groom_last_name = updates.groomLastName;
      if (updates.brideFirstName) dbUpdates.bride_first_name = updates.brideFirstName;
      if (updates.brideLastName) dbUpdates.bride_last_name = updates.brideLastName;
      if (updates.religiousRiteVenue) dbUpdates.religious_rite_venue = updates.religiousRiteVenue;
      if (updates.religiousRiteStartTime) dbUpdates.religious_rite_start_time = updates.religiousRiteStartTime;
      if (updates.religiousRiteEndTime) dbUpdates.religious_rite_end_time = updates.religiousRiteEndTime;
      if (updates.receptionVenue) dbUpdates.reception_venue = updates.receptionVenue;
      if (updates.receptionStartTime) dbUpdates.reception_start_time = updates.receptionStartTime;
      if (updates.receptionEndTime) dbUpdates.reception_end_time = updates.receptionEndTime;
      if (typeof updates.isLocationPublic !== 'undefined') dbUpdates.is_location_public = updates.isLocationPublic;

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

      // Then delete associated gifts
      const { error: giftError } = await supabase
        .from('gifts')
        .delete()
        .eq('event_id', cleanId);

      if (giftError) throw giftError;

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

      const { error: mediaError, count: mediaCount } = await supabase.from('media').delete({ count: 'exact' }).eq('id', uploadId);
      if (mediaError) throw mediaError;
      if (mediaCount !== null && mediaCount > 0) return;

      const { error: giftError } = await supabase.from('gifts').delete().eq('id', uploadId);
      if (giftError) throw giftError;
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
