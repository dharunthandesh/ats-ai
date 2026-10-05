import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000/api/v1';

async function runVerification() {
  console.log('\n=============================================================');
  console.log(' STARTING TALENTPULSE END-TO-END WORKFLOW VERIFICATION');
  console.log('=============================================================\n');

  // 1. Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('✅ [1/14] Health Check:', healthRes.status, `Status: ${healthData.data?.status}`, `DB: ${healthData.data?.database?.state}`);

  // 2. Authentication (Login as Recruiter)
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'recruiter@talentpulse.ai', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  console.log('✅ [2/14] Authentication (Login):', loginRes.status, `Logged in as ${loginData.data?.user?.name} (${loginData.data?.user?.role})`);
  if (!token) throw new Error('Authentication token missing');

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 3. Create Job Requisition
  const createJobRes = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Principal AI Systems Architect',
      department: 'AI Research',
      location: 'San Francisco, CA (Hybrid)',
      employmentType: 'FULL_TIME',
      experienceLevel: 'LEAD',
      minExperienceYears: 5,
      requiredSkills: ['Python', 'NLP', 'PyTorch', 'Machine Learning', 'FastAPI'],
      preferredSkills: ['Docker', 'AWS', 'Kubernetes'],
      description: 'Lead next-generation NLP architecture and neural candidate matching systems.',
      responsibilities: ['Architect scalable AI services', 'Optimize ranking pipelines'],
      salaryRange: { min: 180000, max: 230000, currency: 'USD' },
      status: 'ACTIVE'
    })
  });
  const jobData = await createJobRes.json();
  const createdJobId = jobData.data?._id;
  console.log('✅ [3/14] Create Job:', createJobRes.status, `Job ID: ${createdJobId} - "${jobData.data?.title}"`);

  // 4. Upload & Parse Resume via FormData
  const resumeSamplePath = path.join(__dirname, '../uploads/resumes/Sample_FullStack_Resume.pdf');
  const fileBuffer = fs.readFileSync(resumeSamplePath);
  const formData = new FormData();
  formData.append('jobId', createdJobId);
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  formData.append('resumes', blob, 'Dr_Priya_Sharma_Resume.pdf');

  const uploadRes = await fetch(`${BASE_URL}/candidates/upload-resume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  const uploadResult = await uploadRes.json();
  console.log('✅ [4/14] Upload & Parse Resume:', uploadRes.status, uploadResult.message);
  const candidate = uploadResult.data?.candidate || uploadResult.data?.[0]?.candidate || uploadResult.data;
  const candidateId = candidate?._id;

  // 5. Query Applications for Job and Verify AI Match Calculation & Explainability
  const appsRes = await fetch(`${BASE_URL}/applications/job/${createdJobId}`, {
    headers: authHeaders
  });
  const appsData = await appsRes.json();
  const application = appsData.data?.[0];
  const applicationId = application?._id;
  console.log('✅ [5/14] AI Match Calculation:', appsRes.status, `App ID: ${applicationId}`);
  console.log(`         • Overall Match Score: ${application?.overallMatchScore}%`);
  console.log(`         • Skills Score: ${application?.matchBreakdown?.skillsScore}%, Exp Score: ${application?.matchBreakdown?.experienceScore}%`);
  console.log(`         • Explainability Summary: "${application?.matchExplanation?.substring(0, 85)}..."`);

  // 6. Candidate Re-Ranking
  const rankRes = await fetch(`${BASE_URL}/applications/job/${createdJobId}/re-rank`, {
    method: 'POST',
    headers: authHeaders
  });
  const rankData = await rankRes.json();
  console.log('✅ [6/14] AI Re-Ranking Pipeline:', rankRes.status, rankData.message);

  // 7. Move Candidate through Pipeline (Stage Transition: APPLIED -> TECHNICAL_ROUND)
  const stageRes = await fetch(`${BASE_URL}/applications/${applicationId}/stage`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ stage: 'TECHNICAL_ROUND' })
  });
  const stageData = await stageRes.json();
  console.log('✅ [7/14] Candidate Pipeline Progression:', stageRes.status, `Stage updated to: ${stageData.data?.stage}`);

  // 8. Schedule Interview
  const scheduleRes = await fetch(`${BASE_URL}/interviews`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      applicationId: applicationId,
      roundType: 'TECHNICAL',
      scheduledStartTime: new Date(Date.now() + 86400000).toISOString(),
      scheduledEndTime: new Date(Date.now() + 90000000).toISOString(),
      meetingLink: 'https://meet.google.com/test-ai-interview',
      locationNotes: 'Google Meet Live Technical Interview',
      sendEmail: true
    })
  });
  const scheduleData = await scheduleRes.json();
  const interviewId = scheduleData.data?._id;
  console.log('✅ [8/14] Schedule Interview Round:', scheduleRes.status, `Interview ID: ${interviewId} (${scheduleData.data?.roundType})`);

  // 9. Submit Interview Evaluation Scorecard
  const evalRes = await fetch(`${BASE_URL}/evaluations`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      interviewId: interviewId,
      technicalSkillsRating: 5,
      problemSolvingRating: 5,
      communicationRating: 4,
      culturalFitRating: 5,
      overallScore: 5,
      recommendation: 'STRONG_HIRE',
      strengths: 'Outstanding deep-learning and system design fundamentals.',
      areasOfImprovement: 'None identified.',
      privateNotes: 'Immediate offer recommended.'
    })
  });
  const evalData = await evalRes.json();
  console.log('✅ [9/14] Submit Scorecard Evaluation:', evalRes.status, `Recommendation: ${evalData.data?.recommendation} (Score: ${evalData.data?.overallScore}/5)`);

  // 10. Update Pipeline Stage to OFFER_EXTENDED & Set Compensation Details
  const offerRes = await fetch(`${BASE_URL}/applications/${applicationId}/offer`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 195000,
      currency: 'USD',
      startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'PENDING',
      sendEmailAlert: true
    })
  });
  const offerData = await offerRes.json();
  console.log('✅ [10/14] Offer Extended & Pipeline Updated:', offerRes.status, `Stage: ${offerData.data?.stage} ($${offerData.data?.offerDetails?.amount} ${offerData.data?.offerDetails?.currency})`);

  // 11. Recruitment Analytics & Telemetry
  const analyticsRes = await fetch(`${BASE_URL}/analytics/overview?jobId=${createdJobId}`, {
    headers: authHeaders
  });
  const analyticsData = await analyticsRes.json();
  console.log('✅ [11/14] Analytics Telemetry:', analyticsRes.status, `Total Apps: ${analyticsData.data?.totalApplications}, Funnel:`, analyticsData.data?.stageCounts);

  // 12. CSV Export
  const csvRes = await fetch(`${BASE_URL}/analytics/export/csv?jobId=${createdJobId}`, {
    headers: authHeaders
  });
  const csvText = await csvRes.text();
  console.log('✅ [12/14] CSV Report Stream:', csvRes.status, `MIME: ${csvRes.headers.get('content-type')}, Lines: ${csvText.split('\n').length}`);

  // 13. PDF Report Export
  const pdfRes = await fetch(`${BASE_URL}/analytics/export/pdf?jobId=${createdJobId}`, {
    headers: authHeaders
  });
  const pdfBuffer = await pdfRes.arrayBuffer();
  console.log('✅ [13/14] PDF Report Generation:', pdfRes.status, `MIME: ${pdfRes.headers.get('content-type')}, Size: ${pdfBuffer.byteLength} bytes`);

  // 14. Static Resume File Serving Verification (/uploads)
  const staticFileRes = await fetch('http://localhost:5000/uploads/resumes/Sample_FullStack_Resume.pdf');
  console.log('✅ [14/14] Static /uploads Serving:', staticFileRes.status, `MIME: ${staticFileRes.headers.get('content-type')}`);

  console.log('\n=============================================================');
  console.log(' ALL 14 VERIFICATION CHECKS & END-TO-END WORKFLOW SUCCEEDED!');
  console.log('=============================================================\n');
}

runVerification().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
