import './styles/shortsinshort-v2.css';
import './styles/shortsinshort-v3.css';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/film/:filmId" element={<App />} />
          <Route path="/film/:filmId/:slug" element={<App />} />
          {/* Every other page gets its own address too - App itself reads
              the URL (see STATIC_PATH_VIEWS/PAGE_META in App.jsx) and opens
              the matching view, same as it does for /film/:filmId. */}
          <Route path="/world-atlas" element={<App />} />
          <Route path="/festival-circuit" element={<App />} />
          <Route path="/mood-time" element={<App />} />
          <Route path="/my-cinema" element={<App />} />
          <Route path="/club" element={<App />} />
          <Route path="/sign-in" element={<App />} />
          <Route path="/about" element={<App />} />
          <Route path="/content-copyright" element={<App />} />
          <Route path="/membership-terms" element={<App />} />
          <Route path="/cancellation-refund" element={<App />} />
          <Route path="/privacy" element={<App />} />
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
