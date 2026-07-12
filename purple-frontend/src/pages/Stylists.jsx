import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStylists } from "../api/catalog";

export default function Stylists() {
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStylists().then(setStylists).finally(() => setLoading(false));
  }, []);

  return (
    <div className="section stylists-page">
      <div className="section-head">
        <span className="eyebrow">Meet the team</span>
        <h2>Purple's master stylists</h2>
      </div>
      {loading && <p className="loading-text">Loading stylists…</p>}
      {!loading && stylists.length === 0 && <p className="empty-text">No stylists found yet.</p>}
      <div className="stylists-grid">
        {stylists.map((s) => (
          <Link to={`/stylists/${s.id}`} key={s.id} className="card stylist-card">
            <div className="stylist-card-avatar">
              {s.avatar && <img src={s.avatar} alt={s.full_name} />}
            </div>
            <h4>{s.full_name}</h4>
            <p className="stylist-card-title">{s.title}</p>
            <div className="stylist-card-stats">
              <span>★ {s.average_rating || "New"}</span>
              <span>{s.years_experience} yrs</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}