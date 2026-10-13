# TalentPulse ATS — Vercel & Production Deployment Guide

This guide explains how to deploy **TalentPulse ATS** to production with high availability, secure CORS configuration, and persistent data storage.

---

## 1. Recommended Production Architecture

Because TalentPulse ATS contains both a **React 18 Single-Page Application (SPA)** and a **long-running Express API** (handling background `node-cron` interview reminders, Multer file parsing, and static `/uploads` serving), the industry standard and most reliable production setup is:

| Layer | Recommended Platform | Why |
|---|---|---|
| **Frontend Client (`client/`)** | **Vercel** | Ultra-fast Global Edge CDN, automated preview builds, zero-config Vite support. |
| **Backend API (`server/`)** | **Render** or **Railway** (Free/Low-cost) | Persistent process needed for background cron schedulers, persistent disk for resumes, no serverless timeout limits. |
| **Database** | **MongoDB Atlas** (Free M0 Cluster) | 24/7 cloud persistence, automated backups, replica set resilience. |

---

## 2. Step 1: Set Up MongoDB Atlas (Database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Shared Cluster** (e.g., in AWS `us-east-1` or closest to your users).
3. Under **Database Access**, create a database user (e.g., `talentpulse_admin`) with a secure password.
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so cloud servers can connect.
5. Click **Connect** ➔ **Drivers (Node.js)** and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/talentpulse_ats?retryWrites=true&w=majority
   ```

---

## 3. Step 2: Deploy Backend API (Render / Railway)

### Deploying on Render (Free Web Service):
1. Sign up / Log in to [render.com](https://render.com) with GitHub.
2. Click **New +** ➔ **Web Service**.
3. Select your GitHub repository: `dharunthandesh/ats-ai`.
4. Configure settings:
   - **Name:** `talentpulse-api`
   - **Region:** Closest to your database (e.g., Oregon or Frankfurt).
   - **Branch:** `qa/testing` (or `main`).
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production security mode |
   | `PORT` | `5000` | Render will map this to port 443 |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `generate_a_random_32_char_secret_string` | Required in production |
   | `JWT_EXPIRES_IN` | `24h` | Token session validity |
   | `CORS_ORIGIN` | `*` *(or your Vercel URL once generated)* | Allowed frontend domain |
6. Click **Deploy Web Service**.
7. Once deployed, copy your live backend URL (e.g., `https://talentpulse-api.onrender.com`).

---

## 4. Step 3: Deploy Frontend on Vercel

1. Log in to [vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New…** ➔ **Project**.
3. Find and import `dharunthandesh/ats-ai`.
4. In the **Configure Project** screen:
   - **Project Name:** `talentpulse-ats` (or preferred name).
   - **Framework Preset:** **Vite** (auto-detected).
   - **Root Directory:** Click **Edit** and select `client` (Very Important!).
   - **Build and Output Settings:**
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
5. Expand **Environment Variables** and add:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://talentpulse-api.onrender.com/api/v1` | Your live backend API URL |
6. Click **Deploy**.

---

## 5. Client Routing Configuration (`vercel.json`)

To prevent **HTTP 404 Not Found** errors when users refresh deep routes (such as `/dashboard`, `/pipeline`, `/jobs`, `/candidates`), a `client/vercel.json` file is already included in the repository:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures that all page requests are routed to the React Single Page Application bundle.

---

## 6. Alternative: Monorepo Deployment with Vercel CLI

If you prefer using the command line via **Vercel CLI**:

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Navigate to client workspace
cd client

# 3. Deploy to preview
vercel

# 4. Deploy to production
vercel --prod
```

Follow the interactive prompts:
- *Set up and deploy?* `yes`
- *Which scope?* (Select your team/account)
- *Link to existing project?* `no`
- *What's your project's name?* `talentpulse-client`
- *In which directory is your code located?* `./`

---

## 7. Post-Deployment Verification Checklist

Once both services are deployed:

1. **Verify Backend Health:**
   Open `https://your-api.onrender.com/api/v1/health` in your browser.
   - Status must return `200 UP` with `database: { connected: true, state: "connected" }`.
2. **Update CORS in Backend:**
   In your backend's environment variables (Render/Railway), set `CORS_ORIGIN` to your exact Vercel frontend domain (e.g., `https://talentpulse-ats.vercel.app`).
3. **Verify Frontend Authentication:**
   Open your Vercel URL, click **Lead Recruiter** 1-click sign-in, and verify successful redirect to the Dashboard with the NexHire Electric Violet theme.
4. **Test Resume Upload & Parsing:**
   Upload a test PDF or DOCX file to verify that the end-to-end cloud pipeline extracts skills and calculates the AI match score.

---

## 8. Common Troubleshooting

| Symptom | Root Cause | Fix |
|---|---|---|
| `404 Not Found` on page reload (e.g., `/dashboard`) | Missing client rewrite rule | Ensure [`client/vercel.json`](file:///f:/FSD%20project/FSD%20project/client/vercel.json) contains the `rewrites` configuration to `/index.html`. |
| `Network Error` or `CORS policy blocked` | Backend `CORS_ORIGIN` does not match Vercel URL | Update `CORS_ORIGIN` in backend environment variables to include your `https://*.vercel.app` domain. |
| Login fails with `Invalid or expired token` | `JWT_SECRET` mismatch or missing | Verify `JWT_SECRET` is set in the backend environment variables. |
| Database errors on cloud launch | Atlas IP Whitelist blocking cloud server | In MongoDB Atlas Network Access, ensure `0.0.0.0/0` is permitted. |
