import CafeCard from './CafeCard'
import './CafeList.css'

function CafeList({ cafes, loading }) {
  if (loading) {
    return (
      <div className="cafe-list-loading">
        <div className="spinner"></div>
        <p>Đang tải quán cà phê...</p>
      </div>
    )
  }

  if (cafes.length === 0) {
    return (
      <div className="cafe-list-empty">
        <span className="empty-icon">🌲</span>
        <p>Không tìm thấy quán cà phê nào.</p>
        <p>Hãy thử thay đổi bộ lọc.</p>
      </div>
    )
  }

  return (
    <div className="cafe-list grid grid-3">
      {cafes.map((cafe, index) => (
        <div key={cafe._id} style={{ animationDelay: `${index * 0.05}s` }}>
          <CafeCard cafe={cafe} />
        </div>
      ))}
    </div>
  )
}

export default CafeList
