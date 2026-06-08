# 🧭 AI Career Navigator

A full-stack AI-powered career guidance platform built with **Django REST Framework** + **React + Vite**, using **Groq (LLaMA 3.3)** for AI features.

---

## 🏗️ Project Structure

```
career-navigator/
├── backend/                          # Django Backend
│   ├── career_navigator/             # Django project config
│   │   ├── __init__.py
│   │   ├── settings.py               # All settings (JWT, CORS, Groq, DB)
│   │   ├── urls.py                   # Root URL configuration
│   │   └── wsgi.py
│   ├── apps/                         # Django apps
│   │   ├── users/                    # Auth, User model, Profile
│   │   │   ├── models.py             # User (AbstractUser) + UserProfile
│   │   │   ├── serializers.py
│   │   │   ├── views.py              # Register, Login, Google OAuth, Me, Profile
│   │   │   └── urls.py
│   │   ├── assessment/               # Aptitude assessment
│   │   │   ├── models.py             # QUESTIONS bank + AssessmentResult
│   │   │   ├── serializers.py
│   │   │   ├── views.py              # Questions, Submit, Result, History
│   │   │   └── urls.py
│   │   ├── careers/                  # Career recommendations + readiness
│   │   │   ├── models.py             # CAREER_DEFINITIONS + CareerRecommendation
│   │   │   ├── serializers.py
│   │   │   ├── views.py              # Recommend (rule-based + AI), Readiness, List
│   │   │   └── urls.py
│   │   ├── roadmap/                  # Roadmap generation + milestone tracking
│   │   │   ├── models.py             # Roadmap + RoadmapMilestone
│   │   │   ├── serializers.py
│   │   │   ├── views.py              # Generate (Groq), Active, List, CompleteMilestone
│   │   │   └── urls.py
│   │   └── projects/                 # Project recommendations
│   │       ├── views.py              # AI project recommendations
│   │       └── urls.py
│   ├── services/
│   │   └── groq_service.py           # All Groq API calls (primary + fallback models)
│   ├── requirements.txt
│   ├── manage.py
│   └── .env.example
│
└── frontend/                         # React + Vite Frontend
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       ├── Layout.jsx          # Public navbar + footer
    │   │       └── DashboardLayout.jsx # Sidebar + topbar for protected pages
    │   ├── pages/
    │   │   ├── HomePage.jsx            # Hero, Features, How it works, CTA
    │   │   ├── AboutPage.jsx           # About + FeaturesPage + FAQPage + ContactPage
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx       # Stats, radar chart, quick actions
    │   │   ├── AssessmentPage.jsx      # Timer, question nav, submission
    │   │   ├── ResultsPage.jsx         # Scores, charts, career recs, roadmap gen
    │   │   ├── RoadmapPage.jsx         # Interactive phase cards, milestone tracking
    │   │   ├── ProjectsPage.jsx        # AI project recommendations by level
    │   │   ├── ReadinessPage.jsx       # Radial gauge, skill gap analysis
    │   │   ├── ProfilePage.jsx         # Full profile editing with tag inputs
    │   │   └── SettingsPage.jsx
    │   ├── store/
    │   │   └── authStore.js            # Zustand store: auth state + actions
    │   ├── utils/
    │   │   └── api.js                  # Axios client + all API modules
    │   ├── styles/
    │   │   └── globals.css             # Tailwind + custom utilities
    │   ├── App.jsx                     # Router with protected + public routes
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── .env.example
```

---

## 🚀 Local Setup (Step-by-Step)

### Prerequisites
- Python 3.10+
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free)

---

### Backend Setup

```bash
# 1. Navigate to backend
cd career-navigator/backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate it
# Linux / Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Set up environment variables
cp .env.example .env
# Now edit .env and add your GROQ_API_KEY

# 6. Run database migrations
python manage.py makemigrations users assessment careers roadmap projects
python manage.py migrate

# 7. Create admin superuser (optional)
python manage.py createsuperuser

# 8. Start development server
python manage.py runserver
```

Backend will be live at: **http://localhost:8000**
Django Admin at: **http://localhost:8000/admin/**

---

### Frontend Setup

```bash
# 1. Navigate to frontend
cd career-navigator/frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000/api

# 4. Start development server
npm run dev
```

Frontend will be live at: **http://localhost:5173**

