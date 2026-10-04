import { useEffect, useState } from "react";
import * as adminEventApi from "../api/adminEventApi.ts";
import { AdminEventReviews } from "../components/AdminEventReviews.tsx";
import type { AdminEventListItem } from "../types/admin-event.ts";

export function AdminPendingEventsPage({ navigate }: { readonly navigate: (path: string) => void }) {
  const [events, setEvents] = useState<AdminEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPendingEvents = async () => {
      try {
        const { data } = await adminEventApi.findPending();
        setEvents(data.events);
      } catch (cause: unknown) {
        setError(cause instanceof Error ? cause.message : "Không thể tải danh sách chờ duyệt.");
      } finally {
        setLoading(false);
      }
    }
    
    loadPendingEvents();
  }, []);

  return (
    <section className="grid gap-4">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">Admin</p>
        <h1 className="mt-1 text-3xl font-extrabold">Sự kiện chờ duyệt</h1>
      </header>
      {error && <p className="rounded border border-error bg-error/10 p-4 text-error">{error}</p>}
      {loading ? (
        <p className="rounded border border-line bg-surface p-5" role="status">Đang tải danh sách chờ duyệt...</p>
      ) : events.length ? (
        <AdminEventReviews events={events} navigate={navigate} />
      ) : (
        <p className="rounded border border-line bg-surface p-5">Không có sự kiện chờ duyệt.</p>
      )}
    </section>
  );
}
