import { Link } from 'react-router-dom'
import './Layout.css'

function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-bg"></div>
        <div className="container header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🌲</span>
            <div className="logo-text">
              <span className="logo-title">Đà Lạt Coffee</span>
              <span className="logo-sub">Thành phố ngàn hoa</span>
            </div>
          </Link>
          <nav className="nav">
            <Link to="/add-cafe" className="nav-btn">+ Thêm quán</Link>
          </nav>
        </div>
      </header>
      <main className="main">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content container">
          <div className="footer-brand">
            <span className="footer-logo">🌲☕</span>
            <p>Đà Lạt Coffee Finder</p>
            <p className="footer-tagline">Khám phá hương vị cà phê giữa rừng thông</p>
          </div>
          <div className="footer-links">
            <p>Made with ❤️ in Đà Lạt</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
