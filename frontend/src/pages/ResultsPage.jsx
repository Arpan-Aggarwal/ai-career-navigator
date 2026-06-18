import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Sparkles, Map, Target, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react'
import { assessmentAPI, careersAPI, roadmapAPI } from '@/utils/api'
import toast from 'react-hot-toast'

const SCORE_COLORS = ['#5b6ef1', '#22d3ee', '#14b8a6', '#8b5cf6', '#f59e0b', '#f87171']

export default function ResultsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false)
  const [durationMonths, setDurationMonths] = useState(6)

  const { data: assessment, isLoading: loadingAssessment } = useQuery({
    queryKey: ['assessment-result'],
    queryFn: () => assessmentAPI.getResult().then(r => r.data),
  })

  const { data: careers, isLoading: loadingCareers, refetch: refetchCareers } = useQuery({
    queryKey: ['career-recommendations'],
    queryFn: () => careersAPI.recommend().then(r => r.data),
    enabled: !!assessment,
    retry: false,
  })

  const generateRoadmap = async () => {
    if (!selectedCareer) { toast.error('Please select a career first.'); return }
    setGeneratingRoadmap(true)
    try {
      await roadmapAPI.generate(selectedCareer, durationMonths)
      queryClient.invalidateQueries(['active-roadmap'])
      toast.success(`${selectedCareer} roadmap generated!`)
      navigate('/roadmap')
    } catch {
      toast.error('Failed to generate roadmap. Try again.')
    } finally {
      setGeneratingRoadmap(false)
    }
  }

  if (loadingAssessment) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!assessment) return (
    <div className="max-w-lg mx-auto text-center py-20">
      <div className="text-6xl mb-6">🧠</div>
      <h2 className="font-display font-bold text-2xl text-white mb-3">No Assessment Found</h2>
      <p className="text-gray-400 mb-6">Take the aptitude assessment to get your personalized career recommendations.</p>
      <Link to="/assessment" className="btn-primary">Start Assessment</Link>
    </div>
  )

  const radarData = [
    { subject: 'Logic', A: assessment.logical_reasoning_score },
    { subject: 'Programming', A: assessment.programming_aptitude_score },
    { subject: 'Math', A: assessment.mathematical_thinking_score },
    { subject: 'Problem Solving', A: assessment.problem_solving_score },
    { subject: 'Communication', A: assessment.communication_score },
    { subject: 'Creativity', A: assessment.creativity_score },
  ]

  const barData = [
    { name: 'Logic', value: assessment.logical_reasoning_score },
    { name: 'Code', value: assessment.programming_aptitude_score },
    { name: 'Math', value: assessment.mathematical_thinking_score },
    { name: 'Problem\nSolving', value: assessment.problem_solving_score },
    { name: 'Comm', value: assessment.communication_score },
    { name: 'Creative', value: assessment.creativity_score },
  ]

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">Assessment Results</h1>
        <p className="text-gray-400">Your aptitude profile and personalized career recommendations</p>
      </motion.div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 text-center sm:col-span-1">
          <div className="font-display font-bold text-5xl gradient-text mb-2">{assessment.total_score.toFixed(0)}<span className="text-2xl text-gray-500">%</span></div>
          <div className="text-gray-300 font-medium">Overall Score</div>
          <div className="text-xs text-gray-500 mt-1">{assessment.total_score >= 70 ? 'Excellent' : assessment.total_score >= 50 ? 'Good' : 'Building up'}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 sm:col-span-2">
          <h3 className="font-display font-semibold text-white mb-4 text-sm">Score Breakdown</h3>
          <div className="space-y-3">
            {radarData.map((item, i) => (
              <div key={item.subject} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-20 flex-shrink-0">{item.subject}</span>
                <div className="flex-1 progress-bar">
                  <motion.div className="progress-fill" style={{ background: SCORE_COLORS[i] }} initial={{ width: 0 }} animate={{ width: `${item.A}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }} />
                </div>
                <span className="text-xs font-mono text-gray-300 w-10 text-right">{item.A.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-white mb-4">Aptitude Radar</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'DM Sans' }} />
              <Radar dataKey="A" stroke="#5b6ef1" fill="#5b6ef1" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-white mb-4">Category Scores</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={SCORE_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Career Recommendations */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-white">Career Recommendations</h2>
          <button onClick={() => refetchCareers()} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loadingCareers ? (
          <div className="glass-card p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Analysing your profile with AI...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careers?.recommendations?.map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.06 }}
                onClick={() => setSelectedCareer(rec.career)}
                className={`glass-card p-5 cursor-pointer transition-all duration-200 ${selectedCareer === rec.career ? 'border-primary-500/60 bg-primary-600/10 shadow-glow' : 'hover:border-white/20'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{rec.icon}</span>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium ${i === 0 ? 'bg-accent-teal/20 text-accent-teal' : 'bg-primary-600/20 text-primary-300'}`}>
                    {rec.match_score.toFixed(0)}% match
                  </div>
                </div>
                <h3 className="font-display font-semibold text-white mb-1">{rec.career}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">{rec.description}</p>
                <div className="progress-bar mb-2">
                  <motion.div className="progress-fill bg-gradient-to-r from-primary-600 to-primary-400" initial={{ width: 0 }} animate={{ width: `${rec.match_score}%` }} transition={{ duration: 0.7, delay: 0.5 + i * 0.06 }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{rec.avg_salary}</span>
                  <span className={`font-mono ${rec.job_market === 'Excellent' ? 'text-accent-teal' : 'text-accent-cyan'}`}>{rec.job_market}</span>
                </div>
                {selectedCareer === rec.career && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-primary-300">
                    <CheckCircle className="w-3.5 h-3.5" /> Selected for roadmap
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Generate Roadmap CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
        <h3 className="font-display font-semibold text-white mb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-cyan" /> Generate Your Roadmap
        </h3>
        <p className="text-sm text-gray-400 mb-5">
          {selectedCareer ? `Generating a personalized roadmap for ${selectedCareer}` : 'Select a career above first, then choose your timeline'}
        </p>

        {/* Duration Picker */}
        <div className="mb-5">
          <label className="label mb-3">⏱️ How long do you want to spend learning?</label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {[1, 2, 3, 4, 6, 9, 12].map(m => (
              <button
                key={m}
                onClick={() => setDurationMonths(m)}
                className={`py-2.5 rounded-xl text-sm font-display font-semibold transition-all duration-200 border ${
                  durationMonths === m
                    ? 'bg-primary-600 border-primary-500 text-white shadow-glow'
                    : 'glass border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {m}mo
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span className={`px-2 py-0.5 rounded-full font-mono ${
              durationMonths <= 2 ? 'bg-red-500/20 text-red-400' :
              durationMonths <= 4 ? 'bg-amber-500/20 text-amber-400' :
              durationMonths <= 6 ? 'bg-accent-cyan/20 text-accent-cyan' :
              'bg-accent-teal/20 text-accent-teal'
            }`}>
              {durationMonths <= 2 ? '⚡ Crash Course' :
              durationMonths <= 4 ? '🎯 Focused Sprint' :
              durationMonths <= 6 ? '⚖️ Balanced' : '🏆 Comprehensive'}
            </span>
            <span>
              {durationMonths <= 2 ? 'Essentials only — fast but intense' :
              durationMonths <= 4 ? 'Core skills — skips nice-to-haves' :
              durationMonths <= 6 ? 'Solid foundations with projects' :
              'Deep knowledge with advanced topics'}
            </span>
          </div>
        </div>

        <button onClick={generateRoadmap} disabled={!selectedCareer || generatingRoadmap}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {generatingRoadmap
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Map className="w-4 h-4" />}
          {generatingRoadmap ? `Generating ${durationMonths}-month roadmap...` : `Generate ${durationMonths}-month Roadmap`}
        </button>
      </motion.div>

      {/* Explanation */}
      {careers?.recommendations?.[0]?.explanation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="glass-card p-6">
          <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-cyan" /> AI Analysis — {careers.top_career}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">{careers.recommendations[0].explanation}</p>
        </motion.div>
      )}
    </div>
  )
}
