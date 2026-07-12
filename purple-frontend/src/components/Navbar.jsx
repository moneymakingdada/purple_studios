import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="site-nav">
      <Link to="/" className="logo">Purple<span>.</span></Link>
      <div className="nav-links">
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/stylists">Stylists</NavLink>
        {user && user.role === "stylist" && <NavLink to="/portal">Stylist portal</NavLink>}
        {user && user.role !== "stylist" && <NavLink to="/dashboard">My bookings</NavLink>}
        {user ? (
          <>
            <span className="nav-user" style={{ color: "#D9C7EA", fontSize: "0.85rem" }}>
              Hi, {user.first_name || user.username}
            </span>
            <button className="btn-ghost on-dark btn-sm" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/book" className="nav-cta">Book now</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
