import { useState, useEffect } from 'react'
import Map from '../components/Map/Map'
import Search from '../components/Search/Search'
import CafeList from '../components/CafeList/CafeList'
import api from '../utils/api'
import './Home.css'

const initialFilters = {
  search: '',
  wifi: false,
  view: false,
  petFriendly: false,
  parking: false,
  outdoor: false,
  priceRange: '',
  sortBy: 'averageRating'
}

function Home() {
  const [cafes, setCafes] = useState([])
  const [mapCafes, setMapCafes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(initialFilters)
  const [viewMode, setViewMode] = useState('list')

  useEffect(() => {
    const fetchCafes = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.search) params.append('search', filters.search)
        if (filters.wifi) params.append('wifi', 'true')
        if (filters.view) params.append('view', 'true')
        if (filters.petFriendly) params.append('petFriendly', 'true')
        if (filters.parking) params.append('parking', 'true')
        if (filters.outdoor) params.append('outdoor', 'true')
        if (filters.priceRange) params.append('priceRange', filters.priceRange)
        params.append('sortBy', filters.sortBy)
        params.append('order', 'desc')
        params.append('limit', '100')

        const res = await api.get(`/cafes?${params}`)
        setCafes(res.data.cafes)
      } catch (error) {
        console.error('Error fetching cafes:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchCafes, 300)
    return () => clearTimeout(timeoutId)
  }, [filters])

  useEffect(() => {
    const fetchMapCafes = async () => {
      try {
        const res = await api.get('/cafes/map/markers')
        setMapCafes(res.data)
      } catch (error) {
        console.error('Error fetching map cafes:', error)
      }
    }
    fetchMapCafes()
  }, [])

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <h1>Khám phá Cà phê Đà Lạt</h1>
          <p className="hero-subtitle">
            🌲 Thưởng thức hương vị cà phê giữa rừng thông và sương mù
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{mapCafes.length}+</span>
              <span className="stat-label">Quán cà phê</span>
            </div>
            <div className="stat-divider">•</div>
            <div className="stat">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Đánh giá</span>
            </div>
            <div className="stat-divider">•</div>
            <div className="stat">
              <span className="stat-number">18°C</span>
              <span className="stat-label">Thời tiết</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container main-content">
        <Search filters={filters} onFilterChange={setFilters} />

        <div className="view-toggle">
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            <span>📋</span> Danh sách
          </button>
          <button
            className={viewMode === 'map' ? 'active' : ''}
            onClick={() => setViewMode('map')}
          >
            <span>🗺️</span> Bản đồ
          </button>
        </div>

        {viewMode === 'map' ? (
          <Map cafes={mapCafes} />
        ) : (
          <>
            <div className="results-header">
              <p className="results-count">
                Tìm thấy <strong>{cafes.length}</strong> quán cà phê
              </p>
            </div>
            <CafeList cafes={cafes} loading={loading} />
          </>
        )}
      </div>
    </div>
  )
}

export default Home
