import { useEffect, useState } from "react";
import * as adminEventApi from "../api/adminEventApi.ts";
import { AdminEventList } from "../components/AdminEventList.tsx";
import type { AdminEventListItem } from "../types/admin-event.ts";

export function AdminEventsPage({ navigate }: { readonly navigate: (path: string) => void }) {
  const [events, setEvents] = useState<AdminEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAllEvents = async () => {
      try {
        const { data } = await adminEventApi.findAll();
        setEvents(data.events);
      } catch (cause: unknown) {
        setError(cause instanceof Error ? cause.message : "Không thể tải danh sách sự kiện.");
      } finally {
        setLoading(false);
      }
    }
    
    loadAllEvents();
  }, []);

  return (
    <section className="grid gap-4">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">Admin</p>
        <h1 className="mt-1 text-3xl font-extrabold">Tất cả sự kiện</h1>
      </header>
      {error && <p className="rounded border border-error bg-error/10 p-4 text-error">{error}</p>}
      {loading ? (
        <p className="rounded border border-line bg-surface p-5" role="status">Đang tải danh sách sự kiện...</p>
      ) : (
        <AdminEventList events={events} navigate={navigate} />
      )}
    </section>
  );
}
