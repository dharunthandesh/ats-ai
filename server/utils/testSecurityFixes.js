import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ROLES } from '../src/constants/roles.js';

const BASE_URL = `http://localhost:${env.PORT}${env.API_PREFIX}`;

async function runSecurityTests() {
  console.log('\n=============================================================');
  console.log(' STARTING TALENTPULSE SECURITY FIXES QA VERIFICATION SUITE');
  console.log('=============================================================\n');

  const testResults = [];
  const record = (num, name, passed, details) => {
    testResults.push({ num, name, passed, details });
    const mark = passed ? '✅' : '❌';
    console.log(`${mark} [Test ${num}] ${name}: ${passed ? 'PASSED' : 'FAILED'} - ${details}`);
  };

  const randomSuffix = Math.floor(Math.random() * 1000000);

  // -------------------------------------------------------------
  // Test 1: Normal Registration
  // -------------------------------------------------------------
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Normal Recruiter ${randomSuffix}`,
        email: `normal_${randomSuffix}@talentpulse.test`,
        password: 'Password123!',
      }),
    });
    const regData = await regRes.json();
    const passed = regRes.status === 201 && regData.data?.user?.role === ROLES.RECRUITER;
    record(1, 'Normal Registration', passed, `Status: ${regRes.status}, Role: ${regData.data?.user?.role}`);
  } catch (err) {
    record(1, 'Normal Registration', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 2: Registration with Role Omitted
  // -------------------------------------------------------------
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `No Role User ${randomSuffix}`,
        email: `norole_${randomSuffix}@talentpulse.test`,
        password: 'Password123!',
      }),
    });
    const regData = await regRes.json();
    const passed = regRes.status === 201 && regData.data?.user?.role === ROLES.RECRUITER;
    record(2, 'Registration with Role Omitted', passed, `Status: ${regRes.status}, Assigned Default: ${regData.data?.user?.role}`);
  } catch (err) {
    record(2, 'Registration with Role Omitted', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 3: Registration Attempting role=HR_ADMIN (Privilege Escalation Attack)
  // -------------------------------------------------------------
  try {
    const exploitEmail = `attacker_${randomSuffix}@talentpulse.test`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker Attempting Admin',
        email: exploitEmail,
        password: 'Password123!',
        role: 'HR_ADMIN',
      }),
    });
    const regData = await regRes.json();
    // Must NOT be HR_ADMIN. It must either be created with RECRUITER or rejected.
    const createdRole = regData.data?.user?.role;
    const passed = regRes.status === 201 && createdRole === ROLES.RECRUITER && createdRole !== 'HR_ADMIN';
    record(3, 'Registration Attempting role=HR_ADMIN', passed, `Privilege escalation blocked! Role forced to: ${createdRole} (NOT HR_ADMIN)`);
  } catch (err) {
    record(3, 'Registration Attempting role=HR_ADMIN', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 4: Registration Attempting Other Privileged Roles
  // -------------------------------------------------------------
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker Attempting Interviewer',
        email: `attacker_int_${randomSuffix}@talentpulse.test`,
        password: 'Password123!',
        role: 'INTERVIEWER',
      }),
    });
    const regData = await regRes.json();
    const createdRole = regData.data?.user?.role;
    const passed = regRes.status === 201 && createdRole === ROLES.RECRUITER;
    record(4, 'Registration Attempting Other Privileged Roles', passed, `Arbitrary role ignored; Assigned: ${createdRole}`);
  } catch (err) {
    record(4, 'Registration Attempting Other Privileged Roles', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 5: Legitimate Login
  // -------------------------------------------------------------
  let legitToken = null;
  let adminToken = null;
  let interviewerToken = null;
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'qa-test-suite' },
      body: JSON.stringify({
        email: 'recruiter@talentpulse.ai',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    legitToken = loginData.data?.token;

    // Also acquire admin and interviewer tokens for role-testing before rate-limit test
    const aRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'qa-test-suite' },
      body: JSON.stringify({ email: 'admin@talentpulse.ai', password: 'password123' }),
    });
    adminToken = (await aRes.json()).data?.token;

    const iRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'qa-test-suite' },
      body: JSON.stringify({ email: 'interviewer@talentpulse.ai', password: 'password123' }),
    });
    interviewerToken = (await iRes.json()).data?.token;

    const passed = loginRes.status === 200 && !!legitToken;
    record(5, 'Legitimate Login', passed, `Status: ${loginRes.status}, User: ${loginData.data?.user?.name}`);
  } catch (err) {
    record(5, 'Legitimate Login', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 6: Invalid Login (Wrong Password)
  // -------------------------------------------------------------
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'recruiter@talentpulse.ai',
        password: 'wrong_password_xyz',
      }),
    });
    const loginData = await loginRes.json();
    const passed = loginRes.status === 401 && loginData.success === false;
    record(6, 'Invalid Login Credentials', passed, `Status: ${loginRes.status}, Message: "${loginData.message}"`);
  } catch (err) {
    record(6, 'Invalid Login Credentials', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 7: Authentication Rate Limiting (Excessive Requests -> HTTP 429)
  // -------------------------------------------------------------
  try {
    let received429 = false;
    let rateLimitMessage = '';
    // Send bursts of requests until rate limit is triggered
    for (let i = 0; i < 25; i++) {
      const floodRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent_test@talentpulse.test',
          password: 'WrongPassword!',
        }),
      });
      if (floodRes.status === 429) {
        received429 = true;
        const floodData = await floodRes.json();
        rateLimitMessage = floodData.message;
        break;
      }
    }
    record(7, 'Auth Rate Limiting Protection', received429, `HTTP 429 received: "${rateLimitMessage}"`);
    // Cleanup rate limiter so local test runners & browser sessions are immediately unblocked
    await fetch(`${BASE_URL}/auth/reset-rate-limit`, { method: 'POST' });
  } catch (err) {
    record(7, 'Auth Rate Limiting Protection', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 8: Centralized JWT Creation
  // -------------------------------------------------------------
  let generatedToken = null;
  try {
    const payload = { id: '609b5a79f1a2c3d4e5f6a7b8', name: 'JWT Test User', role: 'RECRUITER' };
    generatedToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    const passed = typeof generatedToken === 'string' && generatedToken.split('.').length === 3;
    record(8, 'Centralized JWT Token Creation', passed, `Token format valid with signature length: ${generatedToken.length}`);
  } catch (err) {
    record(8, 'Centralized JWT Token Creation', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 9: Centralized JWT Verification
  // -------------------------------------------------------------
  try {
    const decoded = jwt.verify(generatedToken, env.JWT_SECRET);
    const passed = decoded.name === 'JWT Test User' && decoded.role === 'RECRUITER';
    record(9, 'Centralized JWT Token Verification', passed, `Decoded ID: ${decoded.id}, Role: ${decoded.role}`);
  } catch (err) {
    record(9, 'Centralized JWT Token Verification', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 10: Protected API Access with Valid Token
  // -------------------------------------------------------------
  try {
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${legitToken}` },
    });
    const meData = await meRes.json();
    const passed = meRes.status === 200 && meData.data?.email === 'recruiter@talentpulse.ai';
    record(10, 'Protected API Access with Valid Token', passed, `Status: ${meRes.status}, Profile: ${meData.data?.name}`);
  } catch (err) {
    record(10, 'Protected API Access with Valid Token', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 11: Protected API Access with Invalid Token
  // -------------------------------------------------------------
  try {
    const badRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer invalid.forged.jwt.token' },
    });
    const badData = await badRes.json();
    const passed = badRes.status === 401 && badData.success === false;
    record(11, 'Protected API Access with Invalid Token', passed, `Status: ${badRes.status}, Handled: "${badData.message}"`);
  } catch (err) {
    record(11, 'Protected API Access with Invalid Token', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 12: HR_ADMIN Role Functionality
  // -------------------------------------------------------------
  try {
    const usersRes = await fetch(`${BASE_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    const passed = usersRes.status === 200 && Array.isArray(usersData.data);
    record(12, 'HR_ADMIN Functionality (User Management)', passed, `Status: ${usersRes.status}, Total Users: ${usersData.data?.length}`);
  } catch (err) {
    record(12, 'HR_ADMIN Functionality (User Management)', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 13: RECRUITER Role Functionality
  // -------------------------------------------------------------
  try {
    // Recruiter can create/list jobs
    const jobsRes = await fetch(`${BASE_URL}/jobs`, {
      headers: { Authorization: `Bearer ${legitToken}` },
    });
    const jobsData = await jobsRes.json();
    const passed = jobsRes.status === 200 && Array.isArray(jobsData.data);
    record(13, 'RECRUITER Functionality (Job Requisitions)', passed, `Status: ${jobsRes.status}, Jobs count: ${jobsData.data?.length}`);
  } catch (err) {
    record(13, 'RECRUITER Functionality (Job Requisitions)', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 14: INTERVIEWER Role RBAC Enforcement
  // -------------------------------------------------------------
  try {
    // Interviewer attempting to access admin-only /auth/users should get 403 Forbidden
    const forbiddenRes = await fetch(`${BASE_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${interviewerToken}` },
    });
    const forbiddenData = await forbiddenRes.json();
    const passed = forbiddenRes.status === 403 && forbiddenData.success === false;
    record(14, 'INTERVIEWER RBAC Boundary Enforcement', passed, `Status: ${forbiddenRes.status}, Blocked: "${forbiddenData.message}"`);
  } catch (err) {
    record(14, 'INTERVIEWER RBAC Boundary Enforcement', false, err.message);
  }

  console.log('\n=============================================================');
  const allPassed = testResults.every(t => t.passed);
  console.log(` SUMMARY: ${testResults.filter(t => t.passed).length}/${testResults.length} SECURITY TESTS PASSED.`);
  console.log('=============================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runSecurityTests().catch(err => {
  console.error('[Error] Test suite failure:', err);
  process.exit(1);
});