---

## 🗄️ Django Apps Overview

| App | Purpose |
|-----|---------|
| `apps.users` | Custom User model, JWT auth, Google OAuth, UserProfile |
| `apps.assessment` | 15-question bank, submission, scoring engine, history |
| `apps.careers` | Rule-based career matching, Groq explanations, readiness score |
| `apps.roadmap` | Groq roadmap generation, milestone tracking, completion % |
| `apps.projects` | Groq project recommendations by career + phase |

---

## 🌐 API Endpoints

### Auth (`/api/auth/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register/` | Register new user |
| POST | `/login/` | Login → returns JWT tokens |
| POST | `/logout/` | Blacklist refresh token |
| POST | `/google/` | Google OAuth login |
| POST | `/token/refresh/` | Refresh access token |
| GET/PATCH | `/me/` | Get/update current user |
| GET/PATCH | `/profile/` | Get/update user profile |
| POST | `/password-reset/` | Request reset email |
| POST | `/password-reset/confirm/` | Confirm new password |

### Assessment (`/api/assessment/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/questions/` | Get all 15 questions (no answers) |
| POST | `/submit/` | Submit answers → get scores |
| GET | `/result/` | Get latest assessment result |
| GET | `/history/` | Get assessment history (last 10) |

### Careers (`/api/careers/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all 9 career paths |
| GET | `/recommend/` | Get AI career recommendations |
| GET | `/readiness/?career=X` | Get readiness score for career |

### Roadmap (`/api/roadmap/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate/` | Generate AI roadmap `{career: "X"}` |
| GET | `/active/` | Get active roadmap |
| GET | `/` | Get all roadmaps |
| POST | `/milestones/<id>/complete/` | Toggle milestone complete |

### Projects (`/api/projects/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations/?career=X&phase=1` | Get AI project recommendations |

---

## ☁️ Deployment

### Backend → Render (Free tier)

1. Push backend code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `gunicorn career_navigator.wsgi:application`
5. Add all environment variables from `.env.example`
6. Set `DATABASE_URL` to your Neon PostgreSQL URL
7. Set `DEBUG=False`, `ALLOWED_HOSTS=your-app.onrender.com`

### Database → Neon PostgreSQL (Free tier)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string → paste as `DATABASE_URL` in Render

### Frontend → Vercel (Free tier)

1. Push frontend to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set **Framework Preset**: Vite
4. Add environment variable: `VITE_API_URL=https://your-render-app.onrender.com/api`
5. Deploy

---

## 🔑 Environment Variables Reference

### Backend `.env`
```
SECRET_KEY=your-50-char-secret-key
DEBUG=False
ALLOWED_HOSTS=your-app.onrender.com,localhost
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
DATABASE_URL=postgresql://user:pass@host/dbname
GROQ_API_KEY=gsk_...
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend `.env`
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
```

---

## 🛠️ Useful Django Commands

```bash
# Generate a new SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Make migrations for a specific app
python manage.py makemigrations users
python manage.py makemigrations assessment
python manage.py makemigrations careers
python manage.py makemigrations roadmap
python manage.py makemigrations projects

# Run all migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files (for deployment)
python manage.py collectstatic --noinput

# Django shell
python manage.py shell

# Check for any issues
python manage.py check
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#5b6ef1` (indigo-blue) |
| Accent Cyan | `#22d3ee` |
| Accent Teal | `#14b8a6` |
| Surface 900 | `#0a0a0f` |
| Display Font | Space Grotesk |
| Body Font | DM Sans |
| Mono Font | JetBrains Mono |

---

## 📦 Tech Stack

### Backend
- Django 4.2 + Django REST Framework
- SimpleJWT (access + refresh + blacklist)
- django-cors-headers
- Groq API (LLaMA 3.3 70B + 3.1 8B fallback)
- WhiteNoise (static files)
- Gunicorn (WSGI)
- Neon PostgreSQL (production)

### Frontend
- React 18 + Vite
- React Router v6
- Tailwind CSS 3
- Framer Motion (animations)
- Recharts (charts)
- TanStack Query v5 (data fetching)
- Zustand (auth state)
- Axios (HTTP + token interceptors)
- React Hot Toast

---

## 📄 License

MIT — free to use, modify, and showcase in your portfolio.
