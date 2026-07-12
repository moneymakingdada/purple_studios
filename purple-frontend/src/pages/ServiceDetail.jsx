import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchService } from "../api/catalog";
import { getServiceImage } from "../utils/serviceImages";

export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService(slug).then(setService).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="loading-text container">Loading…</p>;
  if (!service) return <p className="empty-text container">Service not found.</p>;

  const heroImage = getServiceImage(service);

  return (
    <>
      <section className="service-detail-hero">
        <div className="container">
          <Link to="/services" className="service-detail-back">
            ← Back to services
          </Link>
          <div className="service-detail-hero-grid">
            <div>
              <span className="eyebrow">{service.category_name}</span>
              <h1>{service.name}</h1>
              <p className="service-detail-hero-copy">
                {service.description || "A signature Purple treatment, delivered by a certified specialist."}
              </p>
            </div>
            <div className="service-detail-hero-image">
              <img src={heroImage} alt={service.name} />
            </div>
          </div>
        </div>
      </section>

      <div className="container service-detail-infobar-wrap">
        <div className="card service-detail-infobar">
          <div>
            <div className="service-detail-infobar-label">Price</div>
            <div className="service-detail-infobar-value">GHS {service.price}</div>
          </div>
          <div>
            <div className="service-detail-infobar-label">Duration</div>
            <div className="service-detail-infobar-value">{service.duration_minutes} min</div>
          </div>
          <div>
            <div className="service-detail-infobar-label">For</div>
            <div className="service-detail-infobar-value capitalize">{service.audience}</div>
          </div>
          <button
            className="btn-primary service-detail-book-btn"
            onClick={() => navigate("/book", { state: { serviceId: service.id } })}
          >
            Book this service
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="eyebrow">Gallery</span>
          <h2>What this looks like</h2>
        </div>
        <div className="service-detail-gallery">
          <div className="service-detail-gallery-item">
            <img src={heroImage} alt="" />
          </div>
          <div className="service-detail-gallery-item">
            <img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=500&auto=format&fit=crop" alt="" />
          </div>
          <div className="service-detail-gallery-item">
            <img src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=500&auto=format&fit=crop" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}