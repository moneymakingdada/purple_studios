import { NavLink, Outlet } from "react-router-dom";

export default function StylistLayout() {
  return (
    <div>
      <div style={{ background: "var(--aubergine-deep)", padding: "0 6%" }}>
        <div className="container" style={{ display: "flex", gap: 4, padding: 0 }}>
          <PortalTab to="/portal" end>Overview</PortalTab>
          <PortalTab to="/portal/calendar">Calendar</PortalTab>
          <PortalTab to="/portal/availability">Availability</PortalTab>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function PortalTab({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        padding: "16px 22px",
        fontSize: "0.88rem",
        fontWeight: 700,
        color: isActive ? "var(--gold-soft)" : "#B79FCB",
        borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
      })}
    >
      {children}
    </NavLink>
  );
}
