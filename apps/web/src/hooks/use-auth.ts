import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth.store'

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { email: string; password: string; name?: string }) =>
      api.post('/auth/register', data).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      navigate('/dashboard')
    },
  })
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post('/auth/login', data).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      navigate('/dashboard')
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return () => {
    clearAuth()
    queryClient.clear()
    navigate('/login')
  }
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post('/auth/forgot-password', { email }).then((r) => r.data),
  })
}

export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      api.post('/auth/reset-password', data).then((r) => r.data),
    onSuccess: () => navigate('/login'),
  })
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/me').then((r) => r.data),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name?: string }) =>
      api.patch('/users/me', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })
}
