import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Brain, Map, Target, FolderGit2, ArrowRight, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import useAuthStore from '@/store/authStore'
import { assessmentAPI, careersAPI, roadmapAPI } from '@/utils/api'

function StatCard({ icon, label, value, sub, color = 'primary', href }) {
  const colorMap = {
    primary: 'from-primary-600/30 to-primary-500/10 border-primary-500/20 text-primary-400',
    cyan: 'from-accent-cyan/20 to-accent-cyan/5 border-accent-cyan/20 text-accent-cyan',
    teal: 'from-accent-teal/20 to-accent-teal/5 border-accent-teal/20 text-accent-teal',
    violet: 'from-accent-violet/20 to-accent-violet/5 border-accent-violet/20 text-accent-violet',
  }
  const Wrap = href ? Link : 'div'
  return (
    <Wrap to={href} className={`glass-card p-5 bg-gradient-to-br ${colorMap[color]} group ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center bg-gradient-to-br ${colorMap[color]}`}>
          {icon}
        </div>
        {href && <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />}
      </div>
      <div className="font-display font-bold text-2xl text-white mb-0.5">{value}</div>
      <div className="text-sm font-medium text-gray-300">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </Wrap>
  )
}

function QuickAction({ icon, title, description, href, cta }) {
  return (
    <Link to={href} className="glass-card p-5 flex gap-4 items-start group hover:border-primary-500/30 transition-all">
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-semibold text-white text-sm mb-1">{title}</h4>
        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      </div>
      <span className="text-xs text-primary-400 font-medium whitespace-nowrap group-hover:text-primary-300 transition-colors">{cta} →</span>
    </Link>
  )
}

export default function DashboardPage() {
  const { user, profile } = useAuthStore()

  const { data: assessmentData } = useQuery({
    queryKey: ['assessment-result'],
    queryFn: () => assessmentAPI.getResult().then(r => r.data),
    retry: false,
  })

  const { data: careerData } = useQuery({
    queryKey: ['career-recommendations'],
    queryFn: () => careersAPI.recommend().then(r => r.data),
    enabled: !!assessmentData,
    retry: false,
  })

  const { data: roadmapData } = useQuery({
    queryKey: ['active-roadmap'],
    queryFn: () => roadmapAPI.getActive().then(r => r.data),
    retry: false,
  })

  const hasAssessment = !!assessmentData
  const hasRoadmap = !!roadmapData

  const radarData = assessmentData ? [
    { subject: 'Logic', A: assessmentData.logical_reasoning_score },
    { subject: 'Programming', A: assessmentData.programming_aptitude_score },
    { subject: 'Math', A: assessmentData.mathematical_thinking_score },
    { subject: 'Problem Solving', A: assessmentData.problem_solving_score },
    { subject: 'Communication', A: assessmentData.communication_score },
    { subject: 'Creativity', A: assessmentData.creativity_score },
  ] : []

  const firstName = user?.first_name || user?.username || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-gray-400">
              {!hasAssessment ? 'Start by taking your aptitude assessment to unlock your career roadmap.' :
               !hasRoadmap ? 'Your assessment is complete! Generate your personalized roadmap now.' :
               `You're ${roadmapData.completion_percentage.toFixed(0)}% through your ${roadmapData.career} roadmap.`}
            </p>
          </div>
          {!hasAssessment && (
            <Link to="/assessment" className="btn-primary flex items-center gap-2">
              <Brain className="w-4 h-4" /> Take Assessment
            </Link>
          )}
          {hasAssessment && !hasRoadmap && (
            <Link to="/results" className="btn-primary flex items-center gap-2">
              <Map className="w-4 h-4" /> Generate Roadmap
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Brain className="w-5 h-5 text-primary-400" />} label="Assessment Score" value={hasAssessment ? `${assessmentData.total_score.toFixed(0)}%` : '—'} sub={hasAssessment ? 'Completed' : 'Not taken'} color="primary" href="/results" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-accent-cyan" />} label="Top Career Match" value={careerData?.recommendations?.[0]?.match_score ? `${careerData.recommendations[0].match_score.toFixed(0)}%` : '—'} sub={careerData?.top_career || 'Pending'} color="cyan" href="/results" />
        <StatCard icon={<Map className="w-5 h-5 text-accent-teal" />} label="Roadmap Progress" value={hasRoadmap ? `${roadmapData.completion_percentage.toFixed(0)}%` : '—'} sub={hasRoadmap ? `${roadmapData.career}` : 'No roadmap yet'} color="teal" href="/roadmap" />
        <StatCard icon={<Target className="w-5 h-5 text-accent-violet" />} label="Skills in Profile" value={profile?.current_skills?.length || 0} sub="Listed skills" color="violet" href="/profile" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        {hasAssessment && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h3 className="font-display font-semibold text-white mb-4">Aptitude Profile</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'DM Sans' }} />
                <Radar name="Score" dataKey="A" stroke="#5b6ef1" fill="#5b6ef1" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`space-y-3 ${hasAssessment ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <h3 className="font-display font-semibold text-white">Quick Actions</h3>
          <QuickAction icon="🧠" title="Aptitude Assessment" description="Test your logical reasoning, programming aptitude, math, and more." href="/assessment" cta={hasAssessment ? 'Retake' : 'Start'} />
          <QuickAction icon="🎯" title="Career Recommendations" description="See which tech careers match your aptitude and interests." href="/results" cta="View" />
          <QuickAction icon="🗺️" title="Learning Roadmap" description={hasRoadmap ? `Continue your ${roadmapData.career} journey.` : 'Generate your personalized learning path.'} href="/roadmap" cta={hasRoadmap ? 'Continue' : 'Generate'} />
          <QuickAction icon="💡" title="Project Ideas" description="Get AI-recommended projects for your current level." href="/projects" cta="Explore" />
          <QuickAction icon="📊" title="Readiness Score" description="See how close you are to being job-ready with skill gap analysis." href="/readiness-score" cta="Check" />
        </motion.div>
      </div>

      {/* Active Roadmap Preview */}
      {hasRoadmap && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-white text-lg">{roadmapData.career} Roadmap</h3>
              <p className="text-sm text-gray-400">{roadmapData.total_duration_months} month journey</p>
            </div>
            <Link to="/roadmap" className="btn-secondary text-sm py-2">View Full Roadmap →</Link>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Overall Progress</span>
              <span className="text-white font-mono font-medium">{roadmapData.completion_percentage.toFixed(0)}%</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill bg-gradient-to-r from-primary-500 to-accent-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${roadmapData.completion_percentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {roadmapData.milestones?.slice(0, 6).map(m => (
              <div key={m.id} className={`flex items-center gap-2 p-3 rounded-xl text-sm ${m.is_completed ? 'bg-accent-teal/10 border border-accent-teal/20' : 'bg-surface-700'}`}>
                {m.is_completed
                  ? <CheckCircle className="w-4 h-4 text-accent-teal flex-shrink-0" />
                  : <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                <span className={m.is_completed ? 'text-gray-300 line-through' : 'text-gray-400'}>{m.title}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top Career Matches */}
      {careerData?.recommendations && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-white text-lg">Your Top Career Matches</h3>
            <Link to="/results" className="text-sm text-primary-400 hover:text-primary-300">See all →</Link>
          </div>
          <div className="space-y-4">
            {careerData.recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-2xl w-8 flex-shrink-0">{rec.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-medium text-white text-sm">{rec.career}</span>
                    <span className="font-mono text-sm text-primary-400">{rec.match_score.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill bg-gradient-to-r from-primary-600 to-primary-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${rec.match_score}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
