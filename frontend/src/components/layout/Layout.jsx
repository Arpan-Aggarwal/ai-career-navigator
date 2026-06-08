import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight } from 'lucide-react'
import useAuthStore from '@/store/authStore'

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/features', label: 'Features' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-surface-900/90 backdrop-blur-xl border-b border-white/5 shadow-card' : ''}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow group-hover:shadow-glow-cyan transition-all duration-300">
                <span className="text-base">🧭</span>
              </div>
              <span className="font-display font-bold text-white text-lg">
                Career<span className="gradient-text">AI</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`btn-ghost text-sm ${location.pathname === link.href ? 'text-white bg-white/5' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary text-sm py-2">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                  <Link to="/register" className="btn-primary text-sm py-2">
                    Get Started <ChevronRight className="inline w-4 h-4" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden btn-ghost p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-surface-800/95 backdrop-blur-xl border-t border-white/5"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link key={link.href} to={link.href} className="block btn-ghost text-sm py-3">
                    {link.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="block btn-primary text-sm text-center">Dashboard</Link>
                  ) : (
                    <>
                      <Link to="/login" className="block btn-secondary text-sm text-center">Sign in</Link>
                      <Link to="/register" className="block btn-primary text-sm text-center">Get Started</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                  <span>🧭</span>
                </div>
                <span className="font-display font-bold text-white text-lg">CareerAI Navigator</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                AI-powered career guidance that understands your strengths, interests, and goals to create truly personalized roadmaps.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-white mb-4 text-sm">Product</h4>
              <ul className="space-y-2">
                {[['Features', '/features'], ['FAQ', '/faq'], ['About', '/about']].map(([label, href]) => (
                  <li key={href}>
                    <Link to={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-white mb-4 text-sm">Get Started</h4>
              <ul className="space-y-2">
                {[['Sign Up Free', '/register'], ['Sign In', '/login'], ['Contact', '/contact']].map(([label, href]) => (
                  <li key={href}>
                    <Link to={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2025 CareerAI Navigator. Built with ❤️ for students.</p>
            <div className="flex gap-4 text-gray-500 text-sm">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
