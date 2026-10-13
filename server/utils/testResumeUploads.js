import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = `http://localhost:${env.PORT}${env.API_PREFIX}`;
const fixturesDir = path.join(__dirname, '../test_fixtures');

async function runUploadTestSuite() {
  console.log('\n=============================================================');
  console.log(' STARTING TALENTPULSE RESUME UPLOAD & AI MATCHING QA SUITE');
  console.log('=============================================================\n');

  const testResults = [];
  const record = (num, name, passed, details) => {
    testResults.push({ num, name, passed, details });
    const mark = passed ? '✅' : '❌';
    console.log(`${mark} [Test ${num}] ${name}: ${passed ? 'PASSED' : 'FAILED'}\n     ${details}\n`);
  };

  // 1. Authenticate as Recruiter
  let token = null;
  let targetJob = null;
  try {
    const authRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'qa-test-suite' },
      body: JSON.stringify({ email: 'recruiter@talentpulse.ai', password: 'password123' }),
    });
    const authData = await authRes.json();
    token = authData.data?.token;

    // Fetch active jobs
    const jobsRes = await fetch(`${BASE_URL}/jobs?status=ACTIVE`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const jobsData = await jobsRes.json();
    targetJob = jobsData.data?.[0];

    console.log(`[Setup] Logged in as: ${authData.data?.user?.email} (${authData.data?.user?.role})`);
    console.log(`[Setup] Target Job Requisition: "${targetJob?.title}" (ID: ${targetJob?._id})\n`);
  } catch (err) {
    console.error('[Setup Fatal] Auth setup failed:', err.message);
    process.exit(1);
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Helper to upload a fixture file
  async function uploadFile(fileName, extraFields = {}) {
    const filePath = path.join(fixturesDir, fileName);
    const fileBytes = fs.readFileSync(filePath);
    const ext = path.extname(fileName).toLowerCase();

    let mime = 'application/octet-stream';
    if (ext === '.pdf') mime = 'application/pdf';
    else if (ext === '.docx')
      mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (ext === '.txt') mime = 'text/plain';

    const formData = new FormData();
    const fileBlob = new Blob([fileBytes], { type: mime });
    formData.append('resumes', fileBlob, fileName);

    for (const [key, val] of Object.entries(extraFields)) {
      if (val) formData.append(key, val);
    }

    const res = await fetch(`${BASE_URL}/candidates/upload-resume`, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });

    const bodyText = await res.text();
    let bodyJson = null;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch {
      bodyJson = { raw: bodyText };
    }

    return { status: res.status, data: bodyJson };
  }

  // -----------------------------------------------------------------
  // Test 1: Valid PDF Upload & Parsing
  // -----------------------------------------------------------------
  let pdfCandidateId = null;
  try {
    const res = await uploadFile('valid_resume.pdf', { jobId: targetJob._id });
    const c = res.data?.data?.candidate;
    const a = res.data?.data?.application;

    pdfCandidateId = c?._id;

    const validStatus = res.status === 201;
    const hasName = !!c?.fullName;
    const hasEmail = !!c?.email;
    const hasSkills = Array.isArray(c?.extractedSkills) && c.extractedSkills.length > 0;
    const hasScore = typeof a?.overallMatchScore === 'number' && a.overallMatchScore >= 0 && a.overallMatchScore <= 100;
    const hasExplanation = !!a?.matchExplanation;

    const passed = validStatus && hasName && hasEmail && hasSkills && hasScore && hasExplanation;
    record(
      1,
      'Valid PDF Upload & End-to-End Parsing',
      passed,
      `Status: ${res.status}, Candidate: "${c?.fullName}" <${c?.email}>, Skills: [${c?.extractedSkills?.slice(0, 4).join(', ')}], Score: ${a?.overallMatchScore}%, Explanation: "${a?.matchExplanation?.slice(0, 75)}..."`
    );
  } catch (err) {
    record(1, 'Valid PDF Upload & End-to-End Parsing', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 2: Valid DOCX Upload & Parsing
  // -----------------------------------------------------------------
  let docxCandidateId = null;
  try {
    const res = await uploadFile('valid_resume.docx', { jobId: targetJob._id });
    const c = res.data?.data?.candidate;
    const a = res.data?.data?.application;

    docxCandidateId = c?._id;

    const validStatus = res.status === 201;
    const correctName = c?.fullName?.toLowerCase().includes('jordan');
    const correctEmail = c?.email === 'jordan.vance.qa@example.com';
    const correctPhone = c?.phone?.includes('876-5432');
    const hasSkills = c?.extractedSkills?.includes('Python') && c?.extractedSkills?.includes('Machine Learning');
    const hasExp = (c?.calculatedTotalExperienceYears || 0) >= 5;
    const hasScore = typeof a?.overallMatchScore === 'number' && a.overallMatchScore >= 0 && a.overallMatchScore <= 100;

    const passed = validStatus && correctName && correctEmail && correctPhone && hasSkills && hasExp && hasScore;
    record(
      2,
      'Valid DOCX Upload & Entity Extraction',
      passed,
      `Status: ${res.status}, Name: "${c?.fullName}", Email: "${c?.email}", Phone: "${c?.phone}", Exp: ${c?.calculatedTotalExperienceYears} yrs, Skills: [${c?.extractedSkills?.slice(0, 5).join(', ')}], AI Match Score: ${a?.overallMatchScore}%`
    );
  } catch (err) {
    record(2, 'Valid DOCX Upload & Entity Extraction', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 3: Resume File Storage and Static File Serving
  // -----------------------------------------------------------------
  try {
    let passed = false;
    let servedStatus = 0;
    if (pdfCandidateId) {
      const getRes = await fetch(`${BASE_URL}/candidates/${pdfCandidateId}`, { headers: authHeaders });
      const getData = await getRes.json();
      const storedPath = getData.data?.resumeFilePath;
      const fileName = path.basename(storedPath);

      // Verify file is served through /uploads endpoint
      const fileUrl = `http://localhost:${env.PORT}/uploads/resumes/${fileName}`;
      const fileRes = await fetch(fileUrl);
      servedStatus = fileRes.status;
      passed = fileRes.status === 200 && fileRes.headers.get('content-type')?.includes('pdf');
    }
    record(
      3,
      'Resume File Persistence & Serving via /uploads',
      passed,
      `HTTP Status from static server: ${servedStatus}, Content-Type: application/pdf`
    );
  } catch (err) {
    record(3, 'Resume File Persistence & Serving via /uploads', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 4: Database Candidate Retrieval & Persistence Verification
  // -----------------------------------------------------------------
  try {
    let passed = false;
    let retrievedCandidate = null;
    if (docxCandidateId) {
      const getRes = await fetch(`${BASE_URL}/candidates/${docxCandidateId}`, { headers: authHeaders });
      const getData = await getRes.json();
      retrievedCandidate = getData.data;
      passed = getRes.status === 200 && retrievedCandidate?.email === 'jordan.vance.qa@example.com';
    }
    record(
      4,
      'Database Candidate Record Persistence',
      passed,
      `Retrieved candidate from DB by ID (${docxCandidateId}): Name: "${retrievedCandidate?.fullName}", ExtractedSkills Count: ${retrievedCandidate?.extractedSkills?.length}`
    );
  } catch (err) {
    record(4, 'Database Candidate Record Persistence', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 5: Rejection of Unsupported File Extension (.txt)
  // -----------------------------------------------------------------
  try {
    const res = await uploadFile('unsupported_extension.txt');
    const isRejected = res.status === 400 || res.status === 500;
    const msg = res.data?.message || '';
    const passed = isRejected && /invalid file type|only pdf and docx/i.test(msg);
    record(
      5,
      'Unsupported File Extension Rejection (.txt)',
      passed,
      `Status: ${res.status}, Rejection message: "${msg}"`
    );
  } catch (err) {
    record(5, 'Unsupported File Extension Rejection (.txt)', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 6: Rejection of Oversized File (> 10MB)
  // -----------------------------------------------------------------
  try {
    const res = await uploadFile('oversized_resume.pdf');
    const isRejected = res.status === 400;
    const msg = res.data?.message || '';
    const passed = isRejected && /limit|maximum permitted|10mb/i.test(msg);
    record(
      6,
      'Oversized File Rejection (> 10MB)',
      passed,
      `Status: ${res.status}, Handled by Multer: "${msg}"`
    );
  } catch (err) {
    record(6, 'Oversized File Rejection (> 10MB)', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 7: Rejection of Corrupt PDF
  // -----------------------------------------------------------------
  try {
    const res = await uploadFile('corrupt_resume.pdf');
    const isRejected = res.status === 400 || res.status === 500;
    const msg = res.data?.message || '';
    const passed = isRejected && /failed to parse|invalid pdf/i.test(msg);
    record(
      7,
      'Corrupt PDF Document Handling',
      passed,
      `Status: ${res.status}, Graceful failure error: "${msg}"`
    );
  } catch (err) {
    record(7, 'Corrupt PDF Document Handling', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 8: Rejection of Corrupt DOCX
  // -----------------------------------------------------------------
  try {
    const res = await uploadFile('corrupt_resume.docx');
    const isRejected = res.status === 400 || res.status === 500;
    const msg = res.data?.message || '';
    const passed = isRejected && /failed to parse docx/i.test(msg);
    record(
      8,
      'Corrupt DOCX Document Handling',
      passed,
      `Status: ${res.status}, Graceful failure error: "${msg}"`
    );
  } catch (err) {
    record(8, 'Corrupt DOCX Document Handling', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 9: Missing Contact Info Fallback Handling
  // -----------------------------------------------------------------
  try {
    const res = await uploadFile('missing_contact.docx', { jobId: targetJob._id });
    const c = res.data?.data?.candidate;
    const a = res.data?.data?.application;
    const passed =
      res.status === 201 &&
      !!c?.email &&
      c.email.includes('applicant_') &&
      typeof a?.overallMatchScore === 'number';
    record(
      9,
      'Resume with Missing Contact Details',
      passed,
      `Status: ${res.status}, Fallback Email: "${c?.email}", Candidate Created: "${c?.fullName}", Score: ${a?.overallMatchScore}%`
    );
  } catch (err) {
    record(9, 'Resume with Missing Contact Details', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 10: Sparse Resume Text Graceful Handling
  // -----------------------------------------------------------------
  try {
    const res = await uploadFile('sparse_resume.docx', { jobId: targetJob._id });
    const c = res.data?.data?.candidate;
    const a = res.data?.data?.application;
    const passed =
      res.status === 201 &&
      typeof a?.overallMatchScore === 'number' &&
      !isNaN(a.overallMatchScore) &&
      a.overallMatchScore >= 0;
    record(
      10,
      'Sparse Text Resume Processing',
      passed,
      `Status: ${res.status}, Candidate: "${c?.fullName}", Score: ${a?.overallMatchScore}% (Low alignment safely handled without NaN or crashes)`
    );
  } catch (err) {
    record(10, 'Sparse Text Resume Processing', false, err.message);
  }

  console.log('=============================================================');
  const allPassed = testResults.every((t) => t.passed);
  console.log(` SUMMARY: ${testResults.filter((t) => t.passed).length}/${testResults.length} UPLOAD TESTS PASSED.`);
  console.log('=============================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runUploadTestSuite().catch((err) => {
  console.error('[Suite Error]:', err);
  process.exit(1);
});
