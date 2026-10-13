# TalentPulse ATS — College Demonstration Guide (5–10 Minute Walkthrough)

This guide provides a structured, repeatable walkthrough for demonstrating the **TalentPulse ATS** platform during an academic presentation or technical evaluation.

---

## 1. Startup & Health Verification

1. **Launch the Application:**
   Open a terminal in the project root directory and run:
   ```bash
   npm run dev
   ```
   *Expected Output:* Backend starts on `http://localhost:5000`, Frontend starts on `http://localhost:5173`.

2. **Verify System Health:**
   Open your browser or run a quick curl check:
   ```bash
   curl http://localhost:5000/api/v1/health
   ```
   *Expected Response:* HTTP 200 `{"status":"UP","database":{"connected":true,"state":"connected"}}`.

3. **Navigate to the Application:**
   Open `http://localhost:5173` in Google Chrome or Microsoft Edge.

---

## 2. Seeded Demonstration Accounts

The system automatically initializes with pre-configured demonstration profiles (credentials are seeded in `server/src/utils/seedData.js`):

| Role | Demo Email | Intended Usage in Demo |
|---|---|---|
| **Recruiter** | `recruiter@talentpulse.ai` | Primary demo user: job requisition management, resume upload, NLP scoring, pipeline progression. |
| **HR Administrator** | `admin@talentpulse.ai` | System administration: user role assignments, executive dashboards, system configuration. |
| **Interviewer** | `interviewer@talentpulse.ai` | Evaluation showcase: viewing assigned interviews, submitting candidate scorecards. |

> *Note: Seeded accounts use the standard test password configured in the development database seeder.*

---

## 3. Step-by-Step 5–10 Minute Demonstration Flow

### Step 1: Sign In & Authentication (1 minute)
- Navigate to `http://localhost:5173/login`.
- Notice the **NexHire Electric Violet theme** styling (`#5200ff` accent gradients and clean typography).
- Sign in with the **Recruiter** account (`recruiter@talentpulse.ai`).
- *Demonstrate:* Automatic JWT token creation, role badge display in the navigation bar, and authorization guards.

### Step 2: Explore Job Requisitions (1 minute)
- Click **"Jobs"** in the sidebar.
- Inspect active requisitions (e.g., *"Senior Full-Stack Engineer (React / Node.js)"*, *"AI / NLP Machine Learning Specialist"*).
- Click **"Create Job"** to demonstrate input validation (required skills, experience years, salary range).
- *Talking Point:* Job requisitions define the target skill vectors and criteria used by the matching engine.

### Step 3: Resume Upload & Parsing (1.5 minutes)
- Navigate to the **"Candidates"** or **"Upload Resume"** page.
- Select an active target job requisition from the dropdown.
- Upload a synthetic test resume (either PDF or DOCX format):
  - Sample test file: `server/uploads/resumes/Sample_FullStack_Resume.pdf` or `server/test_fixtures/valid_resume.docx`.
- Click **"Upload & Process"**.
- *Expected Result:* The upload progress indicator completes with HTTP 201. The parsing pipeline automatically extracts:
  - Full Name (e.g., *Jordan Vance* / *Priya Sharma*)
  - Contact details (Email, Phone number, Location)
  - Extracted technical skills list
  - Work history and education credentials

### Step 4: Explainable AI Match Score & Skill Gap Analysis (1.5 minutes)
- Open the newly uploaded candidate's profile.
- Point out the **AI Match Card**:
  - **Overall Match Percentage:** (e.g., `84%` for high match, `35%` for divergent background).
  - **Match Breakdown:** Skills Score (40%), Experience Score (25%), Education Score (15%), Cosine Text Similarity (20%).
  - **Matched Skills Tags:** Visual green pills displaying skills shared between candidate and job requisition (e.g., `[Python, NLP, FastAPI, AWS]`).
  - **Missing Skills / Skill Gaps:** Red pills highlighting required skills absent from the resume (e.g., `[PyTorch, Docker]`).
  - **Explainability Summary:** A natural language explanation detailing why the candidate received the score.
