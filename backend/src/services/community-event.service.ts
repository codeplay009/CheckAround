import {
  CreateCommunityEventInput,
  EventStatus,
  EventType,
} from "../types/event.types";


const now = new Date().toISOString();

const communityEvents: EventType[] = [
  {
    id: "community-delhi-health-camp",
    origin: "community",
    status: "approved",
    source: "community",
    title: "Free Community Health Checkup Camp",
    description:
      "Basic health screening, blood pressure checks, sugar tests, and doctor consultation for nearby residents.",
    category: "Health Camp",
    tags: ["health", "free", "community"],
    dateText: "This Sunday - 09:00 AM",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    location: {
      venueName: "Community Hall",
      city: "Delhi",
      country: "India",
    },
    announcedBy: {
      name: "CheckAround Volunteer Team",
      role: "volunteer",
    },
    createdAt: now,
  },
  {
    id: "community-pune-morning-run",
    origin: "community",
    status: "approved",
    source: "community",
    title: "Neighborhood 5K Morning Run",
    description:
      "A friendly local run for beginners and regular runners. Meet near the park gate before the warmup.",
    category: "Marathon",
    tags: ["run", "fitness", "outdoor"],
    dateText: "Saturday - 06:30 AM",
    imageUrl:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80",
    location: {
      venueName: "Joggers Park",
      city: "Pune",
      country: "India",
    },
    announcedBy: {
      name: "Aarav Sharma",
      role: "user",
    },
    createdAt: now,
  },
];

const normalize = (value?: string) => value?.trim().toLowerCase();

const matchesQuery = (event: EventType, city?: string, category?: string) => {
  const normalizedCity = normalize(city);
  const normalizedCategory = normalize(category);

  if (normalizedCity && normalize(event.location?.city) !== normalizedCity) {
    return false;
  }

  if (normalizedCategory && normalize(event.category) !== normalizedCategory) {
    return false;
  }

  return true;
};

export const listCommunityEvents = (filters: {
  city?: string;
  category?: string;
  status?: EventStatus;
}) =>
  communityEvents.filter((event) =>
    matchesQuery(event, filters.city, filters.category) &&
    (!filters.status || event.status === filters.status),
  );

export const listPendingCommunityEvents = () =>
  communityEvents.filter((event) => event.status === "pending");

export const createCommunityEvent = (input: CreateCommunityEventInput) => {
  const event: EventType = {
    ...input,
    id: `community-${Date.now()}`,
    origin: "community",
    status: "pending",
    source: "community",
    location: {
      ...input.location,
      country: "India",
    },
    createdAt: new Date().toISOString(),
  };

  communityEvents.unshift(event);

  return event;
};

export const updateCommunityEventStatus = (
  id: string,
  status: Extract<EventStatus, "approved" | "cancelled">,
  reviewNote?: string,
) => {
  const event = communityEvents.find((item) => item.id === id);

  if (!event) {
    return undefined;
  }

  event.status = status;
  event.reviewedAt = new Date().toISOString();
  event.reviewNote = reviewNote;

  return event;
};
