import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Plus, X, User, BookOpen, Target, Link } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

const EDUCATION_OPTIONS = [
  { value: 'high_school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
  { value: 'self_taught', label: 'Self-Taught' },
]

function TagInput({ label, tags, onAdd, onRemove, placeholder }) {
  const [input, setInput] = useState('')
  const handleKeyDown = e => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      onAdd(input.trim())
      setInput('')
    }
  }
  return (
    <div>
      <label className="label">{label}</label>
      <div className="glass border border-white/10 rounded-xl p-3 focus-within:border-primary-500/60 transition-all">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, i) => (
            <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-600/20 text-primary-300 text-xs font-medium border border-primary-500/20">
              {tag}
              <button onClick={() => onRemove(i)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} className="bg-transparent border-none outline-none text-white text-sm placeholder-gray-500 w-full" placeholder={placeholder} />
      </div>
      <p className="text-xs text-gray-500 mt-1">Press Enter or comma to add</p>
    </div>
  )
}

export default function ProfilePage() {
  const { user, profile, updateMe, updateProfile } = useAuthStore()
  const [saving, setSaving] = useState(false)

  const [userForm, setUserForm] = useState({ first_name: '', last_name: '' })
  const [profileForm, setProfileForm] = useState({
    age: '', education_level: '', degree: '', college: '',
    current_skills: [], areas_of_interest: [], career_goals: '',
    bio: '', linkedin_url: '', github_url: '', location: '',
  })

  useEffect(() => {
    if (user) setUserForm({ first_name: user.first_name || '', last_name: user.last_name || '' })
    if (profile) setProfileForm({
      age: profile.age || '',
      education_level: profile.education_level || '',
      degree: profile.degree || '',
      college: profile.college || '',
      current_skills: profile.current_skills || [],
      areas_of_interest: profile.areas_of_interest || [],
      career_goals: profile.career_goals || '',
      bio: profile.bio || '',
      linkedin_url: profile.linkedin_url || '',
      github_url: profile.github_url || '',
      location: profile.location || '',
    })
  }, [user, profile])

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([updateMe(userForm), updateProfile(profileForm)])
      toast.success('Profile updated successfully!')
    } catch { toast.error('Failed to save profile.') }
    finally { setSaving(false) }
  }

  const addSkill = (s) => { if (!profileForm.current_skills.includes(s)) setProfileForm(f => ({ ...f, current_skills: [...f.current_skills, s] })) }
  const removeSkill = (i) => setProfileForm(f => ({ ...f, current_skills: f.current_skills.filter((_, idx) => idx !== i) }))
  const addInterest = (s) => { if (!profileForm.areas_of_interest.includes(s)) setProfileForm(f => ({ ...f, areas_of_interest: [...f.areas_of_interest, s] })) }
  const removeInterest = (i) => setProfileForm(f => ({ ...f, areas_of_interest: f.areas_of_interest.filter((_, idx) => idx !== i) }))

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">Profile</h1>
          <p className="text-gray-400">Keep your profile updated to get better career recommendations</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </motion.div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center text-3xl font-bold shadow-glow">
          {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-display font-bold text-xl text-white">{user?.first_name} {user?.last_name}</div>
          <div className="text-gray-400 text-sm">{user?.email}</div>
          <div className="text-xs text-gray-500 mt-1">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</div>
        </div>
      </motion.div>

      {/* Basic Info */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 space-y-5">
        <h2 className="font-display font-semibold text-white flex items-center gap-2"><User className="w-5 h-5 text-primary-400" /> Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">First Name</label><input value={userForm.first_name} onChange={e => setUserForm(f => ({...f, first_name: e.target.value}))} className="input" placeholder="Arpan" /></div>
          <div><label className="label">Last Name</label><input value={userForm.last_name} onChange={e => setUserForm(f => ({...f, last_name: e.target.value}))} className="input" placeholder="Aggarwal" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Age</label><input type="number" value={profileForm.age} onChange={e => setProfileForm(f => ({...f, age: e.target.value}))} className="input" placeholder="21" min="16" max="60" /></div>
          <div><label className="label">Location</label><input value={profileForm.location} onChange={e => setProfileForm(f => ({...f, location: e.target.value}))} className="input" placeholder="Ambala, Haryana" /></div>
        </div>
        <div><label className="label">Bio</label><textarea value={profileForm.bio} onChange={e => setProfileForm(f => ({...f, bio: e.target.value}))} className="input resize-none h-24" placeholder="Tell us about yourself..." /></div>
      </motion.div>

      {/* Education */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-5">
        <h2 className="font-display font-semibold text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-accent-cyan" /> Education</h2>
        <div>
          <label className="label">Education Level</label>
          <select value={profileForm.education_level} onChange={e => setProfileForm(f => ({...f, education_level: e.target.value}))} className="input">
            <option value="">Select level...</option>
            {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Degree / Field</label><input value={profileForm.degree} onChange={e => setProfileForm(f => ({...f, degree: e.target.value}))} className="input" placeholder="B.Tech Computer Science" /></div>
          <div><label className="label">College</label><input value={profileForm.college} onChange={e => setProfileForm(f => ({...f, college: e.target.value}))} className="input" placeholder="Ambala College of Engineering" /></div>
        </div>
      </motion.div>

      {/* Skills & Interests */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6 space-y-5">
        <h2 className="font-display font-semibold text-white flex items-center gap-2"><Target className="w-5 h-5 text-accent-teal" /> Skills & Interests</h2>
        <TagInput label="Current Skills" tags={profileForm.current_skills} onAdd={addSkill} onRemove={removeSkill} placeholder="Python, React, SQL..." />
        <TagInput label="Areas of Interest" tags={profileForm.areas_of_interest} onAdd={addInterest} onRemove={removeInterest} placeholder="Machine Learning, Web Dev, Cloud..." />
        <div><label className="label">Career Goals</label><textarea value={profileForm.career_goals} onChange={e => setProfileForm(f => ({...f, career_goals: e.target.value}))} className="input resize-none h-24" placeholder="I want to become an AI Engineer at a top tech company..." /></div>
      </motion.div>

      {/* Links */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 space-y-5">
        <h2 className="font-display font-semibold text-white flex items-center gap-2"><Link className="w-5 h-5 text-accent-violet" /> Social Links</h2>
        <div><label className="label">LinkedIn URL</label><input value={profileForm.linkedin_url} onChange={e => setProfileForm(f => ({...f, linkedin_url: e.target.value}))} className="input" placeholder="https://linkedin.com/in/yourprofile" /></div>
        <div><label className="label">GitHub URL</label><input value={profileForm.github_url} onChange={e => setProfileForm(f => ({...f, github_url: e.target.value}))} className="input" placeholder="https://github.com/yourusername" /></div>
      </motion.div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-8">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </button>
      </div>
    </div>
  )
}
