import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import CafeDetail from './pages/CafeDetail'
import AddCafe from './pages/AddCafe'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cafe/:slug" element={<CafeDetail />} />
        <Route path="/add-cafe" element={<AddCafe />} />
      </Routes>
    </Layout>
  )
}

export default App
