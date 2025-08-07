import React from 'react'
import ReactDOM from 'react-dom/client'
import { Routes, Route } from 'react-router-dom'
import RootLayout from '../pages/_root'
import HomePage from '../pages/_index'
import DashboardPage from '../pages/dashboard'
import SetupPage from '../pages/setup'
import LoginPage from '../pages/login'
import SettingsPage from '../pages/settings'
import CollectiblesPage from '../pages/collectibles'
import ReflectionLogsPage from '../pages/reflection-logs'
import TaskDetailPage from '../pages/tasks.$taskId'
import '/global.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

const App = () => (
  <RootLayout>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/collectibles" element={<CollectiblesPage />} />
      <Route path="/reflection-logs" element={<ReflectionLogsPage />} />
      <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
    </Routes>
  </RootLayout>
)

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
) 
