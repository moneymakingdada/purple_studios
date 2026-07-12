import { useEffect, useState } from "react";
import {
  addMyAvailability, addMyTimeOff, deleteMyAvailability, deleteMyTimeOff,
  fetchMyAvailability, fetchMyTimeOff,
} from "../../api/stylistPortal";

const WEEKDAYS = [
  { value: 0, label: "Monday" }, { value: 1, label: "Tuesday" }, { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" }, { value: 4, label: "Friday" }, { value: 5, label: "Saturday" }, { value: 6, label: "Sunday" },
];

export default function StylistAvailability() {
  const [availability, setAvailability] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newWindow, setNewWindow] = useState({ weekday: 0, start_time: "09:00", end_time: "18:00" });
  const [newTimeOff, setNewTimeOff] = useState({ date: "", reason: "" });
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([fetchMyAvailability(), fetchMyTimeOff()])
      .then(([avail, off]) => {
        setAvailability(avail);
        setTimeOff(off);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAddWindow(e) {
    e.preventDefault();
    setError("");
    try {
      await addMyAvailability(newWindow);
      load();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Could not add this window.");
    }
  }

  async function handleRemoveWindow(id) {
    await deleteMyAvailability(id);
    load();
  }

  async function handleAddTimeOff(e) {
    e.preventDefault();
    setError("");
    if (!newTimeOff.date) return;
    try {
      await addMyTimeOff(newTimeOff);
      setNewTimeOff({ date: "", reason: "" });
      load();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Could not add this date.");
    }
  }

  async function handleRemoveTimeOff(id) {
    await deleteMyTimeOff(id);
    load();
  }

  return (
    <div className="section" style={{ paddingBottom: 100 }}>
      {error && <div className="form-banner-error">{error}</div>}

      <div className="section-head">
        <span className="eyebrow">Weekly schedule</span>
        <h2>When you're bookable</h2>
      </div>

      {loading ? (
        <p className="loading-text">Loading availability…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {WEEKDAYS.map((wd) => {
            const windows = availability.filter((a) => a.weekday === wd.value);
            return (
              <div key={wd.value} className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 100, fontWeight: 700, fontSize: "0.88rem" }}>{wd.label}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
                  {windows.length === 0 && <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>Not working</span>}
                  {windows.map((w) => (
                    <span key={w.id} className="pill" style={{ background: "var(--lavender)", color: "var(--violet)", border: "1px solid #E4D5F2", display: "flex", alignItems: "center", gap: 8 }}>
                      {w.start_time.slice(0, 5)} – {w.end_time.slice(0, 5)}
                      <button onClick={() => handleRemoveWindow(w.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.9rem" }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleAddWindow} className="card" style={{ padding: 20, display: "flex", gap: 14, alignItems: "end", flexWrap: "wrap" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Day</label>
          <select value={newWindow.weekday} onChange={(e) => setNewWindow({ ...newWindow, weekday: Number(e.target.value) })}>
            {WEEKDAYS.map((wd) => <option key={wd.value} value={wd.value}>{wd.label}</option>)}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Start</label>
          <input type="time" value={newWindow.start_time} onChange={(e) => setNewWindow({ ...newWindow, start_time: e.target.value })} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>End</label>
          <input type="time" value={newWindow.end_time} onChange={(e) => setNewWindow({ ...newWindow, end_time: e.target.value })} />
        </div>
        <button className="btn-primary btn-sm">Add window</button>
      </form>

      <div className="section-head" style={{ marginTop: 60 }}>
        <span className="eyebrow">Time off</span>
        <h2>Block specific dates</h2>
      </div>

      {!loading && timeOff.length === 0 && <p className="empty-text">No blocked dates yet.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {timeOff.map((t) => (
          <div key={t.id} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{t.date}</span>
              {t.reason && <span style={{ color: "var(--muted)", fontSize: "0.82rem", marginLeft: 12 }}>{t.reason}</span>}
            </div>
            <button className="btn-ghost btn-sm" onClick={() => handleRemoveTimeOff(t.id)}>Remove</button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddTimeOff} className="card" style={{ padding: 20, display: "flex", gap: 14, alignItems: "end", flexWrap: "wrap" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Date</label>
          <input type="date" value={newTimeOff.date} onChange={(e) => setNewTimeOff({ ...newTimeOff, date: e.target.value })} min={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
          <label>Reason (optional)</label>
          <input placeholder="e.g. Public holiday" value={newTimeOff.reason} onChange={(e) => setNewTimeOff({ ...newTimeOff, reason: e.target.value })} />
        </div>
        <button className="btn-primary btn-sm">Block date</button>
      </form>
    </div>
  );
}
