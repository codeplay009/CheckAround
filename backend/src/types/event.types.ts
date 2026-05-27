
export type EventOrigin = "community" | "supplementary";

export type EventSource = "community" | "allevents";

export type AnnouncerRole = "user" | "volunteer" | "admin";

export type EventStatus = "pending" | "approved" | "cancelled";

export interface EventPrice {
  displayText?: string;
  currency?: string;
  minAmount?: number;
  isFree?: boolean;
}

export interface EventLocation {
  venueName?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isOnline?: boolean;
}

export interface EventPopularity {
  interestedCount?: number;
  attendeeAvatars?: string[];
  isFeatured?: boolean;
}

export interface EventAnnouncer {
  name: string;
  role: AnnouncerRole;
  contactEmail?: string;
}

export interface EventType {
  id?: string;
  origin?: EventOrigin;
  status?: EventStatus;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  startDate?: string;
  startTime?: string;
  dateText?: string;
  source?: EventSource;
  sourceUrl?: string;
  imageUrl?: string;
  location?: EventLocation;
  price?: EventPrice;
  popularity?: EventPopularity;
  announcedBy?: EventAnnouncer;
  createdAt?: string;
  reviewedAt?: string;
  reviewNote?: string;
  scrapedAt?: string;
  isOnline?: boolean;

  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface CreateCommunityEventInput {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  startDate?: string;
  startTime?: string;
  dateText?: string;
  sourceUrl?: string;
  imageUrl?: string;
  location?: EventLocation;
  announcedBy: EventAnnouncer;
}
