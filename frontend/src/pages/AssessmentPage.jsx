import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { assessmentAPI } from '@/utils/api'
import toast from 'react-hot-toast'

const CATEGORY_LABELS = {
  logical_reasoning: '🧩 Logical Reasoning',
  programming_aptitude: '💻 Programming',
  mathematical_thinking: '📐 Mathematics',
  problem_solving: '🎯 Problem Solving',
  communication: '💬 Communication',
  creativity: '✨ Creativity',
}

const TOTAL_TIME = 20 * 60 // 20 minutes

function useTimer(initial, onEnd) {
  const [time, setTime] = useState(initial)
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(interval); onEnd(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  return time
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function AssessmentPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['assessment-questions'],
    queryFn: () => assessmentAPI.getQuestions().then(r => r.data),
  })

  const submitMutation = useMutation({
    mutationFn: (payload) => assessmentAPI.submit(payload),
    onSuccess: () => {
      toast.success('Assessment complete! Analysing your results...')
      navigate('/results')
    },
    onError: () => toast.error('Submission failed. Please try again.'),
  })

  const handleSubmit = useCallback(() => {
    if (submitted) return
    setSubmitted(true)
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : TOTAL_TIME
    const payload = { answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v])), time_taken_seconds: timeTaken }
    submitMutation.mutate(payload)
  }, [answers, startTime, submitted])

  const timeLeft = useTimer(TOTAL_TIME, handleSubmit)
  const questions = data?.questions || []
  const total = questions.length

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 text-center">
          <div className="text-6xl mb-6">🧠</div>
          <h1 className="font-display font-bold text-3xl text-white mb-3">Aptitude Assessment</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            This 15-question assessment evaluates your logical reasoning, programming aptitude, mathematical thinking, problem solving, communication, and creativity. Take your time — the results determine your career recommendations.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[['15', 'Questions'], ['20 min', 'Time Limit'], ['6', 'Categories']].map(([v, l]) => (
              <div key={l} className="glass p-4 text-center">
                <div className="font-display font-bold text-2xl gradient-text">{v}</div>
                <div className="text-xs text-gray-400 mt-1">{l}</div>
              </div>
            ))}
          </div>
          <div className="text-left glass p-4 rounded-xl mb-8 space-y-2">
            {['Read each question carefully before answering.', 'You can navigate between questions freely.', 'All questions must be answered before submitting.', 'The timer starts when you click Begin.'].map(tip => (
              <div key={tip} className="flex items-start gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-accent-teal mt-0.5 flex-shrink-0" />
                {tip}
              </div>
            ))}
          </div>
          <button onClick={() => { setStarted(true); setStartTime(Date.now()) }} className="btn-primary px-12 py-4 text-lg">
            Begin Assessment 🚀
          </button>
        </motion.div>
      </div>
    )
  }

  if (isLoading) return (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white font-display font-semibold mb-1">Generating your questions...</p>
      <p className="text-gray-400 text-sm">AI is creating unique questions just for you.<br />This takes 15–20 seconds.</p>
    </div>
  </div>
)

  const q = questions[current]
  const answered = Object.keys(answers).length
  const progress = (answered / total) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-mono text-sm text-gray-400">Question {current + 1}/{total}</div>
          <span className="px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-300 text-xs font-mono">{CATEGORY_LABELS[q?.category]}</span>
        </div>
        <div className={`flex items-center gap-2 font-mono text-sm font-medium ${timeLeft < 120 ? 'text-red-400' : 'text-accent-cyan'}`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar h-1.5">
        <motion.div className="progress-fill bg-gradient-to-r from-primary-500 to-accent-cyan" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="glass-card p-8">
          <div className="mb-2 flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs rounded-full font-mono ${q?.difficulty === 1 ? 'bg-accent-teal/20 text-accent-teal' : q?.difficulty === 2 ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-accent-amber/20 text-accent-amber'}`}>
              {q?.difficulty === 1 ? 'Easy' : q?.difficulty === 2 ? 'Medium' : 'Hard'}
            </span>
          </div>
          <h2 className="font-display font-semibold text-white text-lg sm:text-xl mb-8 leading-relaxed">{q?.question}</h2>
          <div className="space-y-3">
            {q?.options.map((opt, idx) => {
              const selected = answers[String(q.id)] === idx
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setAnswers({ ...answers, [String(q.id)]: idx })}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 font-body text-sm ${selected ? 'bg-primary-600/30 border-primary-500/60 text-white shadow-glow' : 'glass border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5'}`}
                >
                  <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-mono mr-3 flex-shrink-0 ${selected ? 'bg-primary-500 text-white' : 'bg-surface-600 text-gray-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="btn-secondary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {/* Question dots */}
        <div className="hidden sm:flex gap-1 flex-wrap justify-center max-w-xs">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-6 h-6 rounded-full text-xs font-mono transition-all ${i === current ? 'bg-primary-500 text-white scale-110' : answers[String(questions[i]?.id)] !== undefined ? 'bg-accent-teal/60 text-white' : 'bg-surface-600 text-gray-500 hover:bg-surface-500'}`}>
              {i + 1}
            </button>
          ))}
        </div>

        {current < total - 1
          ? <button onClick={() => setCurrent(c => c + 1)} className="btn-primary flex items-center gap-2">Next <ChevronRight className="w-4 h-4" /></button>
          : <button onClick={handleSubmit} disabled={submitMutation.isPending || submitted} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {submitMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Submit</>}
            </button>
        }
      </div>

      {/* Unanswered warning */}
      {answered < total && (
        <div className="flex items-center gap-2 text-sm text-amber-400/80">
          <AlertCircle className="w-4 h-4" />
          {total - answered} question{total - answered !== 1 ? 's' : ''} unanswered
        </div>
      )}
    </div>
  )
}
