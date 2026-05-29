import { Routes, Route, Navigate } from 'react-router'
import App from './App'
import { Landing } from './components/landing/Landing'
import { Seo } from './components/Seo'

export function AppRoutes() {
  return (
    <>
      <Seo />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/:storyId" element={<App />} />
        <Route path="*" element={<Navigate to="/doc-intro" replace />} />
      </Routes>
    </>
  )
}
