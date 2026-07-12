import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchStylist } from "../api/catalog";

export default function StylistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStylist(id).then(setStylist).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading-text container">Loading…</p>;
  if (!stylist) return <p className="empty-text container">Stylist not found.</p>;

  return (
    <div className="section stylist-profile-page">
      <Link to="/stylists" className="stylist-profile-back">← Back to stylists</Link>

      <div className="stylist-profile-grid">
        <div className="stylist-profile-avatar">
          {stylist.avatar && <img src={stylist.avatar} alt={stylist.full_name} />}
        </div>
        <div>
          <span className="eyebrow">{stylist.title}</span>
          <h1 className="stylist-profile-name">{stylist.full_name}</h1>
          <p className="stylist-profile-meta">
            {stylist.years_experience} years experience · ★ {stylist.average_rating || "New"}
          </p>
          <p className="stylist-profile-bio">{stylist.bio || "A Purple specialist ready to take care of you."}</p>

          <div className="stylist-profile-specialties">
            {stylist.specialties.map((sp) => (
              <span key={sp.id} className="pill stylist-profile-specialty-pill">
                {sp.name}
              </span>
            ))}
          </div>

          <button className="btn-primary" onClick={() => navigate("/book", { state: { stylistId: stylist.id } })}>
            Book with {stylist.full_name?.split(" ")[0]}
          </button>
        </div>
      </div>

      {stylist.portfolio?.length > 0 && (
        <div className="stylist-profile-portfolio">
          <h3 className="stylist-profile-portfolio-title">Portfolio</h3>
          <div className="stylist-profile-portfolio-grid">
            {stylist.portfolio.map((p) => (
              <div key={p.id} className="stylist-profile-portfolio-item">
                <img src={p.image} alt={p.caption} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}