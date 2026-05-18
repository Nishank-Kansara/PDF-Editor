import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import LandingPage from './pages/LandingPage'
import EditorPage from './pages/EditorPage'

function AnimatedRoutes() {
  const location = useLocation()
  const isEditor = location.pathname === '/editor'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {!isEditor && <Navbar />}
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
