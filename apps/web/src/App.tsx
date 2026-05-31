import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import ForgotPasswordPage from '@/pages/auth/forgot-password'
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import ResetPasswordPage from '@/pages/auth/reset-password'
import AgentsPage from '@/pages/agents/index'
import NewAgentPage from '@/pages/agents/new'
import EditAgentPage from '@/pages/agents/edit'
import TestAgentPage from '@/pages/agents/test'
import DashboardPage from '@/pages/dashboard'
import SettingsPage from '@/pages/settings'
import WorkflowsPage from '@/pages/workflows/index'
import WorkflowEditorPage from '@/pages/workflows/editor'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/agents" element={<ProtectedRoute><AgentsPage /></ProtectedRoute>} />
        <Route path="/agents/new" element={<ProtectedRoute><NewAgentPage /></ProtectedRoute>} />
        <Route path="/agents/:id/edit" element={<ProtectedRoute><EditAgentPage /></ProtectedRoute>} />
        <Route path="/agents/:id/test" element={<ProtectedRoute><TestAgentPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/workflows" element={<ProtectedRoute><WorkflowsPage /></ProtectedRoute>} />
        <Route path="/workflows/:id" element={<ProtectedRoute><WorkflowEditorPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
