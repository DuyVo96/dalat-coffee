import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import CafeDetail from './pages/CafeDetail'
import AddCafe from './pages/AddCafe'
import Admin from './pages/Admin'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cafe/:slug" element={<CafeDetail />} />
        <Route path="/add-cafe" element={<AddCafe />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  )
}

export default App