- *Talking Point:* Unlike "black-box" AI systems, TalentPulse provides transparent, explainable reasoning for every score.

### Step 5: Interactive Kanban Pipeline Progression (1.5 minutes)
- Click **"Pipeline"** in the sidebar or view the job's Kanban board.
- Demonstrate moving the candidate card across stages:
  - Drag from `Applied` ➔ `Screening` ➔ `Shortlisted` ➔ `Interview Scheduled`.
- Click into the application to show that the stage transition persists on reload and creates an entry in the **Activity Log**.
- *Talking Point:* Audit logs record which recruiter moved the candidate and the timestamp of every transition.

### Step 6: Schedule Interview & Submit Scorecard (1.5 minutes)
- In the candidate pipeline or interview modal, click **"Schedule Interview"**.
- Set round type to **"Technical"**, pick a date/time, and add a meeting link (`https://meet.google.com/test-ai-interview`).
- Submit the schedule. The stage automatically advances to `Technical Round`.
- *(Optional role switch)* Sign in as **Interviewer** (`interviewer@talentpulse.ai`) or continue as Recruiter:
  - Open **"Interviews"** ➔ click **"Submit Evaluation"**.
  - Rate candidate across 5 dimensions: Technical Skills (5/5), Problem Solving (5/5), Communication (4/5), Cultural Fit (5/5), Overall (5/5).
  - Select recommendation: `STRONG_HIRE`.
  - Submit the scorecard.

### Step 7: Extend Offer & Finalize Pipeline (1 minute)
- Return to the candidate's application and advance to **"Offer Extended"**.
- Enter compensation details (e.g., `$195,000 USD`) and proposed start date.
- Show the simulated notification logged to the backend console.
- Move stage to **"Hired"**.

### Step 8: Dashboard Analytics & Report Export (1 minute)
- Navigate to the **"Dashboard"** / **"Analytics"** page.
- Showcase real-time analytics KPIs:
  - Total Active Requisitions, Total Applications, Stage Distribution Funnel, Average Match Scores.
- Click **"Export CSV"**: Demonstrates instant download of tabular candidate telemetry.
- Click **"Export PDF"**: Demonstrates server-side PDF generation streaming a branded executive recruitment summary.

---

## 4. Key Troubleshooting Points During Live Demo

| Symptom | Root Cause | Immediate Resolution |
|---|---|---|
| Frontend cannot connect to backend | Backend server is paused or stopped | In the terminal, verify `npm run dev` is running and check `http://localhost:5000/api/v1/health`. |
| Upload fails with `LIMIT_FILE_SIZE` | Resume file exceeds 10 MB limit | Use a standard PDF/DOCX under 10 MB (such as `Sample_FullStack_Resume.pdf`). |
| Data reset after restarting terminal | Running on embedded memory server | Explain that development mode defaults to `mongodb-memory-server` in RAM; connecting to MongoDB Atlas gives permanent persistence. |
| Account locked with HTTP 429 | Exceeded 20 failed login attempts | Wait 15 minutes or restart the backend development server to reset the rate limiter store. |

---

## 5. Integrations Requiring External Configuration

During the presentation, clarify which features are fully functioning locally vs. requiring third-party credentials:
- **Fully Implemented & Locally Verified:** PDF/DOCX parsing, NLP matching algorithms, Kanban pipeline, scorecard evaluations, CSV/PDF exports, and RBAC authentication.
- **External Dependencies (Optional):**
  - Real SMTP email delivery (requires SendGrid, AWS SES, or Gmail SMTP credentials). Runs in **Console Mock Mode** by default.
  - Permanent production persistence (requires a live MongoDB Atlas cluster URI). Runs in **Embedded Memory Mode** by default.
