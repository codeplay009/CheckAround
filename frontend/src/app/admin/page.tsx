"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PendingEvent = {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  dateText?: string;
  status?: "pending" | "approved" | "cancelled";
  location?: {
    venueName?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  announcedBy?: {
    name: string;
    role: "user" | "volunteer" | "admin";
    contactEmail?: string;
  };
  createdAt?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const PASSWORD_STORAGE_KEY = "admin-password";

const eventPlace = (event: PendingEvent) =>
  [event.location?.venueName, event.location?.address, event.location?.city]
    .filter(Boolean)
    .join(", ");

export default function AdminDashboard() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [message, setMessage] = useState("Enter admin password");
  const [isLoading, setIsLoading] = useState(false);

  const loadPendingEvents = async (adminPassword: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/events/admin/pending`, {
        headers: {
          "x-admin-password": adminPassword,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Invalid password or backend unavailable");
      }

      const data = (await response.json()) as {
        count: number;
        events: PendingEvent[];
      };

      setEvents(data.events);
      setIsUnlocked(true);
      setMessage(`${data.count} pending events`);
      localStorage.setItem(PASSWORD_STORAGE_KEY, adminPassword);
    } catch (error) {
      setIsUnlocked(false);
      setEvents([]);
      setMessage(
        error instanceof Error ? error.message : "Unable to load events",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedPassword = localStorage.getItem(PASSWORD_STORAGE_KEY);

    if (savedPassword) {
      setPassword(savedPassword);
      void loadPendingEvents(savedPassword);
    }
  }, []);

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadPendingEvents(password);
  };

  const reviewEvent = async (
    eventId: string | undefined,
    status: "approved" | "cancelled",
  ) => {
    if (!eventId) {
      return;
    }

    const response = await fetch(`${API_URL}/events/admin/${eventId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setMessage("Review failed");
      return;
    }

    setEvents((current) => current.filter((event) => event.id !== eventId));
    setMessage(status === "approved" ? "Event approved" : "Event cancelled");
  };

  const lockDashboard = () => {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
    setPassword("");
    setIsUnlocked(false);
    setEvents([]);
    setMessage("Enter admin password");
  };

  return (
    <main className="min-h-screen bg-[#080c14] text-white font-body">
      {/* Header Section */}
      <section className="border-b border-zinc-800/60 bg-[#0d1321]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider text-cyan-400 uppercase font-display">
              Control Panel
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-100 font-display">
              Event Review Dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-400">{message}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="h-10 rounded-xl border border-zinc-700 bg-transparent px-4 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
            >
              Home
            </button>
            {isUnlocked ? (
              <button
                onClick={lockDashboard}
                className="h-10 rounded-xl border border-red-900/50 bg-red-950/30 px-4 text-sm font-medium text-red-400 transition-all hover:bg-red-900/40"
              >
                Lock
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* Auth Gate Screen */}
        {!isUnlocked ? (
          <div className="flex justify-center py-12">
            <form
              onSubmit={submitPassword}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0d1321] p-6 shadow-xl"
            >
              <label className="block text-sm font-medium text-zinc-300 font-display">
                Admin Password
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-3 h-11 w-full rounded-xl border border-zinc-700 bg-[#080c14] px-4 text-white transition-all outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </label>
              <button className="mt-5 h-11 w-full rounded-xl bg-cyan-600 px-4 text-sm font-semibold text-white transition-all hover:bg-cyan-500 active:scale-[0.98]">
                {isLoading ? "Checking..." : "Open Dashboard"}
              </button>
            </form>
          </div>
        ) : null}

        {/* Dash Board Panels */}
        {isUnlocked ? (
          <section className="grid gap-5">
            {events.length ? (
              events.map((event) => (
                <article
                  key={event.id || event.title}
                  className="rounded-2xl border border-zinc-800/80 bg-[#0d1321] p-5 shadow-sm transition-all hover:border-zinc-700"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider font-display">
                        <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-amber-400 border border-amber-500/20">
                          Pending
                        </span>
                        {event.category ? (
                          <span className="rounded-lg bg-cyan-500/10 px-2.5 py-1 text-cyan-400 border border-cyan-500/20">
                            {event.category}
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-zinc-100 font-display">
                          {event.title}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-400">
                          {[event.dateText, eventPlace(event)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>

                      {event.description ? (
                        <p className="max-w-3xl text-sm leading-relaxed text-zinc-300">
                          {event.description}
                        </p>
                      ) : null}

                      <p className="text-xs text-zinc-500">
                        Announced by{" "}
                        <span className="font-semibold text-zinc-400">
                          {event.announcedBy?.name || "Unknown"}
                        </span>{" "}
                        • <span className="italic">{event.announcedBy?.role || "user"}</span>
                      </p>
                    </div>

                    {/* Interaction Buttons */}
                    <div className="flex shrink-0 gap-3 pt-2 lg:pt-0">
                      <button
                        onClick={() => void reviewEvent(event.id, "approved")}
                        className="h-10 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-95"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => void reviewEvent(event.id, "cancelled")}
                        className="h-10 rounded-xl border border-zinc-700 bg-transparent px-5 text-sm font-semibold text-red-400 transition-all hover:bg-red-950/20 hover:border-red-900/50 active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#0d1321] p-8 text-center text-sm text-zinc-400">
                ✨ No pending events. Your queue is completely clean!
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}