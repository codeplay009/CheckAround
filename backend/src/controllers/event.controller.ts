import { NextFunction, Request, Response } from "express";

import { env } from "../config/env";
import { scrapeAllEvents } from "../scrapers/allevents.scraper";
import {
  createCommunityEvent,
  listPendingCommunityEvents,
  listCommunityEvents,
  updateCommunityEventStatus,
} from "../services/community-event.service";
import {
  CreateCommunityEventInput,
  EventStatus,
  EventType,
} from "../types/event.types";

import {
  createEvent,
  getApprovedEvents,
  getPendingEvents,
  updateEventStatus,
} from "../services/controller";

const INDIAN_CITIES = new Set([
  "agra",
  "ahmedabad",
  "bengaluru",
  "bangalore",
  "bhopal",
  "chandigarh",
  "chennai",
  "delhi",
  "faridabad",
  "ghaziabad",
  "goa",
  "greater noida",
  "gurgaon",
  "gurugram",
  "guwahati",
  "hyderabad",
  "indore",
  "jaipur",
  "kanpur",
  "kochi",
  "kolkata",
  "kota",
  "lucknow",
  "mangalore",
  "mumbai",
  "mysuru",
  "nagpur",
  "new delhi",
  "noida",
  "patna",
  "pune",
  "surat",
  "thane",
  "vadodara",
  "visakhapatnam",
]);

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const isAdminRequest = (req: Request) => {
  const password = asString(req.headers["x-admin-password"]);
  return Boolean(env.ADMIN_PASSWORD && password === env.ADMIN_PASSWORD);
};

const requireAdmin = (req: Request, res: Response) => {
  if (!env.ADMIN_PASSWORD) {
    res.status(500).json({
      message: "ADMIN_PASSWORD is not configured on the backend",
    });
    return false;
  }

  if (!isAdminRequest(req)) {
    res.status(401).json({ message: "Invalid admin password" });
    return false;
  }

  return true;
};

const isIndiaEvent = (event: EventType) => {
  const city = event.location?.city?.trim().toLowerCase();
  return Boolean(city && INDIAN_CITIES.has(city));
};

const filterEvents = (
  events: any[],
  filters: { city?: string; category?: string; limit?: number },
) => {
  const city = filters.city?.toLowerCase();
  const category = filters.category?.toLowerCase();

  return events
    .filter((event) => {
      const eventCity =
        typeof event.location === "object" &&
        event.location &&
        "city" in event.location
          ? String(event.location.city).toLowerCase()
          : undefined;

      if (city && eventCity !== city) {
        return false;
      }

      if (category && event.category?.toLowerCase() !== category) {
        return false;
      }

      return true;
    })
    .slice(0, filters.limit);
};

// For fetching approved events (GET /events)
export const getCommunityEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const events = await getApprovedEvents();
    res.json({
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// For creating an event (POST /events)
export const announceCommunityEvent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const event = await createEvent({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      tags: req.body.tags || [],

      startDate: req.body.startDate,
      startTime: req.body.startTime,
      dateText: req.body.dateText,

      imageUrl: req.body.imageUrl,

      location: req.body.location || null,
      announcedBy: req.body.announcedBy || null,
      price: req.body.price || null,
      popularity: req.body.popularity || null,

      latitude: req.body.latitude,
      longitude: req.body.longitude,

      origin: "community",
      source: "community",
      sourceUrl: req.body.sourceUrl,

      status: "pending",

      createdAt: new Date(),
    });
    res.status(201).json({
      event,
      message: "Event submitted for admin approval",
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplementaryEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const city = asString(req.query.city);
    const category = asString(req.query.category);
    const limit = Number(asString(req.query.limit) || 24);
    const events = (await scrapeAllEvents()).filter(isIndiaEvent);
    const filteredEvents = filterEvents(events, {
      city,
      category,
      limit: Number.isFinite(limit) ? limit : 24,
    });

    res.json({
      count: filteredEvents.length,
      events: filteredEvents,
      note: "Supplementary events are scraped from AllEvents and shown after community announcements.",
    });
  } catch (error) {
    next(error);
  }
};

export const getEventFeed = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const city = asString(req.query.city);
    const category = asString(req.query.category);

    const approvedEventsRaw = await getApprovedEvents();

    const approvedEvents: EventType[] = approvedEventsRaw.map((event: any) => ({
      ...event,

      location: event.location || undefined,
      announcedBy: event.announcedBy || undefined,
      price: event.price || undefined,
      popularity: event.popularity || undefined,

      tags: Array.isArray(event.tags) ? event.tags : [],
    }));

    const communityEvents = filterEvents(approvedEvents, {
      city,
      category,
      limit: 50,
    });

    const supplementaryEvents = filterEvents(
      (await scrapeAllEvents()).filter(isIndiaEvent),
      {
        city,
        category,
        limit: 12,
      },
    );

    res.json({
      primary: {
        count: communityEvents.length,
        events: communityEvents,
      },
      supplementary: {
        count: supplementaryEvents.length,
        events: supplementaryEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const getPendingCommunityEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!requireAdmin(req, res)) {
      return;
    }

    const events = await getPendingEvents();

    res.json({
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCommunityEventReviewStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!requireAdmin(req, res)) {
      return;
    }

    const status = req.body?.status as EventStatus | undefined;

    if (status !== "approved" && status !== "cancelled") {
      res.status(400).json({
        message: "status must be approved or cancelled",
      });
      return;
    }

    const eventId = asString(req.params.id);

    if (!eventId) {
      res.status(400).json({
        message: "Event id is required",
      });
      return;
    }

    const event = await updateEventStatus(
      eventId,
      status,
      asString(req.body?.reviewNote),
    );

    res.json({ event });
  } catch (error) {
    next(error);
  }
};
