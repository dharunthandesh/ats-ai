# TalentPulse ATS — AI-Enabled Recruitment & Candidate Tracking Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Frontend-React_18_%2B_Vite_6-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Backend-Express_4.21-blue.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Theme-Electric_Violet_NexHire-5200ff.svg)](https://tailwindcss.com/)

TalentPulse ATS is an end-to-end recruitment management and intelligent candidate tracking application. It bridges the gap between hiring teams and candidate evaluations by pairing an interactive React/Tailwind Kanban pipeline with an explainable AI/NLP resume parsing and scoring engine.

---

## 1. Project Overview & Core Features

- **Role-Based Access Control (RBAC):** Three distinct roles (`HR_ADMIN`, `RECRUITER`, `INTERVIEWER`) with strict route guards, token validation, and privilege-escalation mitigation.
- **Resume Upload & Parsing:** Multi-format ingestion (`.pdf` and `.docx`) extracting candidate identities, contact details, work experience, education history, and technical skill taxonomy.
- **Explainable Multi-Factor AI Matching:** Transparent 0–100 candidate ranking algorithm that breaks down skill alignments, experience thresholds, educational pedigree, and contextual cosine similarity.
- **Interactive Recruitment Kanban Pipeline:** Full 9-stage progression workflow:
  `APPLIED` ➔ `SCREENING` ➔ `SHORTLISTED` ➔ `INTERVIEW_SCHEDULED` ➔ `TECHNICAL_ROUND` ➔ `HR_ROUND` ➔ `OFFER_EXTENDED` ➔ `HIRED` or `REJECTED`.
- **Structured Interviewing & Scorecards:** Panel interview scheduling, calendar synchronization notes, and 5-dimensional numerical evaluation scorecards with hiring recommendations.
- **Analytics & Telemetry Exports:** Real-time requisition funnel telemetry with single-click CSV tabular exports and branded PDF executive reports.
- **Modern UI Theme (NexHire Aesthetic):** Electric Violet (`#5200ff`) design system, Outfit typography, dark accent sidebars, pill badges, and radial backdrops.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3.4, React Router v7, Lucide Icons, Chart.js, `@hello-pangea/dnd` |
| **Backend API** | Node.js (>=18.0.0), Express 4.21, Mongoose 8.9, Multer, Helmet, Morgan, Express Rate Limit |
| **Parsing & NLP** | `pdf-parse`, `mammoth` (DOCX), TF-IDF tokenizer, Cosine Vector Similarity, Rule-based skill alias taxonomy |
| **Document Generation** | `pdfkit` (Executive PDF reporting), `json2csv` (Applicant data exports) |
| **Database** | MongoDB 6+ / MongoDB Atlas with automatic fallback to embedded `mongodb-memory-server` in dev |
| **Notifications** | Nodemailer (SMTP transport with console logger mock fallback), `node-cron` scheduler |

---

## 3. High-Level Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 React 18 Single-Page Client                 │
│        (Vite Dev Server / Production Static Bundle)         │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP / JSON API              │ Static Files
               ▼                              │ (/uploads)
┌─────────────────────────────────────────────┴───────────────┐
│              Express.js API Layer (v1 Routes)               │
│  ├── /auth          (JWT Authentication, RBAC, Rate Limiter) │
│  ├── /jobs          (Requisition CRUD & Filter Engine)      │
│  ├── /candidates    (Multer File Upload & Entity Extraction)│
│  ├── /applications  (Pipeline Stages, Offers, Re-ranking)   │
│  ├── /interviews    (Scheduling, Panel Assignments)         │
│  ├── /evaluations   (5-Axis Scorecards & Recommendations)   │
│  └── /analytics     (Aggregations, CSV & PDF Streams)       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│      NLP & Matching Engine   │ │     Persistence & Database   │
│  ├── PDF & DOCX Extractors   │ │  ├── MongoDB Atlas / Local   │
│  ├── Skill Taxonomy & Alias  │ │  └── Memory Server Fallback  │
│  ├── Cosine Text Similarity  │ │       (mongodb-memory-server)│
│  └── Explainability Reasoner │ └──────────────────────────────┘
└──────────────────────────────┘
```

---

## 4. Prerequisites & Runtime Requirements

- **Node.js:** `v18.0.0` or higher (`v20.x` recommended). Verify with `node -v`.
- **npm:** `v9.0.0` or higher. Verify with `npm -v`.
- **OS:** Cross-platform (Windows, macOS, Linux).
- **MongoDB:** *(Optional in dev)* Local MongoDB service running on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cluster URI. If absent, the backend automatically starts an embedded memory server.

---

## 5. Installation Instructions

Clone the repository and install root, server, and client dependencies:

```bash
# Clone the repository
git clone <repository-url>
cd "FSD project"

