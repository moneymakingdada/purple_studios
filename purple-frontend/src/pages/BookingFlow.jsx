import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchServices, fetchStylists, fetchStylistSlots, fetchSalons } from "../api/catalog";
import { createBooking } from "../api/bookings";
import { useAuth } from "../context/AuthContext";

const STEPS = ["Service", "Stylist", "Date & time", "Confirm"];

export default function BookingFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [salon, setSalon] = useState(null);

  const [serviceId, setServiceId] = useState(location.state?.serviceId || null);
  const [stylistId, setStylistId] = useState(location.state?.stylistId || null);
  const [date, setDate] = useState(location.state?.date || "");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const service = useMemo(() => services.find((s) => s.id === serviceId), [services, serviceId]);
  const stylist = useMemo(() => stylists.find((s) => s.id === stylistId), [stylists, stylistId]);

  useEffect(() => {
    fetchServices({ is_active: true }).then(setServices);
    fetchStylists({ is_accepting_bookings: true }).then(setStylists);
    fetchSalons().then((data) => setSalon(data[0] || null));
  }, []);

  useEffect(() => {
    if (step === 2 && stylistId && date && service) {
      setSlotsLoading(true);
      setTime("");
      fetchStylistSlots(stylistId, date, service.duration_minutes)
        .then((data) => setSlots(data.slots))
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [step, stylistId, date, service]);

  function goNext() {
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleConfirm() {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/book" } } });
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const booking = await createBooking({
        salon: salon.id,
        stylist: stylistId,
        service: serviceId,
        date,
        start_time: time,
        notes: "",
      });
      setConfirmedBooking(booking);
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Could not create booking. Please try another slot.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedBooking) {
    return (
      <div className="section" style={{ paddingBottom: 100, maxWidth: 560 }}>
        <div className="card" style={{ padding: 50, textAlign: "center" }}>
          <div style={{
            width: 70, height: 70, borderRadius: "50%", margin: "0 auto 22px",
            background: "linear-gradient(120deg,var(--orchid),var(--violet))",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.8rem",
          }}>✓</div>
          <h2 style={{ marginBottom: 10 }}>You're booked!</h2>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            {service?.name} with {stylist?.full_name} on {confirmedBooking.date} at {confirmedBooking.start_time}.
          </p>
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>View my bookings</button>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingBottom: 100, maxWidth: 720 }}>
      <div className="progress">
        {STEPS.map((label, i) => (
          <div key={label} style={{ display: "contents" }}>
            <div className={`p-step ${i < step ? "done" : i === step ? "active" : ""}`}>
              <div className="p-circle">{i < step ? "✓" : i + 1}</div>
              <div className="p-label">{label}</div>
            </div>
            {i < STEPS.length - 1 && <div className={`p-line ${i < step ? "done" : ""}`} />}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 40 }}>
        {error && <div className="form-banner-error">{error}</div>}

        {step === 0 && (
          <>
            <h2 style={{ fontSize: "1.4rem", marginBottom: 24 }}>Choose your service</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {services.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  style={{
                    border: `2px solid ${serviceId === s.id ? "var(--orchid)" : "#E4D5F2"}`,
                    borderRadius: 14, padding: 16, cursor: "pointer",
                    background: serviceId === s.id ? "rgba(178,75,243,0.06)" : "transparent",
                  }}
                >
                  <h4 style={{ fontSize: "0.95rem" }}>{s.name}</h4>
                  <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 4 }}>{s.duration_minutes} min</p>
                  <div style={{ fontWeight: 800, color: "var(--violet)", marginTop: 8 }}>GHS {s.price}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontSize: "1.4rem", marginBottom: 24 }}>Choose your stylist</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {stylists.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setStylistId(s.id)}
                  style={{
                    border: `2px solid ${stylistId === s.id ? "var(--orchid)" : "#E4D5F2"}`,
                    borderRadius: 14, padding: 16, textAlign: "center", cursor: "pointer",
                    background: stylistId === s.id ? "rgba(178,75,243,0.06)" : "transparent",
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--lavender)", margin: "0 auto 10px", overflow: "hidden" }}>
                    {s.avatar && <img src={s.avatar} alt={s.full_name} />}
                  </div>
                  <h4 style={{ fontSize: "0.85rem" }}>{s.full_name}</h4>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{s.title}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: "1.4rem", marginBottom: 24 }}>When works for you?</h2>
            <div className="field">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
            </div>
            {date && (
              <div style={{ marginTop: 18 }}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--violet)", marginBottom: 10 }}>
                  Available times
                </label>
                {slotsLoading && <p className="loading-text">Checking availability…</p>}
                {!slotsLoading && slots.length === 0 && <p className="empty-text">No slots available this day — try another date.</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {slots.map((t) => (
                    <div
                      key={t}
                      onClick={() => setTime(t)}
                      style={{
                        border: `2px solid ${time === t ? "var(--orchid)" : "#E4D5F2"}`,
                        borderRadius: 12, padding: "10px 16px", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer",
                        color: time === t ? "var(--violet)" : "var(--ink)",
                        background: time === t ? "rgba(178,75,243,0.08)" : "transparent",
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontSize: "1.4rem", marginBottom: 24 }}>Confirm your booking</h2>
            <SummaryRow label="Service" value={service?.name} />
            <SummaryRow label="Stylist" value={stylist?.full_name} />
            <SummaryRow label="Date" value={date} />
            <SummaryRow label="Time" value={time} />
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 20, marginTop: 6, fontSize: "1.05rem" }}>
              <span>Total</span>
              <span style={{ color: "var(--violet)", fontWeight: 800 }}>GHS {service?.price}</span>
            </div>
            {!user && (
              <div className="form-banner-error" style={{ marginTop: 20 }}>
                You'll need to log in to confirm this booking.
              </div>
            )}
          </>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 36 }}>
          {step > 0 ? (
            <button className="btn-ghost" onClick={goBack}>← Back</button>
          ) : <span />}
          {step < STEPS.length - 1 ? (
            <button
              className="btn-primary"
              disabled={
                (step === 0 && !serviceId) ||
                (step === 1 && !stylistId) ||
                (step === 2 && !time)
              }
              onClick={goNext}
            >
              Continue
            </button>
          ) : (
            <button className="btn-primary" disabled={submitting} onClick={handleConfirm}>
              {submitting ? "Booking…" : user ? "Confirm booking" : "Log in to confirm"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #EFE4F7", fontSize: "0.92rem" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value || "—"}</span>
    </div>
  );
}
