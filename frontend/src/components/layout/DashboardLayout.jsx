import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Brain, Trophy, Map, FolderGit2, Target,
  User, Settings, LogOut, Menu, X, ChevronRight, Bell
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/assessment', icon: Brain, label: 'Assessment' },
  { href: '/results', icon: Trophy, label: 'Results' },
  { href: '/roadmap', icon: Map, label: 'Roadmap' },
  { href: '/projects', icon: FolderGit2, label: 'Projects' },
  { href: '/readiness-score', icon: Target, label: 'Readiness Score' },
]

const BOTTOM_ITEMS = [
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

function NavItem({ item, collapsed, onClick }) {
  const location = useLocation()
  const active = location.pathname === item.href
  const Icon = item.icon

  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
        active
          ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-400' : ''}`} />
      {!collapsed && (
        <span className="font-display font-medium text-sm">{item.label}</span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-surface-700 border border-white/10 rounded-lg text-xs text-white font-display opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
          {item.label}
        </div>
      )}
      {active && !collapsed && (
        <ChevronRight className="ml-auto w-4 h-4 text-primary-400" />
      )}
    </Link>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        bg-surface-800/95 backdrop-blur-xl border-r border-white/5
        transition-all duration-300 shadow-card
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-auto
        ${collapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/5 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                <span>🧭</span>
              </div>
              <span className="font-display font-bold text-white">CareerAI</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
              <span>🧭</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex btn-ghost p-1.5 text-gray-400"
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden btn-ghost p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          {BOTTOM_ITEMS.map(item => (
            <NavItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-display font-medium text-sm">Logout</span>}
          </button>

          {/* User avatar */}
          {!collapsed && user && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">
                  {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-display font-medium text-white truncate">
                  {user.first_name || user.username}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/5 bg-surface-900/50 backdrop-blur-xl sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden btn-ghost p-2"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button className="btn-ghost p-2 relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-cyan" />
            </button>
            <Link to="/profile">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center cursor-pointer hover:shadow-glow transition-all duration-200">
                <span className="text-sm font-bold">
                  {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
