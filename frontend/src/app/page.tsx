"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type EventLocation = {
  venueName?: string;
  address?: string;
  city?: string;
  country?: string;
};

type EventItem = {
  id?: string;
  origin: "community" | "supplementary";
  status?: "pending" | "approved" | "cancelled";
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  dateText?: string;
  source: "community" | "allevents";
  sourceUrl?: string;
  imageUrl?: string;
  location?: EventLocation;
  announcedBy?: {
    name: string;
    role: "user" | "volunteer" | "admin";
  };
  price?: {
    displayText?: string;
    isFree?: boolean;
  };
  popularity?: {
    interestedCount?: number;
    isFeatured?: boolean;
  };
};

type EventFeed = {
  primary: {
    count: number;
    events: EventItem[];
  };
  supplementary: {
    count: number;
    events: EventItem[];
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fallbackFeed: EventFeed = {
  primary: {
    count: 2,
    events: [
      {
        id: "fallback-health-camp",
        origin: "community",
        source: "community",
        title: "Free Community Health Checkup Camp",
        description:
          "Basic health screening, blood pressure checks, sugar tests, and doctor consultation for nearby residents.",
        category: "Health Camp",
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
      },
      {
        id: "fallback-run",
        origin: "community",
        source: "community",
        title: "Neighborhood 5K Morning Run",
        description:
          "A friendly local run for beginners and regular runners. Meet near the park gate before the warmup.",
        category: "Marathon",
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
      },
    ],
  },
  supplementary: {
    count: 0,
    events: [],
  },
};

const emptyForm = {
  title: "",
  city: "",
  venueName: "",
  category: "",
  dateText: "",
  description: "",
  imageUrl: "",
  announcerName: "",
  role: "volunteer",
  startDate: "",
};

const getEventMeta = (event: EventItem) =>
  [
    event.dateText,
    event.location?.venueName,
    event.location?.city,
    event.price?.displayText,
  ]
    .filter(Boolean)
    .join(" · ");

function EventCard({
  event,
  priority = false,
}: {
  event: EventItem;
  priority?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt=""
          className={
            priority ? "h-48 w-full object-cover" : "h-36 w-full object-cover"
          }
        />
      ) : (
        <div className={priority ? "h-48 bg-emerald-100" : "h-36 bg-sky-100"} />
      )}
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          {event.category ? (
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
              {event.category}
            </span>
          ) : null}
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-600">
            {event.origin === "community" ? "Announced" : "Supplementary"}
          </span>
          {event.popularity?.isFeatured ? (
            <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">
              Featured
            </span>
          ) : null}
        </div>

        <div>
          <h2 className="text-lg font-semibold leading-6 text-zinc-950">
            {event.title}
          </h2>
          <p className="mt-2 text-sm leading-5 text-zinc-600">
            {getEventMeta(event)}
          </p>
        </div>

        {event.description ? (
          <p className="line-clamp-3 text-sm leading-6 text-zinc-700">
            {event.description}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3 text-sm">
          <span className="truncate text-zinc-500">
            {event.announcedBy
              ? `${event.announcedBy.name} (${event.announcedBy.role})`
              : `${event.source}`}
          </span>
          {event.sourceUrl ? (
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 font-medium text-sky-700 hover:text-sky-900"
            >
              Details
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [feed, setFeed] = useState<EventFeed>(fallbackFeed);
  const [city, setCity] = useState("");
  const router = useRouter();
  const [status, setStatus] = useState("Showing local starter data");
  const [form, setForm] = useState(emptyForm);

  const feedUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (city.trim()) {
      params.set("city", city.trim());
    }

    const query = params.toString();
    return `${API_URL}/events/feed${query ? `?${query}` : ""}`;
  }, [city]);

  useEffect(() => {
    let cancelled = false;

    fetch(feedUrl, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Feed request failed");
        }

        return response.json();
      })
      .then((data: EventFeed) => {
        if (!cancelled) {
          setFeed(data);
          setStatus("Live backend feed");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeed(fallbackFeed);
          setStatus("Showing local starter data");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [feedUrl]);

  const submitAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      startDate: form.startDate,
      dateText: form.startDate,
      imageUrl: form.imageUrl,
      location: {
        venueName: form.venueName,
        city: form.city,
        country: "India",
      },
      announcedBy: {
        name: form.announcerName,
        role: form.role,
      },
    };

    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setStatus("Backend is not available for announcements");
      return;
    }

    await response.json();
    setForm(emptyForm);
    setStatus("Announcement submitted for admin approval");
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">{status}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              CheckAround India
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Community announced events first. Scraped events appear only as a
              secondary discovery layer.
            </p>
          </div>

          <div className="mx-auto max-w-7xl px-5 pt-6 flex justify-end">
            <button
              className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 transition-colors"
              onClick={() => router.push("/admin")}
            >
              Go to Admin
            </button>
          </div>
          <label className="flex w-full max-w-sm flex-col gap-2 text-sm font-medium text-zinc-700">
            City
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Delhi, Pune, Mumbai"
              className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-zinc-950 outline-none focus:border-emerald-600"
            />
          </label>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-8">
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Announced Events</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  {feed.primary.count} community events
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {feed.primary.events.map((event) => (
                <EventCard
                  key={event.id || event.title}
                  event={event}
                  priority
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Supplementary Events</h2>
              <p className="mt-1 text-sm text-zinc-600">
                {feed.supplementary.count} AllEvents listings
              </p>
            </div>

            {feed.supplementary.events.length ? (
              <div className="grid gap-4 md:grid-cols-3">
                {feed.supplementary.events.map((event) => (
                  <EventCard key={event.id || event.title} event={event} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600">
                Start the backend to load supplementary AllEvents listings.
              </div>
            )}
          </div>
        </section>

        <form
          onSubmit={submitAnnouncement}
          className="h-fit rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <h2 className="text-lg font-semibold">Announce Event</h2>

          <div className="mt-4 space-y-3">
            <input
              value={form.imageUrl}
              onChange={(event) =>
                setForm({ ...form, imageUrl: event.target.value })
              }
              placeholder="Image URL (optional)"
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-600"
            />
            <input
              required
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="Event title"
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-600"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                value={form.city}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value })
                }
                placeholder="City"
                className="h-11 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-600"
              />
              <input
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                placeholder="Category"
                className="h-11 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-600"
              />
            </div>
            <input
              value={form.venueName}
              onChange={(event) =>
                setForm({ ...form, venueName: event.target.value })
              }
              placeholder="Venue"
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-600"
            />
            <input
              type="date"
              value={form.startDate || ""}
              onChange={(event) =>
                setForm({ ...form, startDate: event.target.value })
              }
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-600"
            />
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Description"
              className="min-h-28 w-full resize-none rounded-md border border-zinc-300 px-3 py-3 text-sm outline-none focus:border-emerald-600"
            />
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <input
                required
                value={form.announcerName}
                onChange={(event) =>
                  setForm({ ...form, announcerName: event.target.value })
                }
                placeholder="Announcer"
                className="h-11 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-600"
              />
              <select
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value })
                }
                className="h-11 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-600"
              >
                <option value="volunteer">Volunteer</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button className="h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
              Publish Announcement
            </button>
          </div>
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold mb-2">Contact Admin</h3>
            <div className="text-sm text-zinc-700 space-y-1">
              <div>
                <span className="font-medium">Name:</span> Priyanshu Sharma
              </div>
              <div>
                <span className="font-medium">Email:</span>{" "}
                priyanshu.admin@example.com
              </div>
              <div>
                <span className="font-medium">Phone:</span> +91-9876543210
              </div>
              <div>
                <span className="font-medium">Role:</span> Admin
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
