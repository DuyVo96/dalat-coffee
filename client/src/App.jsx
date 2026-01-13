import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import CafeDetail from './pages/CafeDetail'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cafe/:slug" element={<CafeDetail />} />
      </Routes>
    </Layout>
  )
}

export default App
