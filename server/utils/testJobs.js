import { env } from '../config/env.js';

const BASE_URL = `http://localhost:${env.PORT}${env.API_PREFIX}`;

const logTest = (name, passed, details = '') => {
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} - ${name}`);
  if (details) {
    console.log(`      Details: ${details}`);
  }
};

const runJobTests = async () => {
  console.log('\n======================================================');
  console.log(' Running Job / Requisition Management Backend Test Suite');
  console.log(` Target Endpoint: ${BASE_URL}/jobs`);
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  try {
    // 1. Get tokens for ADMIN, RECRUITER, and INTERVIEWER
    const [adminLogin, recruiterLogin, interviewerLogin] = await Promise.all([
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'qa-test-suite' },
        body: JSON.stringify({ email: 'admin@talentpulse.ai', password: 'password123' }),
      }).then((r) => r.json()),
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'qa-test-suite' },
        body: JSON.stringify({ email: 'recruiter@talentpulse.ai', password: 'password123' }),
      }).then((r) => r.json()),
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'qa-test-suite' },
        body: JSON.stringify({ email: 'interviewer@talentpulse.ai', password: 'password123' }),
      }).then((r) => r.json()),
    ]);

    const adminToken = adminLogin.data?.token;
    const recruiterToken = recruiterLogin.data?.token;
    const interviewerToken = interviewerLogin.data?.token;

    let createdJobId = null;

    // -------------------------------------------------------------
    // Test 1: POST /jobs by Recruiter
    // -------------------------------------------------------------
    total++;
    const createRes = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        title: 'Lead Cloud Infrastructure Architect',
        description: 'Lead enterprise multi-cloud infrastructure and DevOps architecture.',
        department: 'Infrastructure',
        location: 'Austin, TX',
        employmentType: 'FULL_TIME',
        requiredSkills: ['Kubernetes', 'AWS', 'Terraform', 'Docker'],
        preferredSkills: ['Go', 'Helm', 'ArgoCD'],
        minExperienceYears: 5,
        status: 'ACTIVE',
      }),
    });
    const createData = await createRes.json();
    if (createRes.status === 201 && createData.data?._id) {
      createdJobId = createData.data._id;
      logTest('1. Create Job (Recruiter)', true, `Created Job ID: ${createdJobId} - Title: ${createData.data.title}`);
      passed++;
    } else {
      logTest('1. Create Job (Recruiter)', false, `Status: ${createRes.status}, Body: ${JSON.stringify(createData)}`);
    }

    // -------------------------------------------------------------
    // Test 2: Validation Failure on Missing Required Skills
    // -------------------------------------------------------------
    total++;
    const invalidRes = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        title: 'Junior Dev',
        description: 'Valid description with enough characters',
        department: 'Engineering',
        requiredSkills: [], // Invalid: empty requiredSkills
      }),
    });
    const invalidData = await invalidRes.json();
    if (invalidRes.status === 400 && invalidData.success === false) {
      logTest('2. Validation: Empty requiredSkills Rejected', true, `HTTP 400: "${invalidData.message}"`);
      passed++;
    } else {
      logTest('2. Validation: Empty requiredSkills Rejected', false, `Status: ${invalidRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 3: RBAC Failure: Interviewer Forbidden to Create Job
    // -------------------------------------------------------------
    total++;
    const rbacRes = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${interviewerToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Requisition',
        description: 'Should be rejected by RBAC guard',
        department: 'Product',
        requiredSkills: ['Figma'],
        minExperienceYears: 2,
      }),
    });
    const rbacData = await rbacRes.json();
    if (rbacRes.status === 403) {
      logTest('3. RBAC: Interviewer Cannot Create Jobs', true, `HTTP 403 Forbidden: "${rbacData.message}"`);
      passed++;
    } else {
      logTest('3. RBAC: Interviewer Cannot Create Jobs', false, `Status: ${rbacRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 4: GET /jobs with Search, Filter & Pagination
    // -------------------------------------------------------------
    total++;
    const listRes = await fetch(`${BASE_URL}/jobs?department=Infrastructure&search=Cloud&page=1&limit=5`, {
      headers: {
        Authorization: `Bearer ${interviewerToken}`, // Any authenticated user can read
      },
    });
    const listData = await listRes.json();
    const totalCount = listData.meta?.totalRecords ?? listData.meta?.total ?? listData.pagination?.totalRecords;
    if (listRes.status === 200 && Array.isArray(listData.data) && totalCount !== undefined) {
      logTest(
        '4. GET /jobs (Filter, Search & Pagination)',
        true,
        `Found: ${listData.data.length} jobs, Total: ${totalCount}`
      );
      passed++;
    } else {
      logTest('4. GET /jobs (Filter, Search & Pagination)', false, `Status: ${listRes.status}, Body: ${JSON.stringify(listData)}`);
    }

    // -------------------------------------------------------------
    // Test 5: GET /jobs/:id
    // -------------------------------------------------------------
    total++;
    const singleRes = await fetch(`${BASE_URL}/jobs/${createdJobId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const singleData = await singleRes.json();
    if (singleRes.status === 200 && singleData.data?._id === createdJobId) {
      logTest('5. GET /jobs/:id Details', true, `Retrieved: ${singleData.data.title}`);
      passed++;
    } else {
      logTest('5. GET /jobs/:id Details', false, `Status: ${singleRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 6: PUT /jobs/:id (Update Requisition)
    // -------------------------------------------------------------
    total++;
    const updateRes = await fetch(`${BASE_URL}/jobs/${createdJobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Principal Cloud Infrastructure Architect (Updated)',
        status: 'PAUSED',
        minExperienceYears: 6,
      }),
    });
    const updateData = await updateRes.json();
    if (updateRes.status === 200 && updateData.data?.status === 'PAUSED' && updateData.data?.minExperienceYears === 6) {
      logTest('6. PUT /jobs/:id Update Requisition', true, `Updated Title: "${updateData.data.title}", Status: ${updateData.data.status}`);
      passed++;
    } else {
      logTest('6. PUT /jobs/:id Update Requisition', false, `Status: ${updateRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 7: DELETE /jobs/:id
    // -------------------------------------------------------------
    total++;
    const deleteRes = await fetch(`${BASE_URL}/jobs/${createdJobId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const deleteData = await deleteRes.json();
    if (deleteRes.status === 200 && deleteData.success === true) {
      logTest('7. DELETE /jobs/:id', true, `Deleted job ID: ${createdJobId}`);
      passed++;
    } else {
      logTest('7. DELETE /jobs/:id', false, `Status: ${deleteRes.status}`);
    }
  } catch (err) {
    console.error('Job Test Suite Error:', err);
  }

  console.log('\n======================================================');
  console.log(` JOB TEST SUITE RESULTS: ${passed} / ${total} PASSED`);
  console.log('======================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
};

runJobTests();
