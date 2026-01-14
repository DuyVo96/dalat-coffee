import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import './AddCafe.css'

const FEATURES = [
  { key: 'wifi', label: 'WiFi miễn phí', icon: '📶' },
  { key: 'view', label: 'View đẹp', icon: '🏞️' },
  { key: 'petFriendly', label: 'Cho phép thú cưng', icon: '🐕' },
  { key: 'parking', label: 'Có chỗ đỗ xe', icon: '🚗' },
  { key: 'outdoor', label: 'Chỗ ngồi ngoài trời', icon: '🌳' },
  { key: 'aircon', label: 'Máy lạnh', icon: '❄️' },
  { key: 'liveMusic', label: 'Nhạc sống/Acoustic', icon: '🎸' }
]

function AddCafe() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    priceRange: '$$',
    photoUrls: '',
    features: {
      wifi: false,
      view: false,
      petFriendly: false,
      parking: false,
      outdoor: false,
      aircon: false,
      liveMusic: false
    },
    ownerName: '',
    ownerPhone: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFeatureToggle = (feature) => {
    setForm(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Parse photo URLs (one per line)
      const photos = form.photoUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      const cafeData = {
        name: form.name,
        address: form.address,
        phone: form.phone,
        description: form.description || `${form.name} - Quán cà phê tại Đà Lạt`,
        priceRange: form.priceRange,
        photos: photos,
        features: form.features,
        ownerName: form.ownerName,
        ownerPhone: form.ownerPhone
      }

      await api.post('/cafes/submit', cafeData)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="add-cafe-page">
        <div className="container">
          <div className="success-message">
            <span className="success-icon">✅</span>
            <h2>Gửi thành công!</h2>
            <p>Cảm ơn bạn đã đăng ký quán cà phê. Chúng tôi sẽ xem xét và thêm vào danh sách sớm nhất.</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="add-cafe-page">
      <div className="container">
        <div className="add-cafe-header">
          <h1>🏪 Đăng ký quán cà phê</h1>
          <p>Bạn là chủ quán? Thêm quán của bạn vào Dalat Coffee để tiếp cận hàng nghìn khách hàng!</p>
        </div>

        <form onSubmit={handleSubmit} className="add-cafe-form">
          <div className="form-section">
            <h3>📍 Thông tin quán</h3>

            <div className="form-group">
              <label>Tên quán *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="VD: The Married Beans Coffee"
                required
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ *</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="VD: 123 Đường Trần Phú, Phường 1, Đà Lạt"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số điện thoại quán</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="VD: 0263 123 4567"
                />
              </div>

              <div className="form-group">
                <label>Mức giá</label>
                <select name="priceRange" value={form.priceRange} onChange={handleChange}>
                  <option value="$">$ - Bình dân (dưới 30k)</option>
                  <option value="$$">$$ - Trung bình (30-60k)</option>
                  <option value="$$$">$$$ - Cao cấp (trên 60k)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Mô tả quán</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn về quán của bạn: không gian, đặc trưng, món nổi bật..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>📷 Hình ảnh</h3>
            <div className="form-group">
              <label>Link hình ảnh (mỗi link một dòng)</label>
              <textarea
                name="photoUrls"
                value={form.photoUrls}
                onChange={handleChange}
                placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg&#10;https://example.com/photo3.jpg"
                rows={4}
              />
              <span className="form-hint">
                💡 Đăng ảnh lên Facebook/Google Drive rồi copy link, hoặc dùng link từ Google Maps
              </span>
            </div>
          </div>

          <div className="form-section">
            <h3>✨ Tiện ích</h3>
            <div className="features-grid">
              {FEATURES.map(feature => (
                <button
                  key={feature.key}
                  type="button"
                  className={`feature-toggle ${form.features[feature.key] ? 'active' : ''}`}
                  onClick={() => handleFeatureToggle(feature.key)}
                >
                  <span className="feature-icon">{feature.icon}</span>
                  <span className="feature-label">{feature.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>👤 Thông tin liên hệ (không công khai)</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tên của bạn *</label>
                <input
                  type="text"
                  name="ownerName"
                  value={form.ownerName}
                  onChange={handleChange}
                  placeholder="Họ và tên"
                  required
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại của bạn *</label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={form.ownerPhone}
                  onChange={handleChange}
                  placeholder="Để chúng tôi liên hệ xác nhận"
                  required
                />
              </div>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang gửi...' : '🚀 Gửi đăng ký'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddCafe
