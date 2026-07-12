import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../api/catalog";
import { getServiceImage } from "../utils/serviceImages";

export default function Services() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section services-page">
      <div className="section-head">
        <span className="eyebrow">Our menu</span>
        <h2>Every service, one purple standard.</h2>
      </div>

      {loading && <p className="loading-text">Loading services…</p>}
      {!loading && categories.length === 0 && (
        <p className="empty-text">No services found. Make sure the Django API is running and seeded (`python manage.py seed_demo`).</p>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="services-category">
          <h3 className="services-category-title">{cat.name}</h3>
          <div className="services-category-grid">
            {cat.services.map((s) => (
              <Link to={`/services/${s.slug}`} key={s.id} className="card services-card">
                <div className="services-card-image">
                  <img src={getServiceImage(s)} alt={s.name} loading="lazy" />
                </div>
                <div className="services-card-body">
                  <h4>{s.name}</h4>
                  <p className="services-card-meta">
                    {s.duration_minutes} min · {s.audience}
                  </p>
                  <div className="services-card-price">GHS {s.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}