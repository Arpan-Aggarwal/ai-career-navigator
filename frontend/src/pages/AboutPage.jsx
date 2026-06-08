// ===================== AboutPage =====================
import { motion } from 'framer-motion'
export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <span className="section-badge mb-4">About</span>
        <h1 className="font-display font-bold text-5xl text-white mb-6">Built for <span className="gradient-text">students, by builders</span></h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">CareerAI Navigator was born from a simple frustration: generic career advice that ignores who you actually are. We built a tool that listens first.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {[
          { icon: '🎯', title: 'Our Mission', body: 'To eliminate career confusion for tech students by giving every individual a personalized, AI-powered roadmap that respects their unique aptitude, interests, and pace.' },
          { icon: '🔬', title: 'Our Approach', body: 'We combine rule-based scoring with Groq\'s powerful LLaMA models to generate recommendations that are both data-driven and contextually intelligent.' },
          { icon: '🧑‍💻', title: 'Open & Honest', body: 'No dark patterns, no paywalls on core features. We believe career guidance should be accessible to every student regardless of background.' },
          { icon: '🌱', title: 'Always Improving', body: 'The platform is a living product. We continuously update the question bank, career definitions, and AI prompts based on real industry trends.' },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
            <div className="text-3xl mb-3">{c.icon}</div>
            <h3 className="font-display font-semibold text-white text-lg mb-2">{c.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{c.body}</p>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="glass-card p-8 text-center">
        <h2 className="font-display font-bold text-2xl text-white mb-3">Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {['Django REST Framework', 'React + Vite', 'Tailwind CSS', 'Framer Motion', 'Groq + LLaMA 3.3', 'PostgreSQL (Neon)', 'JWT Auth', 'Recharts', 'Vercel', 'Render'].map(t => (
            <span key={t} className="skill-tag">{t}</span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ===================== FeaturesPage =====================
export function FeaturesPage() {
  const features = [
    { icon: '🧠', title: 'Aptitude Assessment', description: '15 carefully designed questions across 6 categories. Results drive every downstream recommendation.' },
    { icon: '🤖', title: 'AI Career Matching', description: 'Rule-based scoring + Groq AI analysis identifies careers where your strengths align with industry demands.' },
    { icon: '🗺️', title: 'Personalized Roadmap', description: '5-phase AI-generated roadmap tailored to your current skill level, not a generic template.' },
    { icon: '📊', title: 'Readiness Score', description: 'Real-time score showing skill acquisition progress, gaps, and estimated time to job readiness.' },
    { icon: '💡', title: 'Project Recommendations', description: 'Projects matched to your current roadmap phase with difficulty levels, tech stacks, and learning outcomes.' },
    { icon: '📈', title: 'Progress Tracking', description: 'Mark milestones complete, visualize progress, and see your overall journey on an interactive timeline.' },
    { icon: '🔐', title: 'Secure Auth', description: 'JWT authentication with token refresh. Google OAuth support for one-click signup.' },
    { icon: '🌙', title: 'Dark Mode UI', description: 'A beautiful dark glassmorphism UI with smooth animations built for focus and clarity.' },
  ]
  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="font-display font-bold text-5xl text-white mb-4">Everything in <span className="gradient-text">one platform</span></h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Every feature is designed to move you closer to a job offer — not just to impress you.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="glass-card p-5">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-display font-semibold text-white mb-2 text-sm">{f.title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ===================== FAQPage =====================
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

export function FAQPage() {
  const [open, setOpen] = useState(null)
  const faqs = [
    { q: 'Is CareerAI Navigator free to use?', a: 'Yes. All core features including the assessment, career recommendations, roadmap generation, and project recommendations are completely free.' },
    { q: 'How accurate are the career recommendations?', a: 'We use a hybrid system: a deterministic rule-based scoring engine for accuracy, combined with Groq\'s LLaMA 3.3 model for personalized explanations. Recommendations improve as you fill out your profile.' },
    { q: 'Can I retake the assessment?', a: 'Yes. You can retake the assessment at any time. Your latest result is used for all recommendations. History is preserved so you can track improvement.' },
    { q: 'How is the roadmap personalized?', a: 'When you generate a roadmap, we send your assessment scores, current skills, interests, and target career to Groq\'s AI model. It generates a phase-by-phase plan tailored specifically to your starting point.' },
    { q: 'Is my data safe?', a: 'Yes. We use JWT authentication with refresh token rotation and blacklisting. Passwords are hashed using Django\'s PBKDF2. We never share your data with third parties.' },
    { q: 'What is Groq?', a: 'Groq is an AI inference provider offering ultra-fast LLM APIs. We use their LLaMA 3.3 70B model for roadmap generation and career analysis, with LLaMA 3.1 8B as a fallback.' },
  ]
  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display font-bold text-5xl text-white mb-4">Frequently Asked <span className="gradient-text">Questions</span></h1>
      </motion.div>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="glass-card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
              <span className="font-display font-medium text-white text-sm pr-4">{faq.q}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <p className="text-gray-400 text-sm leading-relaxed px-5 pb-5">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ===================== ContactPage =====================
import toast from 'react-hot-toast'
export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const handleSubmit = e => { e.preventDefault(); toast.success('Message sent! We\'ll be in touch soon.'); setForm({ name: '', email: '', message: '' }) }
  return (
    <div className="max-w-2xl mx-auto px-4 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display font-bold text-5xl text-white mb-4">Get in <span className="gradient-text">Touch</span></h1>
        <p className="text-gray-400">Have a question, suggestion, or bug report? We'd love to hear from you.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="label">Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="Arpan Aggarwal" required /></div>
          <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" placeholder="you@example.com" required /></div>
          <div><label className="label">Message</label><textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="input resize-none h-32" placeholder="Tell us what's on your mind..." required /></div>
          <button type="submit" className="btn-primary w-full py-3.5">Send Message</button>
        </form>
      </motion.div>
    </div>
  )
}

// ===================== SettingsPage =====================
export function SettingsPage() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">Settings</h1>
        <p className="text-gray-400">Manage your account preferences</p>
      </motion.div>
      {[
        { title: 'Appearance', items: [{ label: 'Dark Mode', desc: 'Use dark theme', toggle: true, value: dark, onChange: () => setDark(!dark) }] },
        { title: 'Notifications', items: [{ label: 'Email Notifications', desc: 'Receive roadmap reminders', toggle: true, value: false, onChange: () => {} }] },
      ].map(section => (
        <motion.div key={section.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="font-display font-semibold text-white mb-4">{section.title}</h2>
          {section.items.map(item => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div><div className="text-sm font-medium text-white">{item.label}</div><div className="text-xs text-gray-400">{item.desc}</div></div>
              <button onClick={item.onChange} className={`w-11 h-6 rounded-full transition-all duration-300 ${item.value ? 'bg-primary-500' : 'bg-surface-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 mx-1 ${item.value ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          ))}
        </motion.div>
      ))}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="font-display font-semibold text-white mb-4">Danger Zone</h2>
        <button onClick={async () => { await logout(); navigate('/') }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium">
          Sign Out of All Devices
        </button>
      </motion.div>
    </div>
  )
}

// ===================== NotFoundPage =====================
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="font-display font-bold text-[10rem] leading-none text-white/5 select-none">404</div>
        <div className="font-display font-bold text-4xl text-white mb-4 -mt-8">Page Not Found</div>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </motion.div>
    </div>
  )
}

export default AboutPage
