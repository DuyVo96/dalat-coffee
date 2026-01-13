import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import api from '../utils/api'
import './CafeDetail.css'

function CafeDetail() {
  const { slug } = useParams()
  const [cafe, setCafe] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', reviewerName: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchCafe = async () => {
      try {
        const res = await api.get(`/cafes/${slug}`)
        setCafe(res.data)

        const reviewsRes = await api.get(`/reviews/cafe/${res.data._id}`)
        setReviews(reviewsRes.data.reviews)
      } catch (error) {
        console.error('Error fetching cafe:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCafe()
  }, [slug])

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!reviewForm.comment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/reviews', {
        cafeId: cafe._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        reviewerName: reviewForm.reviewerName || 'Khách'
      })
      setReviews([res.data, ...reviews])
      setReviewForm({ rating: 5, comment: '', reviewerName: '' })

      // Update cafe rating
      setCafe(prev => ({
        ...prev,
        averageRating: ((prev.averageRating * prev.totalReviews) + res.data.rating) / (prev.totalReviews + 1),
        totalReviews: prev.totalReviews + 1
      }))
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể gửi đánh giá')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="container loading">Đang tải...</div>
  }

  if (!cafe) {
    return <div className="container">Không tìm thấy quán cà phê</div>
  }

  const features = Object.entries(cafe.features || {})
    .filter(([, value]) => value)
    .map(([key]) => {
      const labels = {
        wifi: 'WiFi',
        view: 'View đẹp',
        petFriendly: 'Thú cưng',
        parking: 'Bãi đỗ xe',
        aircon: 'Máy lạnh',
        outdoor: 'Ngoài trời',
        liveMusic: 'Nhạc sống'
      }
      return labels[key] || key
    })

  return (
    <div className="cafe-detail container">
      <Link to="/" className="back-link">← Quay lại danh sách</Link>

      <div className="cafe-header">
        <div className="cafe-gallery">
          {cafe.photos && cafe.photos.length > 0 ? (
            <img src={cafe.photos[0]} alt={cafe.name} className="main-photo" />
          ) : (
            <div className="no-photo">☕</div>
          )}
        </div>

        <div className="cafe-info-header">
          <h1>{cafe.name}</h1>
          <div className="rating-large">
            <span className="stars">
              {'★'.repeat(Math.round(cafe.averageRating))}
              {'☆'.repeat(5 - Math.round(cafe.averageRating))}
            </span>
            <span>{cafe.averageRating.toFixed(1)} ({cafe.totalReviews} đánh giá)</span>
          </div>
          <p className="price-large">{cafe.priceRange}</p>
          <p className="address">{cafe.address}</p>
          {cafe.phone && <p className="phone">SĐT: {cafe.phone}</p>}
          {features.length > 0 && (
            <div className="features-list">
              {features.map(f => (
                <span key={f} className="tag">{f}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {cafe.description && (
        <div className="section">
          <h2>Giới thiệu</h2>
          <p>{cafe.description}</p>
        </div>
      )}

      <div className="section">
        <h2>Vị trí</h2>
        <div className="map-container small-map">
          <MapContainer
            center={[cafe.location.coordinates[1], cafe.location.coordinates[0]]}
            zoom={16}
            scrollWheelZoom={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[cafe.location.coordinates[1], cafe.location.coordinates[0]]} />
          </MapContainer>
        </div>
      </div>

      <div className="section">
        <h2>Đánh giá ({reviews.length})</h2>

        <form className="review-form card" onSubmit={handleSubmitReview}>
          <h3>Viết đánh giá</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Tên của bạn (không bắt buộc)</label>
              <input
                type="text"
                placeholder="Nhập tên..."
                value={reviewForm.reviewerName}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
              />
            </div>
            <div className="rating-input">
              <label>Đánh giá:</label>
              <div className="star-select">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={reviewForm.rating >= star ? 'active' : ''}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
          <textarea
            placeholder="Chia sẻ trải nghiệm của bạn..."
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            required
            rows={4}
          />
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews">Chưa có đánh giá. Hãy là người đầu tiên!</p>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="review-card card">
                <div className="review-header">
                  <span className="reviewer-name">{review.reviewerName || 'Khách'}</span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="review-rating">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CafeDetail
