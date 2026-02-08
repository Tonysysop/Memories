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
  type: 'photo' | 'video' | 'message' | 'gift';
  content: string; // Base64 for media, text for messages
  guestName?: string;
  createdAt: string;
  isApproved: boolean;
  giftAmount?: number;
  giftMessage?: string;
  isAnonymous?: boolean;
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
  isGiftingEnabled: boolean;
  isGiftTotalHidden?: boolean;
  isLocked: boolean;
  isLiveFeedEnabled: boolean;
  uploads: EventUpload[];
  
  // Wedding Specific Fields
  groomFirstName?: string;
  groomLastName?: string;
  brideFirstName?: string;
  brideLastName?: string;
  religiousRiteVenue?: string;
  religiousRiteStartTime?: string;
  religiousRiteEndTime?: string;
  receptionVenue?: string;
  receptionStartTime?: string;
  receptionEndTime?: string;
  isLocationPublic?: boolean;
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