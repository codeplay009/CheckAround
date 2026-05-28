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
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Admin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Event Review Dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-600">{message}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/")}
              className="h-10 rounded-md border border-sky-300 bg-sky-700 px-4 text-sm font-medium text-white hover:bg-sky-800"
            >
              Home
            </button>
            {isUnlocked ? (
              <button
                onClick={lockDashboard}
                className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium hover:bg-zinc-100"
              >
                Lock
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-6">
        {!isUnlocked ? (
          <form
            onSubmit={submitPassword}
            className="max-w-md rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <label className="text-sm font-medium text-zinc-700">
              Admin password
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-zinc-950 outline-none focus:border-emerald-600"
              />
            </label>
            <button className="mt-4 h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
              {isLoading ? "Checking..." : "Open Dashboard"}
            </button>
          </form>
        ) : null}

        {isUnlocked ? (
          <section className="grid gap-4">
            {events.length ? (
              events.map((event) => (
                <article
                  key={event.id || event.title}
                  className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 text-xs font-medium">
                        <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">
                          Pending
                        </span>
                        {event.category ? (
                          <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                            {event.category}
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold">{event.title}</h2>
                        <p className="mt-1 text-sm text-zinc-600">
                          {[event.dateText, eventPlace(event)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>

                      {event.description ? (
                        <p className="max-w-3xl text-sm leading-6 text-zinc-700">
                          {event.description}
                        </p>
                      ) : null}

                      <p className="text-sm text-zinc-500">
                        Announced by{" "}
                        <span className="font-medium text-zinc-700">
                          {event.announcedBy?.name || "Unknown"}
                        </span>{" "}
                        ({event.announcedBy?.role || "user"})
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => void reviewEvent(event.id, "approved")}
                        className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => void reviewEvent(event.id, "cancelled")}
                        className="h-10 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600">
                No pending events.
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
