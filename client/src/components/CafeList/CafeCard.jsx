import { useState } from 'react'
import { Link } from 'react-router-dom'
import './CafeCard.css'

function CafeCard({ cafe }) {
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const photos = cafe.photos?.length > 0 ? cafe.photos : []

  const features = Object.entries(cafe.features || {})
    .filter(([, value]) => value)
    .slice(0, 3)
    .map(([key]) => {
      const labels = {
        wifi: 'WiFi',
        view: 'View',
        petFriendly: 'Pet',
        parking: 'Parking',
        outdoor: 'Outdoor',
        aircon: 'AC',
        liveMusic: 'Music'
      }
      return labels[key] || key
    })

  const nextPhoto = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentPhoto((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentPhoto((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <Link to={`/cafe/${cafe.slug}`} className="cafe-card card">
      <div className="cafe-image">
        {photos.length > 0 ? (
          <>
            <img src={photos[currentPhoto]} alt={cafe.name} loading="lazy" />
            {photos.length > 1 && (
              <>
                <button className="photo-nav prev" onClick={prevPhoto}>‹</button>
                <button className="photo-nav next" onClick={nextPhoto}>›</button>
                <div className="photo-dots">
                  {photos.slice(0, 5).map((_, idx) => (
                    <span key={idx} className={`dot ${idx === currentPhoto ? 'active' : ''}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="no-image">
            <span>🌲</span>
            <span>☕</span>
          </div>
        )}
        {cafe.featured && <span className="featured-badge">⭐ Nổi bật</span>}
        <div className="photo-count">📷 {photos.length}</div>
      </div>
      <div className="cafe-info">
        <h3 className="cafe-name">{cafe.name}</h3>
        <div className="cafe-rating">
          <span className="stars">
            {'★'.repeat(Math.round(cafe.averageRating))}
            {'☆'.repeat(5 - Math.round(cafe.averageRating))}
          </span>
          <span className="rating-text">
            {cafe.averageRating?.toFixed(1) || '4.0'} • {cafe.totalReviews || 0} đánh giá
          </span>
        </div>
        <p className="cafe-address">📍 {cafe.address}</p>
        <div className="cafe-meta">
          <span className="price">{cafe.priceRange || '$$'}</span>
          {features.length > 0 && (
            <div className="features">
              {features.map(f => (
                <span key={f} className="feature-tag">{f}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default CafeCard
