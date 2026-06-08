"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ─────────────────────────── Types ─────────────────────────── */

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
  announcedBy?: { name: string; role: "user" | "volunteer" | "admin" };
  price?: { displayText?: string; isFree?: boolean };
  popularity?: { interestedCount?: number; isFeatured?: boolean };
};

type EventFeed = {
  primary: { count: number; events: EventItem[] };
  supplementary: { count: number; events: EventItem[] };
};

/* ─────────────────────────── Config ─────────────────────────── */

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
        announcedBy: { name: "CheckAround Volunteer Team", role: "volunteer" },
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
        location: { venueName: "Joggers Park", city: "Pune", country: "India" },
        announcedBy: { name: "Aarav Sharma", role: "user" },
      },
    ],
  },
  supplementary: { count: 0, events: [] },
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

const roleColors: Record<string, string> = {
  volunteer: "text-emerald-400 bg-emerald-400/10",
  admin: "text-violet-400 bg-violet-400/10",
  user: "text-sky-400 bg-sky-400/10",
};

const categoryColors: Record<string, string> = {
  "Health Camp": "text-rose-400 bg-rose-400/10 border-rose-400/20",
  Marathon: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Music: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  Tech: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
};

function getCategoryStyle(cat?: string) {
  if (!cat) return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
  return (
    categoryColors[cat] ||
    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
  );
}

function getEventMeta(event: EventItem) {
  return [
    event.dateText,
    event.location?.venueName,
    event.location?.city,
    event.price?.displayText,
  ]
    .filter(Boolean)
    .join(" · ");
}

/* ─────────────────────────── EventCard ─────────────────────────── */