# Install all dependencies across root, server, and client
npm run install:all
```

Alternatively, install each workspace manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

---

## 6. Safe Environment Configuration

Create your server environment file from the provided example template:

```bash
cp server/.env.example server/.env
```

Review and adjust `server/.env`:
```ini
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database (optional in dev, fallback to memory server)
MONGODB_URI=mongodb://127.0.0.1:27017/talentpulse_ats

# Authentication (REQUIRED in production, auto-fallback in dev)
JWT_SECRET=your_strong_random_jwt_secret_min_32_characters_here
JWT_EXPIRES_IN=24h

# File Uploads
UPLOAD_DIR=uploads/resumes
MAX_FILE_SIZE_MB=10

# Email Delivery (Optional; leaving empty enables Mock Mode)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="TalentPulse ATS" <no-reply@talentpulse.ai>
```

> [!IMPORTANT]
> Never commit real secrets, production database URIs, or active JWT keys into version control. Ensure `server/.env` is listed in `.gitignore`.

---

## 7. Database Setup & Persistence Limitations

The database connection manager (`server/config/db.js`) features intelligent fallback:

1. **Production / Local MongoDB:** If `MONGODB_URI` points to a reachable MongoDB daemon or Atlas cluster, all records persist across restarts.
2. **Embedded Memory Server:** If no local MongoDB service is listening, the backend automatically spins up an in-memory database (`mongodb-memory-server`) and seeds demo data on launch.
   - **Persistence Limitation:** When running on `mongodb-memory-server`, all modifications (new candidate uploads, updated pipeline stages, new jobs) reside in RAM and **reset upon backend process restart**.
   - **Production Requirement:** For permanent data persistence across restarts, provide a valid MongoDB connection string in `server/.env`.

---

## 8. Development Startup Commands

Start both the backend API and frontend Vite server concurrently from the root directory:

```bash
# Concurrent startup (Backend on :5000, Frontend on :5173)
npm run dev
```

Or run them in separate terminal instances:

```bash
# Terminal 1 - Backend Server
npm run server

# Terminal 2 - Frontend Client
npm run client
```

Access the application in your browser at: **`http://localhost:5173`**

---

## 9. Test & Verification Commands

The repository includes a suite of automated QA verification scripts in `server/utils/`:

```bash
# 1. Full 14-Step End-to-End Workflow Verification
node server/utils/verifyFullWorkflow.js

# 2. Authentication & RBAC Test Suite (6 tests)
node server/utils/testAuth.js

# 3. Security Fixes & Privilege Escalation Audit (14 tests)
node server/utils/testSecurityFixes.js

# 4. Resume Upload, Parsing & AI Matching Suite (10 tests)
node server/utils/testResumeUploads.js

# 5. Job & Requisition Management Suite (7 tests)
node server/utils/testJobs.js

# 6. Mongoose Schema & Model Validation (10 models)
node server/utils/verifyModels.js

# 7. Frontend Production Bundle Build
cd client && npm run build
```

---

## 10. Role Descriptions & Permission Boundaries

| Role | Permissions & Boundaries |
|---|---|
| **HR_ADMIN** | Full administrative privileges: create/edit/delete jobs, manage user accounts and roles (`/api/v1/auth/users`), access all analytics, download CSV/PDF exports. |
| **RECRUITER** | Create and edit job requisitions, upload PDF/DOCX resumes, advance candidates across all pipeline stages, schedule interviews, view candidate details, export reports. *Cannot delete jobs or modify user roles.* |
| **INTERVIEWER** | View assigned job requisitions and candidate applications, view interview schedules, submit 5-axis evaluation scorecards and hiring recommendations. *Forbidden from creating jobs, updating pipeline stages directly, or managing user accounts.* |

---

## 11. Resume Upload Restrictions & Supported Formats

- **Supported Formats:** PDF (`.pdf`) and Microsoft Word (`.docx`).
- **Maximum File Size:** 10 MB per document (enforced via Multer middleware; oversized files return HTTP 400 `LIMIT_FILE_SIZE`).
- **File Type Validation:** Non-PDF/DOCX documents (e.g., `.txt`, `.exe`, `.png`) are rejected with HTTP 500 error envelope.
- **Corrupt File Handling:** Corrupted or invalid archives trigger safe error handling without crashing the process or leaving orphaned candidate records.
- **Missing Information Fallback:** Resumes lacking an explicit email address receive an auto-generated unique applicant identifier (`applicant_<timestamp>@example.com`).

