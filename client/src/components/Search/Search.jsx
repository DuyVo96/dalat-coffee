import { useState } from 'react'
import './Search.css'

const FEATURES = [
  { key: 'wifi', label: 'WiFi' },
  { key: 'view', label: 'View đẹp' },
  { key: 'petFriendly', label: 'Thú cưng' },
  { key: 'parking', label: 'Đỗ xe' },
  { key: 'outdoor', label: 'Ngoài trời' }
]

function Search({ filters, onFilterChange }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value })
  }

  const handleFeatureToggle = (feature) => {
    onFilterChange({
      ...filters,
      [feature]: !filters[feature]
    })
  }

  const handlePriceChange = (price) => {
    onFilterChange({
      ...filters,
      priceRange: filters.priceRange === price ? '' : price
    })
  }

  const handleSortChange = (e) => {
    onFilterChange({ ...filters, sortBy: e.target.value })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '',
      wifi: false,
      view: false,
      petFriendly: false,
      parking: false,
      outdoor: false,
      priceRange: '',
      sortBy: 'averageRating'
    })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search' || key === 'sortBy') return false
    return value === true || (typeof value === 'string' && value !== '')
  }).length

  return (
    <div className="search-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm quán cà phê..."
          value={filters.search}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button
          className={`filter-toggle ${isExpanded ? 'active' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          🎛️ Bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
      </div>

      {isExpanded && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Tiện ích</label>
            <div className="feature-buttons">
              {FEATURES.map(feature => (
                <button
                  key={feature.key}
                  className={`feature-btn ${filters[feature.key] ? 'active' : ''}`}
                  onClick={() => handleFeatureToggle(feature.key)}
                >
                  {feature.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Mức giá</label>
            <div className="price-buttons">
              {['$', '$$', '$$$'].map(price => (
                <button
                  key={price}
                  className={`price-btn ${filters.priceRange === price ? 'active' : ''}`}
                  onClick={() => handlePriceChange(price)}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Sắp xếp</label>
            <select value={filters.sortBy} onChange={handleSortChange}>
              <option value="averageRating">Đánh giá cao</option>
              <option value="totalReviews">Nhiều đánh giá</option>
              <option value="name">Tên A-Z</option>
              <option value="createdAt">Mới nhất</option>
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button className="clear-filters" onClick={clearFilters}>
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Search
