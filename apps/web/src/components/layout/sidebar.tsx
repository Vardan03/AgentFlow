import { Bot, GitFork, LayoutDashboard, Server, Settings, LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useQueryClient } from '@tanstack/react-query'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/workflows', icon: GitFork, label: 'Workflows' },
  { to: '/mcp', icon: Server, label: 'MCP Servers' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const logout = () => {
    clearAuth()
    queryClient.clear()
    navigate('/login')
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-border bg-card min-h-screen">
      <div className="px-5 py-5 border-b border-border">
        <span className="font-bold text-lg text-primary tracking-tight">AgentFlow</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
