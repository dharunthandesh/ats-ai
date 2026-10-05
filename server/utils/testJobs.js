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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@talentpulse.ai', password: 'Password123!' }),
      }).then((r) => r.json()),
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'recruiter@talentpulse.ai', password: 'Password123!' }),
      }).then((r) => r.json()),
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'interviewer@talentpulse.ai', password: 'Password123!' }),
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
        minimumExperience: 5,
        maximumExperience: 10,
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
    // Test 2: Validation Failure on Invalid Experience Range
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
        requiredSkills: ['JavaScript'],
        minimumExperience: 5,
        maximumExperience: 2, // Invalid: max < min
      }),
    });
    const invalidData = await invalidRes.json();
    if (invalidRes.status === 400 && invalidData.success === false) {
      logTest('2. Validation: maxExp < minExp Rejected', true, `HTTP 400: "${invalidData.errors?.[0]?.message}"`);
      passed++;
    } else {
      logTest('2. Validation: maxExp < minExp Rejected', false, `Status: ${invalidRes.status}`);
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
        minimumExperience: 2,
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
    if (listRes.status === 200 && Array.isArray(listData.data) && listData.meta?.total !== undefined) {
      logTest(
        '4. GET /jobs (Filter, Search & Pagination)',
        true,
        `Found: ${listData.data.length} jobs, Total: ${listData.meta.total}, Page: ${listData.meta.page}/${listData.meta.totalPages}`
      );
      passed++;
    } else {
      logTest('4. GET /jobs (Filter, Search & Pagination)', false, `Status: ${listRes.status}`);
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
      logTest('5. GET /jobs/:id Details', true, `Retrieved: ${singleData.data.title} (CreatedBy: ${singleData.data.createdBy?.email})`);
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
        minimumExperience: 6,
        maximumExperience: 12,
      }),
    });
    const updateData = await updateRes.json();
    if (updateRes.status === 200 && updateData.data?.status === 'PAUSED' && updateData.data?.minimumExperience === 6) {
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
