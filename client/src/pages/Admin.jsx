import { useState, useEffect } from 'react'
import api from '../utils/api'
import './Admin.css'

const ADMIN_PASSWORD = 'dalat2024' // Change this to your password

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [cafes, setCafes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, verified
  const [editingCafe, setEditingCafe] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCafes()
    }
  }, [isAuthenticated, filter])

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_auth', 'true')
    } else {
      setMessage('Sai mật khẩu!')
    }
  }

  const fetchCafes = async () => {
    setLoading(true)
    try {
      const res = await api.get('/cafes?limit=200')
      let filtered = res.data.cafes

      if (filter === 'pending') {
        filtered = filtered.filter(c => !c.verified)
      } else if (filter === 'verified') {
        filtered = filtered.filter(c => c.verified)
      }

      // Sort: newest first, user-submitted first
      filtered.sort((a, b) => {
        if (a.tags?.includes('user-submitted') && !b.tags?.includes('user-submitted')) return -1
        if (!a.tags?.includes('user-submitted') && b.tags?.includes('user-submitted')) return 1
        return new Date(b.createdAt) - new Date(a.createdAt)
      })

      setCafes(filtered)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (cafeId) => {
    try {
      await api.patch(`/cafes/${cafeId}/verify`)
      setMessage('Đã xác nhận quán!')
      fetchCafes()
    } catch (err) {
      setMessage('Lỗi: ' + err.message)
    }
  }

  const handleDelete = async (cafeId, cafeName) => {
    if (!confirm(`Bạn có chắc muốn xóa "${cafeName}"?`)) return
    try {
      await api.delete(`/cafes/${cafeId}`)
      setMessage('Đã xóa quán!')
      fetchCafes()
    } catch (err) {
      setMessage('Lỗi: ' + err.message)
    }
  }

  const handleEdit = (cafe) => {
    setEditingCafe({ ...cafe })
  }

  const handleSaveEdit = async () => {
    try {
      await api.patch(`/cafes/${editingCafe._id}`, editingCafe)
      setMessage('Đã cập nhật!')
      setEditingCafe(null)
      fetchCafes()
    } catch (err) {
      setMessage('Lỗi: ' + err.message)
    }
  }

  const handleFeatureToggle = (feature) => {
    setEditingCafe(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }))
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="login-box">
            <h2>🔐 Admin Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                autoFocus
              />
              <button type="submit">Đăng nhập</button>
            </form>
            {message && <p className="error-msg">{message}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>🛠️ Quản lý quán cà phê</h1>
          <p>Tổng: {cafes.length} quán</p>
        </div>

        {message && (
          <div className="admin-message">
            {message}
            <button onClick={() => setMessage('')}>✕</button>
          </div>
        )}

        <div className="admin-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Chờ duyệt
          </button>
          <button
            className={filter === 'verified' ? 'active' : ''}
            onClick={() => setFilter('verified')}
          >
            Đã duyệt
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">Đang tải...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên quán</th>
                  <th>Địa chỉ</th>
                  <th>SĐT</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {cafes.map(cafe => (
                  <tr key={cafe._id} className={cafe.tags?.includes('user-submitted') ? 'user-submitted' : ''}>
                    <td>
                      {cafe.photos?.[0] ? (
                        <img src={cafe.photos[0]} alt={cafe.name} className="cafe-thumb" />
                      ) : (
                        <span className="no-photo">📷</span>
                      )}
                    </td>
                    <td>
                      <strong>{cafe.name}</strong>
                      {cafe.tags?.includes('user-submitted') && (
                        <span className="badge new">Mới gửi</span>
                      )}
                      {cafe.ownerInfo && (
                        <div className="owner-info">
                          👤 {cafe.ownerInfo.name} - {cafe.ownerInfo.phone}
                        </div>
                      )}
                    </td>
                    <td>{cafe.address}</td>
                    <td>{cafe.phone || '-'}</td>
                    <td>
                      {cafe.verified ? (
                        <span className="badge verified">✓ Đã duyệt</span>
                      ) : (
                        <span className="badge pending">Chờ duyệt</span>
                      )}
                    </td>
                    <td>{new Date(cafe.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(cafe)}>
                          ✏️
                        </button>
                        {!cafe.verified && (
                          <button className="btn-verify" onClick={() => handleVerify(cafe._id)}>
                            ✓
                          </button>
                        )}
                        <button className="btn-delete" onClick={() => handleDelete(cafe._id, cafe.name)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editingCafe && (
          <div className="modal-overlay" onClick={() => setEditingCafe(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Chỉnh sửa: {editingCafe.name}</h3>

              <div className="edit-form">
                <label>Tên quán</label>
                <input
                  type="text"
                  value={editingCafe.name}
                  onChange={(e) => setEditingCafe({ ...editingCafe, name: e.target.value })}
                />

                <label>Địa chỉ</label>
                <input
                  type="text"
                  value={editingCafe.address}
                  onChange={(e) => setEditingCafe({ ...editingCafe, address: e.target.value })}
                />

                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={editingCafe.phone || ''}
                  onChange={(e) => setEditingCafe({ ...editingCafe, phone: e.target.value })}
                />

                <label>Mô tả</label>
                <textarea
                  value={editingCafe.description || ''}
                  onChange={(e) => setEditingCafe({ ...editingCafe, description: e.target.value })}
                  rows={3}
                />

                <label>Mức giá</label>
                <select
                  value={editingCafe.priceRange}
                  onChange={(e) => setEditingCafe({ ...editingCafe, priceRange: e.target.value })}
                >
                  <option value="$">$</option>
                  <option value="$$">$$</option>
                  <option value="$$$">$$$</option>
                </select>

                <label>Tiện ích</label>
                <div className="features-edit">
                  {['wifi', 'view', 'petFriendly', 'parking', 'outdoor', 'aircon', 'liveMusic'].map(f => (
                    <label key={f} className="feature-checkbox">
                      <input
                        type="checkbox"
                        checked={editingCafe.features?.[f] || false}
                        onChange={() => handleFeatureToggle(f)}
                      />
                      {f}
                    </label>
                  ))}
                </div>

                <div className="edit-actions">
                  <button className="btn-cancel" onClick={() => setEditingCafe(null)}>
                    Hủy
                  </button>
                  <button className="btn-save" onClick={handleSaveEdit}>
                    💾 Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