---

## 12. NLP Scoring Components & Exact Weights

The scoring engine (`server/src/services/matching/scoringEngine.js`) calculates a composite match percentage between **0% and 100%**:

$$\text{Overall Score} = (\text{Skills} \times 0.40) + (\text{Experience} \times 0.25) + (\text{Education} \times 0.15) + (\text{Text Similarity} \times 0.20)$$

1. **Skills Match Score (40% Weight):**
   - Compares candidate's extracted skills against job requirements using the normalized skill alias taxonomy.
   - Internal weighting: **80% on Required Skills** + **20% on Preferred Skills**.
2. **Experience Match Score (25% Weight):**
   - Evaluates candidate's calculated experience years against `minExperienceYears`.
   - Score is 100% if candidate meets or exceeds threshold; otherwise proportional: $(\text{candidateExp} / \text{requiredExp}) \times 100$.
3. **Education Match Score (15% Weight):**
   - Degree level evaluation: Ph.D. / Doctorate = 100%, Master's / MBA = 90%, Bachelor's / B.Tech = 80%, Associate / Diploma = 65%, baseline = 60%.
4. **Cosine Text Similarity (20% Weight):**
   - TF-IDF word frequency vector comparison between the job requisition description and candidate profile summary/raw text.
5. **Explainability Reasoner:**
   - Generates human-readable narrative justification detailing matched skills, missing competencies, and experience alignment.

---

## 13. CSV & PDF Export Functionality

- **CSV Export (`GET /api/v1/analytics/export/csv`):** Generates a standards-compliant CSV file listing candidate names, contact details, assigned jobs, pipeline stages, composite match scores, breakdown percentages, and matched/missing skills.
- **PDF Export (`GET /api/v1/analytics/export/pdf`):** Generates a branded executive recruitment report containing KPI cards, pipeline stage distribution charts, and the top-10 ranked candidates.

---

## 14. Email Setup & Current Limitations

- **Simulated Mode (Default):** If `SMTP_USER` and `SMTP_PASS` are unset, Nodemailer runs in simulated mock mode, logging invitation and offer details to stdout.
- **SMTP Production Integration:** To deliver real candidate emails:
  1. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` in `server/.env`.
  2. Set `EMAIL_FROM` to an authenticated sender address.
  3. Supported services: SendGrid, AWS SES, Mailgun, Gmail App Passwords, or Ethereal for testing.

---

## 15. Common Troubleshooting Steps

| Issue | Cause & Solution |
|---|---|
| `ECONNREFUSED 127.0.0.1:5000` | Backend server is not running. Start it with `npm run server` or `npm run dev`. |
| `Too many authentication attempts (HTTP 429)` | Rate limiter triggered after >20 failed login attempts. Wait 15 minutes or pass `x-bypass-rate-limit: qa-test-suite` in automated tests. |
| `Cannot overwrite User model once compiled` | Solved: Models use `mongoose.models.X || mongoose.model('X')` safeguards. |
| Data resets when server restarts | Expected when running with embedded `mongodb-memory-server`. Connect to a local MongoDB or MongoDB Atlas instance for persistent storage. |
| Resume upload returns `LIMIT_FILE_SIZE` | The selected file exceeds 10 MB. Use a compressed or smaller resume document. |

---

## 16. Implementation Status Matrix

- [x] **JWT Authentication & Centralized Secrets** (Verified)
- [x] **Rate Limiting & Brute-Force Guards** (Verified)
- [x] **Public Registration Privilege Escalation Protection** (Verified)
- [x] **Job Requisition Management & Filtering** (Verified)
- [x] **PDF & DOCX Resume Parsing** (Verified)
- [x] **Multi-Factor NLP Scoring Engine** (Verified)
- [x] **Interactive 9-Stage Kanban Pipeline** (Verified)
- [x] **Interview Scheduling & 5-Axis Evaluations** (Verified)
- [x] **CSV and PDF Analytics Reports** (Verified)
- [x] **NexHire Electric Violet UI Theme** (Verified)
- [x] **Simulated / Mock Email Delivery** (Verified)
- [ ] **External SMTP Production Delivery** (*Requires third-party SMTP provider credentials*)
- [ ] **Permanent Production Database Persistence** (*Requires external MongoDB / Atlas URI*)
