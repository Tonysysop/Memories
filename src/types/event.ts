export type EventType = 
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'graduation'
  | 'baby-shower'
  | 'corporate'
  | 'reunion'
  | 'other';

export interface EventUpload {
  id: string;
  type: 'photo' | 'video' | 'message';
  content: string; // Base64 for media, text for messages
  guestName?: string;
  createdAt: string;
  isApproved: boolean;
}

export interface MemoryEvent {
  id: string;
  hostId: string;
  name: string;
  type: EventType;
  customType?: string;
  coverImage?: string;
  shareCode: string;
  createdAt: string;
  eventDate?: string;
  isUploadsEnabled: boolean;
  isMessagesEnabled: boolean;
  isLocked: boolean;
  uploads: EventUpload[];
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: 'Wedding',
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  graduation: 'Graduation',
  'baby-shower': 'Baby Shower',
  corporate: 'Corporate Event',
  reunion: 'Reunion',
  other: 'Other',
};