function EventCard({
  event,
  priority = false,
  index = 0,
}: {
  event: EventItem;
  priority?: boolean;
  index?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animationDelay: `${index * 80}ms` }}
      className="card-entrance group relative overflow-hidden rounded-2xl border border-white/6 bg-[#0f1520] transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_40px_rgba(52,211,153,0.08)]"
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${priority ? "h-52" : "h-40"}`}>
        {event.imageUrl ? (
          <>
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0f1520] via-[#0f1520]/30 to-transparent" />
          </>
        ) : (
          <div className="h-full w-full bg-linear-to-br from-emerald-900/40 to-sky-900/40" />
        )}

        {/* Featured badge */}
        {event.popularity?.isFeatured && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm border border-amber-400/20">
            <span>★</span> Featured
          </div>
        )}

        {/* Category */}
        {event.category && (
          <div
            className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${getCategoryStyle(event.category)}`}
          >
            {event.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        {/* Origin badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/4 px-2.5 py-1 text-xs text-zinc-400 border border-white/6">
            <span
              className={`h-1.5 w-1.5 rounded-full ${event.origin === "community" ? "bg-emerald-400" : "bg-sky-400"}`}
            />
            {event.origin === "community" ? "Community" : "Supplementary"}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-[1.05rem] font-semibold leading-snug text-white group-hover:text-emerald-300 transition-colors">
          {event.title}
        </h2>

        {/* Meta */}
        <p className="text-xs leading-5 text-zinc-500 font-mono">
          {getEventMeta(event)}
        </p>

        {/* Description */}
        {event.description && (
          <p className="line-clamp-2 text-sm leading-6 text-zinc-400">
            {event.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/4 pt-3">
          {event.announcedBy ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-cyan-400 text-[10px] font-bold text-[#080c14]">
                {event.announcedBy.name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-zinc-300">
                  {event.announcedBy.name}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${roleColors[event.announcedBy.role] || roleColors.user}`}
                >
                  {event.announcedBy.role}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-zinc-500">{event.source}</span>
          )}
          {event.sourceUrl && (
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              Details →
            </a>
          )}
        </div>
      </div>

      {/* Hover glow line */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-emerald-500 to-cyan-500 transition-all duration-300 ${hovered ? "w-full" : "w-0"}`}
      />
    </article>
  );
}

/* ─────────────────────────── InputField ─────────────────────────── */

function Field({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200";

/* ─────────────────────────── Home ─────────────────────────── */

export default function Home() {
  const [feed, setFeed] = useState<EventFeed>(fallbackFeed);
  const [city, setCity] = useState("");
  const router = useRouter();
  const [status, setStatus] = useState<"live" | "fallback">("fallback");
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const feedUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (city.trim()) params.set("city", city.trim());
    const q = params.toString();
    return `${API_URL}/events/feed${q ? `?${q}` : ""}`;
  }, [city]);

  useEffect(() => {
    let cancelled = false;
    fetch(feedUrl, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: EventFeed) => {
        if (!cancelled) {
          setFeed(data);
          setStatus("live");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeed(fallbackFeed);
          setStatus("fallback");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [feedUrl]);

  const submitAnnouncement = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
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
      announcedBy: { name: form.announcerName, role: form.role },
    };
    try {
      const r = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        setForm(emptyForm);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --font-display: 'Space Grotesk', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }
        * { font-family: var(--font-body); }
        .font-display { font-family: var(--font-display); }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        .card-entrance {
          animation: fade-up 0.5s cubic-bezier(.16,1,.3,1) both;
        }
        .hero-entrance {
          animation: fade-up 0.7s cubic-bezier(.16,1,.3,1) both;
        }
        .hero-entrance-2 {
          animation: fade-up 0.7s 0.15s cubic-bezier(.16,1,.3,1) both;
        }
        .hero-entrance-3 {
          animation: fade-up 0.7s 0.3s cubic-bezier(.16,1,.3,1) both;
        }
        .dot-pulse {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        .float-anim {
          animation: float 3s ease-in-out infinite;
        }
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #34d399 0%,
            #67e8f9 30%,
            #34d399 60%,
            #a7f3d0 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .glass-card {
          background: rgba(15, 21, 32, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .noise::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(52,211,153,0.3); border-radius: 2px; }

        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.6) sepia(1) saturate(5) hue-rotate(100deg);
          cursor: pointer;
        }
      `}</style>

      <main className="min-h-screen bg-[#080c14] text-white relative overflow-x-hidden">
        {/* Background effects */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-150 w-150 rounded-full bg-emerald-500/4 blur-3xl" />
          <div className="absolute top-1/3 -right-40 h-125 w-125 rounded-full bg-cyan-500/4 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-100 w-100 rounded-full bg-violet-500/3 blur-3xl" />
          <div className="absolute inset-0 grid-bg opacity-100" />
        </div>

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50 border-b border-white/5 glass-card">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="float-anim flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-cyan-400 text-[#080c14]">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <span className="font-display text-lg font-bold tracking-tight text-white">
                  CheckAround
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    {status === "live" ? "Live Feed" : "Demo Mode"}
                  </span>
                </div>
              </div>
            </div>

            {/* City search */}
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 py-2 focus-within:border-emerald-500/40 focus-within:bg-white/5 transition-all">
              <svg
                className="h-4 w-4 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search by city…"
                className="w-48 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <a
                href="#announce"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <span>+</span> Announce
              </a>
              <button
                onClick={() => router.push("/admin")}
                className="rounded-xl bg-white/6 border border-white/8 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
              >
                Admin →
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden border-b border-white/5 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 text-center">
            <div className="hero-entrance inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-400 mb-6">
              <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
              Community-verified events near you
            </div>
            <h1 className="hero-entrance-2 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Discover What's <br />
              <span className="shimmer-text">Happening Around</span>
            </h1>
            <p className="hero-entrance-3 mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
              Real events announced by real people in your community — verified
              by admins so you only see what matters.
            </p>

            {/* Stats row */}
            <div className="hero-entrance-3 mt-10 flex flex-wrap justify-center gap-8">
              {[
                {
                  label: "Community Events",
                  value: feed.primary.count,
                  color: "text-emerald-400",
                },
                {
                  label: "Cities Covered",
                  value: "12+",
                  color: "text-cyan-400",
                },
                {
                  label: "Admin Verified",
                  value: "100%",
                  color: "text-violet-400",
                },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`font-display text-3xl font-bold ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_380px]">
          {/* Events column */}
          <section className="space-y-12">
            {/* Announced Events */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-linear-to-b from-emerald-400 to-cyan-400" />
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      Announced Events
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {feed.primary.count} community events verified
                    </p>
                  </div>
                </div>
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 bg-white/3 border border-white/6 rounded-full px-3 py-1.5">
                  <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  Auto-refreshing
                </span>
              </div>

              {feed.primary.events.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {feed.primary.events.map((event, i) => (
                    <EventCard
                      key={event.id || event.title}
                      event={event}
                      priority
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="No announced events yet. Be the first to share one!" />
              )}
            </div>

            {/* Supplementary Events */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-linear-to-b from-sky-400 to-blue-500" />
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    Supplementary Events
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {feed.supplementary.count} external listings
                  </p>
                </div>
              </div>

              {feed.supplementary.events.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-3">
                  {feed.supplementary.events.map((event, i) => (
                    <EventCard
                      key={event.id || event.title}
                      event={event}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="Start the backend to load supplementary listings from AllEvents."
                  icon="🔌"
                  dim
                />
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Announce form */}
            <div
              id="announce"
              className="rounded-2xl border border-white/[0.07] bg-[#0f1520] p-6 shadow-xl shadow-black/20 sticky top-24"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
                  <svg
                    className="h-5 w-5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Announce Event
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Sent to admin for review
                  </p>
                </div>
              </div>

              {submitted && (
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
                  <span>✓</span> Submitted for admin approval!
                </div>
              )}

              <form
                ref={formRef}
                onSubmit={submitAnnouncement}
                className="space-y-3"
              >
                <Field>
                  <input
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                    placeholder="🖼  Image URL (optional)"
                    className={inputCls}
                  />
                </Field>
                <Field>
                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="✏  Event title *"
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <input
                      required
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      placeholder="📍 City *"
                      className={inputCls}
                    />
                  </Field>
                  <Field>
                    <input
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      placeholder="🏷  Category"
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field>
                  <input
                    value={form.venueName}
                    onChange={(e) =>
                      setForm({ ...form, venueName: e.target.value })
                    }
                    placeholder="🏛  Venue name"
                    className={inputCls}
                  />
                </Field>
                <Field label="Date">
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className={inputCls}
                    style={{ colorScheme: "dark" }}
                  />
                </Field>
                <Field>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="📝 Description (optional)"
                    className="min-h-25 w-full resize-none rounded-xl border border-white/8 bg-white/3 px-3.5 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </Field>
                <div className="grid grid-cols-[1fr_110px] gap-3">
                  <Field>
                    <input
                      required
                      value={form.announcerName}
                      onChange={(e) =>
                        setForm({ ...form, announcerName: e.target.value })
                      }
                      placeholder="👤 Your name *"
                      className={inputCls}
                    />
                  </Field>
                  <Field>
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                      className={inputCls + " cursor-pointer"}
                      style={{ colorScheme: "dark" }}
                    >
                      {/* Explicitly setting background for the options fixes the white-on-white text issue */}
                      <option
                        value="volunteer"
                        className="bg-[#0d1321] text-white"
                      >
                        Volunteer
                      </option>
                      <option value="user" className="bg-[#0d1321] text-white">
                        User
                      </option>
                      <option value="admin" className="bg-[#0d1321] text-white">
                        Admin
                      </option>
                    </select>
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="relative h-12 w-full overflow-hidden rounded-xl bg-linear-to-r from-emerald-600 to-cyan-600 text-sm font-bold text-white transition-all hover:from-emerald-500 hover:to-cyan-500 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Submitting…
                    </span>
                  ) : (
                    "Publish Announcement →"
                  )}
                </button>
              </form>

              {/* Contact Admin */}
              <div className="mt-6 rounded-xl border border-white/6 bg-white/2 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="h-4 w-4 text-violet-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <h3 className="text-sm font-semibold text-zinc-300">
                    Contact Admin
                  </h3>
                </div>
                <div className="space-y-2 text-xs text-zinc-500">
                  {[
                    ["Name", "Priyanshu Sharma"],
                    ["Email", "priyanshu.admin@example.com"],
                    ["Phone", "+91-9876543210"],
                    ["Role", "Platform Admin"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-zinc-600">{k}</span>
                      <span className="text-zinc-400 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/5 py-8 mt-10">
          <div className="mx-auto max-w-7xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-cyan-400 text-[#080c14] font-bold text-[10px]">
                C
              </div>
              <span>CheckAround © 2025 · Made for communities</span>
            </div>
            <div className="flex items-center gap-4">
              <span>All events admin-verified</span>
              <span className="flex items-center gap-1">
                <span className="dot-pulse h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                India
              </span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

/* ─────────────────────────── Empty State ─────────────────────────── */
function EmptyState({
  message,
  icon = "📭",
  dim = false,
}: {
  message: string;
  icon?: string;
  dim?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed ${dim ? "border-white/4 bg-white/1" : "border-emerald-500/20 bg-emerald-500/2"} py-12 text-center`}
    >
      <span className="text-3xl">{icon}</span>
      <p className="text-sm text-zinc-500 max-w-xs">{message}</p>
    </div>
  );
}
