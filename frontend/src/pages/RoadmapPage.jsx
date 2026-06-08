import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Circle, ChevronDown, ChevronUp, BookOpen, Code, Award, Clock, Sparkles } from 'lucide-react'
import { roadmapAPI } from '@/utils/api'
import toast from 'react-hot-toast'

function PhaseCard({ phase, milestones, onToggleMilestone, isExpanded, onToggle }) {
  const phaseMilestones = milestones.filter(m => m.phase_number === phase.phase_number)
  const completed = phaseMilestones.filter(m => m.is_completed).length
  const total = phaseMilestones.length
  const progress = total > 0 ? (completed / total) * 100 : 0

  const colors = ['from-primary-600 to-primary-400', 'from-accent-cyan to-primary-500', 'from-accent-teal to-accent-cyan', 'from-accent-violet to-primary-600', 'from-amber-500 to-accent-amber']
  const color = colors[(phase.phase_number - 1) % colors.length]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: phase.phase_number * 0.08 }}>
      <div className={`glass-card overflow-hidden ${isExpanded ? 'border-primary-500/30' : ''}`}>
        {/* Phase header */}
        <button onClick={onToggle} className="w-full p-6 text-left flex items-start gap-4 group">
          {/* Number badge */}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-display font-bold text-sm flex-shrink-0 shadow-glow`}>
            {phase.phase_number}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-display font-semibold text-white">{phase.title}</h3>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs font-mono text-gray-400">{phase.duration_weeks}w</span>
                <span className="text-xs font-mono text-gray-400">{completed}/{total}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-3">{phase.description}</p>
            <div className="progress-bar">
              <motion.div className={`progress-fill bg-gradient-to-r ${color}`} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.7 }} />
            </div>
          </div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="px-6 pb-6 space-y-6 border-t border-white/5 pt-4">
                {/* Topics */}
                {phase.topics?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-display font-semibold text-white mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-accent-cyan" /> Topics to Learn
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {phase.topics.map((topic, i) => (
                        <div key={i} className="glass p-3 rounded-xl">
                          <div className="font-medium text-white text-sm mb-1">{topic.name}</div>
                          <p className="text-xs text-gray-400 mb-2">{topic.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {topic.resources?.slice(0, 2).map((r, j) => <span key={j} className="skill-tag text-xs">{r}</span>)}
                            </div>
                            <span className="text-xs font-mono text-gray-500">{topic.estimated_hours}h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {phase.projects?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-display font-semibold text-white mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4 text-accent-teal" /> Projects to Build
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.projects.map((p, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-accent-teal/10 border border-accent-teal/20 text-accent-teal text-xs font-medium">{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {phase.certifications?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-display font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-accent-amber" /> Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.certifications.map((c, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {phaseMilestones.length > 0 && (
                  <div>
                    <h4 className="text-sm font-display font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-400" /> Milestones
                    </h4>
                    <div className="space-y-2">
                      {phaseMilestones.map(m => (
                        <button key={m.id} onClick={() => onToggleMilestone(m.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${m.is_completed ? 'bg-accent-teal/10 border border-accent-teal/20' : 'glass border-white/5 hover:border-white/10'}`}>
                          {m.is_completed ? <CheckCircle className="w-5 h-5 text-accent-teal flex-shrink-0" /> : <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />}
                          <span className={`text-sm ${m.is_completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>{m.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function RoadmapPage() {
  const [expandedPhase, setExpandedPhase] = useState(1)
  const queryClient = useQueryClient()

  const { data: roadmap, isLoading } = useQuery({
    queryKey: ['active-roadmap'],
    queryFn: () => roadmapAPI.getActive().then(r => r.data),
    retry: false,
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => roadmapAPI.completeMilestone(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['active-roadmap'])
      toast.success(data.data.milestone.is_completed ? 'Milestone completed! 🎉' : 'Milestone unchecked')
    },
    onError: () => toast.error('Failed to update milestone'),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!roadmap) return (
    <div className="max-w-lg mx-auto text-center py-20">
      <div className="text-6xl mb-6">🗺️</div>
      <h2 className="font-display font-bold text-2xl text-white mb-3">No Roadmap Yet</h2>
      <p className="text-gray-400 mb-6">Take the assessment and get career recommendations first, then generate your personalized roadmap.</p>
      <Link to="/results" className="btn-primary">View Career Recommendations</Link>
    </div>
  )

  const phases = roadmap.data?.phases || []
  const keySkills = roadmap.data?.key_skills || []
  const tools = roadmap.data?.tools || []

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="section-badge"><Sparkles className="w-3 h-3" /> AI Generated</span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">{roadmap.career} Roadmap</h1>
            <p className="text-gray-400 mt-1">
              <Clock className="inline w-4 h-4 mr-1" />{roadmap.total_duration_months} month journey · {phases.length} phases
            </p>
          </div>
          <div className="glass-card px-5 py-3 text-center">
            <div className="font-display font-bold text-2xl gradient-text">{roadmap.completion_percentage.toFixed(0)}%</div>
            <div className="text-xs text-gray-400">Complete</div>
          </div>
        </div>

        {/* Overall progress */}
        <div className="mt-4 progress-bar h-2">
          <motion.div className="progress-fill bg-gradient-to-r from-primary-500 via-accent-cyan to-accent-teal" initial={{ width: 0 }} animate={{ width: `${roadmap.completion_percentage}%` }} transition={{ duration: 1 }} />
        </div>
      </motion.div>

      {/* Skills & Tools */}
      {(keySkills.length > 0 || tools.length > 0) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {keySkills.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-sm font-display font-semibold text-white mb-3">Key Skills</h3>
              <div className="flex flex-wrap gap-2">{keySkills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}</div>
            </div>
          )}
          {tools.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-sm font-display font-semibold text-white mb-3">Tools & Technologies</h3>
              <div className="flex flex-wrap gap-2">{tools.map((t, i) => <span key={i} className="px-3 py-1 rounded-full text-xs font-mono bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">{t}</span>)}</div>
            </div>
          )}
        </motion.div>
      )}

      {/* Phases */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-white">Learning Phases</h2>
        {phases.map(phase => (
          <PhaseCard
            key={phase.phase_number}
            phase={phase}
            milestones={roadmap.milestones || []}
            onToggleMilestone={(id) => toggleMutation.mutate(id)}
            isExpanded={expandedPhase === phase.phase_number}
            onToggle={() => setExpandedPhase(expandedPhase === phase.phase_number ? null : phase.phase_number)}
          />
        ))}
      </div>
    </div>
  )
}
