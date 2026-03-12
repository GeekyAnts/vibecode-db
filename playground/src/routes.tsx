import { Routes, Route, Navigate } from 'react-router'
import { stories } from './stories'
import App from './App'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/:storyId" element={<App />} />
      <Route path="*" element={<Navigate to={`/${stories[0].id}`} replace />} />
    </Routes>
  )
}
