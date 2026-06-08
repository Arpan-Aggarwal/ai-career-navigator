import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Map, Target, Zap, Star, CheckCircle, ChevronDown } from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
}

function FloatingOrb({ className }) {
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
  )
}

function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-6 group"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600/30 to-accent-cyan/20 border border-primary-500/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}

function StepCard({ number, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex gap-4"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-cyan flex items-center justify-center font-display font-bold text-sm shadow-glow">
        {number}
      </div>
      <div>
        <h4 className="font-display font-semibold text-white mb-1">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

const TESTIMONIALS = [
  { name: 'Rahul Sharma', role: 'Now at Google', text: 'CareerAI Navigator completely changed my approach. The personalized roadmap was spot-on for ML Engineering.' },
  { name: 'Priya Patel', role: 'Data Scientist @ Flipkart', text: 'The aptitude assessment was eye-opening. I discovered I\'m better suited for Data Science than full-stack dev.' },
  { name: 'Arjun Singh', role: 'Backend Dev @ Zepto', text: 'The AI roadmap was incredibly specific to my skill level. Not generic content — actual personalized guidance.' },
]

const CAREERS = [
  { icon: '🤖', name: 'AI Engineer', market: 'Excellent' },
  { icon: '🧠', name: 'ML Engineer', market: 'Excellent' },
  { icon: '📊', name: 'Data Scientist', market: 'Very Good' },
  { icon: '🌐', name: 'Full Stack Dev', market: 'Excellent' },
  { icon: '☁️', name: 'Cloud Engineer', market: 'Excellent' },
  { icon: '🔒', name: 'Cybersecurity', market: 'Excellent' },
  { icon: '🔄', name: 'DevOps Engineer', market: 'Very Good' },
  { icon: '📈', name: 'Data Analyst', market: 'Good' },
]

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <FloatingOrb className="w-96 h-96 bg-primary-600/20 top-10 -left-32" />
        <FloatingOrb className="w-96 h-96 bg-accent-cyan/10 top-20 right-0" />
        <FloatingOrb className="w-64 h-64 bg-accent-violet/15 bottom-20 left-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="max-w-4xl"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="section-badge">
                <span className="glow-dot" />
                Powered by Groq + LLaMA 3.3
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.1] mb-6"
            >
              Your AI-Powered
              <br />
              <span className="gradient-text">Career Navigator</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl"
            >
              Stop following generic roadmaps. Get a personalized career plan built on your
              aptitude, skills, and goals — powered by AI that actually understands you.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
                Start for Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/features" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-4">
                See How It Works
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {['🧑', '👩', '🧔', '👨'].map((emoji, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan border-2 border-surface-900 flex items-center justify-center text-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-400">Trusted by <span className="text-white font-medium">2,000+</span> students</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { value: '9+', label: 'Career Paths' },
              { value: '15', label: 'Assessment Questions' },
              { value: '5', label: 'Learning Phases' },
              { value: '100%', label: 'Personalized' },
            ].map((stat, i) => (
              <div key={i} className="glass p-4 text-center">
                <div className="font-display font-bold text-3xl gradient-text">{stat.value}</div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="section-badge mb-4">Features</span>
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              Everything you need to<br /><span className="gradient-text">land your dream job</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From aptitude assessment to personalized roadmaps, we give you the tools to navigate your tech career with confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🎯', title: 'Aptitude Assessment', description: 'A 15-question assessment across logical reasoning, programming aptitude, math, and creativity to understand your strengths.', delay: 0 },
              { icon: '🤖', title: 'AI Career Matching', description: 'Our rule-based engine combined with Groq AI analyzes your profile to recommend careers with match percentages.', delay: 0.1 },
              { icon: '🗺️', title: 'Personalized Roadmaps', description: 'AI-generated 5-phase learning roadmaps tailored to your current skills, gaps, and target career.', delay: 0.2 },
              { icon: '📊', title: 'Readiness Score', description: 'Real-time scoring showing how close you are to being job-ready, with specific gaps and timelines.', delay: 0.3 },
              { icon: '💡', title: 'Project Recommendations', description: 'Get project ideas at the right difficulty level for your current phase, with tech stack and learning outcomes.', delay: 0.4 },
              { icon: '📈', title: 'Progress Tracking', description: 'Mark milestones as complete, track your roadmap progress, and visualize your journey to job readiness.', delay: 0.5 },
            ].map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 relative">
        <FloatingOrb className="w-80 h-80 bg-accent-teal/10 left-0 top-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="section-badge mb-4">How It Works</span>
              <h2 className="font-display font-bold text-4xl text-white mb-6">
                From assessment to<br /><span className="gradient-text">job-ready in weeks</span>
              </h2>
              <div className="space-y-8">
                {[
                  { number: '01', title: 'Take the Assessment', description: 'Complete our 15-question aptitude test covering logical reasoning, programming, math, and creativity.', delay: 0 },
                  { number: '02', title: 'Get Career Recommendations', description: 'Our AI analyzes your scores and profile to recommend the best-fit careers with match percentages.', delay: 0.1 },
                  { number: '03', title: 'Generate Your Roadmap', description: 'Pick a career and get an AI-generated personalized 5-phase roadmap tailored to your skill level.', delay: 0.2 },
                  { number: '04', title: 'Track & Build', description: 'Follow your roadmap, mark milestones complete, build recommended projects, and track readiness.', delay: 0.3 },
                ].map(step => <StepCard key={step.number} {...step} />)}
              </div>
            </div>

            <div className="relative">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-semibold text-white">AI Engineer Roadmap</h3>
                    <p className="text-sm text-gray-400">Generated for Arpan</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan text-xs font-mono">
                    45% Complete
                  </div>
                </div>
                {[
                  { phase: 1, title: 'Python & Math Fundamentals', done: true },
                  { phase: 2, title: 'ML Algorithms & Practice', done: true },
                  { phase: 3, title: 'Deep Learning & PyTorch', done: false, active: true },
                  { phase: 4, title: 'MLOps & Deployment', done: false },
                  { phase: 5, title: 'Interview & Portfolio', done: false },
                ].map(p => (
                  <div key={p.phase} className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors ${p.active ? 'bg-primary-600/20 border border-primary-500/30' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${p.done ? 'bg-accent-teal text-white' : p.active ? 'bg-primary-500 text-white' : 'bg-surface-600 text-gray-400'}`}>
                      {p.done ? '✓' : p.phase}
                    </div>
                    <span className={`text-sm font-display ${p.done ? 'text-gray-400 line-through' : p.active ? 'text-white' : 'text-gray-500'}`}>
                      {p.title}
                    </span>
                    {p.active && <span className="ml-auto text-xs text-primary-400 font-mono">In Progress</span>}
                  </div>
                ))}
                <div className="mt-4 progress-bar">
                  <div className="progress-fill bg-gradient-to-r from-primary-500 to-accent-cyan" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              Explore <span className="gradient-text">Career Paths</span>
            </h2>
            <p className="text-gray-400">Discover which tech career aligns with your strengths</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CAREERS.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 text-center group cursor-pointer"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{c.icon}</div>
                <div className="font-display font-medium text-white text-sm mb-2">{c.name}</div>
                <div className={`text-xs font-mono px-2 py-0.5 rounded-full inline-block ${
                  c.market === 'Excellent' ? 'bg-accent-teal/20 text-accent-teal' :
                  c.market === 'Very Good' ? 'bg-accent-cyan/20 text-accent-cyan' :
                  'bg-primary-600/20 text-primary-300'
                }`}>
                  {c.market}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative">
        <FloatingOrb className="w-80 h-80 bg-primary-600/10 right-0 top-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              Success <span className="gradient-text">Stories</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-display font-medium text-white text-sm">{t.name}</div>
                    <div className="text-xs text-accent-cyan">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 relative overflow-hidden"
          >
            <FloatingOrb className="w-64 h-64 bg-primary-600/20 -top-20 -right-20" />
            <FloatingOrb className="w-64 h-64 bg-accent-cyan/10 -bottom-20 -left-20" />
            <div className="relative">
              <h2 className="font-display font-bold text-4xl text-white mb-4">
                Ready to navigate your<br /><span className="gradient-text">tech career?</span>
              </h2>
              <p className="text-gray-400 mb-8">Join thousands of students who found their path with CareerAI Navigator</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4">
                  Start for Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-10 py-4">
                  Sign In
                </Link>
              </div>
              <p className="text-gray-500 text-sm mt-6 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-teal" />
                No credit card required. Free forever for students.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
