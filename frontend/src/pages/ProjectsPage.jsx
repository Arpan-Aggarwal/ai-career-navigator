import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Code, Clock, TrendingUp, Layers, ExternalLink } from 'lucide-react'
import { projectsAPI } from '@/utils/api'
import { roadmapAPI } from '@/utils/api'

const LEVEL_CONFIG = {
  beginner: { color: 'text-accent-teal bg-accent-teal/10 border-accent-teal/20', dot: 'bg-accent-teal', label: '🌱 Beginner' },
  intermediate: { color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20', dot: 'bg-accent-cyan', label: '🔥 Intermediate' },
  advanced: { color: 'text-accent-violet bg-accent-violet/10 border-accent-violet/20', dot: 'bg-accent-violet', label: '⚡ Advanced' },
}

function ProjectCard({ project, delay = 0 }) {
  const cfg = LEVEL_CONFIG[project.level] || LEVEL_CONFIG.beginner

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-6 flex flex-col gap-4 group">
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600/30 to-accent-cyan/20 flex items-center justify-center text-xl flex-shrink-0">
          💡
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-mono border ${cfg.color}`}>{cfg.label}</span>
      </div>

      <div>
        <h3 className="font-display font-semibold text-white mb-1">{project.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{project.description}</p>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {project.estimated_days}d</span>
        <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {project.tech_stack?.slice(0, 2).join(', ')}</span>
      </div>

      {project.skills_required?.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-2">Skills needed</div>
          <div className="flex flex-wrap gap-1.5">
            {project.skills_required.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
          </div>
        </div>
      )}

      {project.learning_outcomes?.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-2">You'll learn</div>
          <div className="flex flex-wrap gap-1.5">
            {project.learning_outcomes.map((o, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-primary-600/10 text-primary-300 border border-primary-500/20">{o}</span>
            ))}
          </div>
        </div>
      )}

      <button className="mt-auto btn-secondary text-sm py-2 flex items-center justify-center gap-2 group-hover:border-primary-400/40">
        <Code className="w-4 h-4" /> Start Project
      </button>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState('all')

  const { data: roadmap } = useQuery({ queryKey: ['active-roadmap'], queryFn: () => roadmapAPI.getActive().then(r => r.data), retry: false })

  const career = roadmap?.career || ''
  const phase = roadmap ? Math.max(1, Math.floor(roadmap.completion_percentage / 20)) : 1

  const { data, isLoading } = useQuery({
    queryKey: ['projects', career, phase],
    queryFn: () => projectsAPI.getRecommendations(career, phase).then(r => r.data),
  })

  const projects = data?.projects || []
  const filtered = filter === 'all' ? projects : projects.filter(p => p.level === filter)

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">Recommended Projects</h1>
        <p className="text-gray-400">
          {career ? `AI-curated projects for ${career} at your current level` : 'AI-curated projects to build your portfolio'}
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'beginner', 'intermediate', 'advanced'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-display font-medium transition-all ${filter === f ? 'bg-primary-600 text-white shadow-glow' : 'glass text-gray-400 hover:text-white'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-card p-6 h-64 animate-pulse">
              <div className="h-4 bg-surface-600 rounded mb-3 w-3/4" />
              <div className="h-3 bg-surface-600 rounded mb-2" />
              <div className="h-3 bg-surface-600 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => <ProjectCard key={i} project={p} delay={i * 0.07} />)}
        </div>
      )}
    </div>
  )
}
