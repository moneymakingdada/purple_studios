import { useEffect, useMemo, useState } from "react";
import { cancelBooking, completeBooking, confirmBooking, fetchMyBookings } from "../../api/bookings";

const STATUS_COLORS = {
  pending: "#B8912B",
  confirmed: "#1e8449",
  completed: "#6C2BD9",
  cancelled: "#8a7397",
  no_show: "#c0392b",
};

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

export default function StylistCalendar() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  function load() {
    setLoading(true);
    fetchMyBookings().then(setBookings).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAction(actionFn, id) {
    await actionFn(id);
    load();
  }

  function bookingsForDay(day) {
    const iso = toISODate(day);
    return bookings
      .filter((b) => b.date === iso)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  return (
    <div className="section" style={{ paddingBottom: 100 }}>
      <div className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: "none" }}>
        <div>
          <span className="eyebrow">Your week</span>
          <h2>
            {weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} –{" "}
            {days[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </h2>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost btn-sm" onClick={() => setWeekStart((d) => { const nd = new Date(d); nd.setDate(nd.getDate() - 7); return nd; })}>← Prev</button>
          <button className="btn-ghost btn-sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>Today</button>
          <button className="btn-ghost btn-sm" onClick={() => setWeekStart((d) => { const nd = new Date(d); nd.setDate(nd.getDate() + 7); return nd; })}>Next →</button>
        </div>
      </div>

      {loading && <p className="loading-text">Loading your calendar…</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
        {days.map((day) => {
          const dayBookings = bookingsForDay(day);
          const isToday = toISODate(day) === toISODate(new Date());
          return (
            <div key={day.toISOString()} style={{ minHeight: 160 }}>
              <div style={{
                textAlign: "center", marginBottom: 10, padding: "6px 0", borderRadius: 10,
                background: isToday ? "linear-gradient(120deg,var(--orchid),var(--violet))" : "transparent",
                color: isToday ? "#fff" : "var(--ink)",
              }}>
                <div style={{ fontSize: "0.68rem", textTransform: "uppercase", fontWeight: 700, opacity: 0.8 }}>
                  {day.toLocaleDateString(undefined, { weekday: "short" })}
                </div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.1rem" }}>{day.getDate()}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dayBookings.length === 0 && (
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", textAlign: "center" }}>—</div>
                )}
                {dayBookings.map((b) => (
                  <div
                    key={b.id}
                    className="card"
                    style={{ padding: 10, borderLeft: `3px solid ${STATUS_COLORS[b.status]}` }}
                  >
                    <div style={{ fontSize: "0.72rem", fontWeight: 700 }}>{b.start_time?.slice(0, 5)}</div>
                    <div style={{ fontSize: "0.76rem", marginTop: 2 }}>{b.service_name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>{b.customer_name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      {b.status === "pending" && (
                        <button className="btn-primary" style={{ padding: "4px 8px", fontSize: "0.65rem" }} onClick={() => handleAction(confirmBooking, b.id)}>
                          Confirm
                        </button>
                      )}
                      {b.status === "confirmed" && (
                        <button className="btn-primary" style={{ padding: "4px 8px", fontSize: "0.65rem" }} onClick={() => handleAction(completeBooking, b.id)}>
                          Complete
                        </button>
                      )}
                      {(b.status === "pending" || b.status === "confirmed") && (
                        <button className="btn-ghost" style={{ padding: "4px 8px", fontSize: "0.65rem" }} onClick={() => handleAction(cancelBooking, b.id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
