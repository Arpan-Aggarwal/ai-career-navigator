import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'
import { CheckCircle, XCircle, Clock, TrendingUp, Target } from 'lucide-react'
import { careersAPI, roadmapAPI } from '@/utils/api'

const CAREERS = ['AI Engineer','Machine Learning Engineer','Data Scientist','Backend Developer','Full Stack Developer','Cloud Engineer','DevOps Engineer','Data Analyst','Cybersecurity Engineer']

export default function ReadinessPage() {
  const [career, setCareer] = useState('')
  const [selected, setSelected] = useState('')

  const { data: roadmap } = useQuery({ queryKey: ['active-roadmap'], queryFn: () => roadmapAPI.getActive().then(r => r.data), retry: false })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['readiness', selected],
    queryFn: () => careersAPI.readiness(selected).then(r => r.data),
    enabled: !!selected,
    retry: false,
  })

  const handleCheck = () => {
    if (!career) return
    setSelected(career)
  }

  const score = data?.readiness_score || 0
  const gaugeData = [{ name: 'Score', value: score, fill: score >= 70 ? '#14b8a6' : score >= 40 ? '#5b6ef1' : '#8b5cf6' }]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">Career Readiness Score</h1>
        <p className="text-gray-400">See how ready you are for your target career and identify skill gaps.</p>
      </motion.div>

      {/* Career Selector */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="font-display font-semibold text-white mb-4">Select Target Career</h3>
        {roadmap && (
          <div className="mb-3">
            <button onClick={() => { setCareer(roadmap.career); setSelected(roadmap.career) }} className="text-sm text-accent-cyan hover:text-accent-teal transition-colors">
              Use my active roadmap career: {roadmap.career} →
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <select value={career} onChange={e => setCareer(e.target.value)} className="input flex-1">
            <option value="">Choose a career...</option>
            {CAREERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={handleCheck} disabled={!career} className="btn-primary px-6 disabled:opacity-50">Check</button>
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Score gauge + summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gauge */}
            <div className="glass-card p-6 text-center">
              <h3 className="font-display font-semibold text-white mb-2">Readiness Score</h3>
              <div className="relative h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="75%" innerRadius="70%" outerRadius="90%" data={gaugeData} startAngle={180} endAngle={0}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" angleAxisId={0} cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                  <div className="font-display font-bold text-4xl" style={{ color: gaugeData[0].fill }}>{score.toFixed(0)}</div>
                  <div className="text-xs text-gray-400">out of 100</div>
                </div>
              </div>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-mono ${score >= 70 ? 'bg-accent-teal/20 text-accent-teal' : score >= 40 ? 'bg-primary-600/20 text-primary-300' : 'bg-accent-violet/20 text-accent-violet'}`}>
                  {score >= 70 ? '🚀 Job Ready' : score >= 40 ? '📈 On Track' : '🌱 Early Stage'}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {[
                { icon: <Clock className="w-5 h-5 text-accent-cyan" />, label: 'Months to Ready', value: data.estimated_months },
                { icon: <TrendingUp className="w-5 h-5 text-accent-teal" />, label: 'Job Market', value: data.job_market },
                { icon: <Target className="w-5 h-5 text-primary-400" />, label: 'Avg Salary', value: data.avg_salary },
                { icon: <CheckCircle className="w-5 h-5 text-accent-teal" />, label: 'Skills Acquired', value: data.acquired_skills.length },
              ].map((s, i) => (
                <div key={i} className="glass-card p-4">
                  <div className="mb-2">{s.icon}</div>
                  <div className="font-display font-bold text-xl text-white">{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent-teal" /> Acquired Skills
              </h3>
              {data.acquired_skills.length > 0 ? (
                <div className="space-y-2">
                  {data.acquired_skills.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-accent-teal/10 border border-accent-teal/20">
                      <CheckCircle className="w-4 h-4 text-accent-teal flex-shrink-0" />
                      <span className="text-sm text-gray-200">{s}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm">No matching skills found. Update your profile with your current skills.</p>}
            </div>

            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" /> Skills to Learn
              </h3>
              <div className="space-y-2">
                {data.missing_skills.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-sm text-gray-200">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {!selected && !isLoading && (
        <div className="text-center py-16 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Select a career above to see your readiness score</p>
        </div>
      )}
    </div>
  )
}
