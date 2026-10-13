import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const BASE_URL = `http://localhost:${env.PORT}${env.API_PREFIX}`;

const logTest = (name, passed, details = '') => {
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} - ${name}`);
  if (details) {
    console.log(`      Details: ${details}`);
  }
};

const runAuthTests = async () => {
  console.log('\n======================================================');
  console.log(' Running Automated Authentication & RBAC Test Suite');
  console.log(` Target Endpoint: ${BASE_URL}`);
  console.log('======================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  // -----------------------------------------------------------------
  // Test 1: Valid Login
  // -----------------------------------------------------------------
  totalCount++;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'recruiter@talentpulse.ai',
        password: 'password123',
      }),
    });
    const data = await res.json();

    const is200 = res.status === 200;
    const hasToken = !!data.data?.token;
    const correctRole = data.data?.user?.role === 'RECRUITER';
    const noPassword = data.data?.user?.password === undefined;

    if (is200 && hasToken && correctRole && noPassword) {
      logTest('1. Valid Login', true, `Received JWT token, Role: ${data.data.user.role}, Password excluded`);
      passedCount++;
    } else {
      logTest('1. Valid Login', false, `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logTest('1. Valid Login', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 2: Invalid Password
  // -----------------------------------------------------------------
  totalCount++;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@talentpulse.ai',
        password: 'IncorrectPassword!#$',
      }),
    });
    const data = await res.json();

    const is401 = res.status === 401;
    const isSuccessFalse = data.success === false;

    if (is401 && isSuccessFalse) {
      logTest('2. Invalid Password Rejection', true, `HTTP 401 returned: "${data.message}"`);
      passedCount++;
    } else {
      logTest('2. Invalid Password Rejection', false, `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logTest('2. Invalid Password Rejection', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 3: Expired Token Rejection
  // -----------------------------------------------------------------
  totalCount++;
  try {
    // Manually forge an expired token (expired 10 seconds ago)
    const expiredToken = jwt.sign(
      {
        id: '6abd5fa7fbc73726332b69cd',
        email: 'admin@talentpulse.ai',
        role: 'ADMIN',
      },
      env.JWT_SECRET,
      { expiresIn: '-10s' }
    );

    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
    });
    const data = await res.json();

    const is401 = res.status === 401;
    const mentionsExpired = data.message?.toLowerCase().includes('expired');

    if (is401 && mentionsExpired) {
      logTest('3. Expired Token Handling', true, `HTTP 401 correctly returned: "${data.message}"`);
      passedCount++;
    } else {
      logTest('3. Expired Token Handling', false, `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logTest('3. Expired Token Handling', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 4: Unauthorized Role Access
  // -----------------------------------------------------------------
  totalCount++;
  try {
    // Login as INTERVIEWER
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'interviewer@talentpulse.ai',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    const interviewerToken = loginData.data?.token;

    // Attempt to access an HR_ADMIN-only endpoint (/auth/users)
    const rbacRes = await fetch(`${BASE_URL}/auth/users`, {
      headers: {
        Authorization: `Bearer ${interviewerToken}`,
      },
    });
    const rbacData = await rbacRes.json();

    const is403 = rbacRes.status === 403;
    const mentionsForbidden = rbacData.message?.toLowerCase().includes('authorized') || rbacData.message?.toLowerCase().includes('denied') || rbacData.message?.toLowerCase().includes('forbidden');

    if (is403 && mentionsForbidden) {
      logTest(
        '4. Unauthorized Role Blocked (403 Forbidden)',
        true,
        `Role 'INTERVIEWER' denied access to ADMIN resource: "${rbacData.message}"`
      );
      passedCount++;
    } else {
      logTest('4. Unauthorized Role Blocked', false, `Status: ${rbacRes.status}, Body: ${JSON.stringify(rbacData)}`);
    }
  } catch (err) {
    logTest('4. Unauthorized Role Blocked', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 5: Authorized Role Access
  // -----------------------------------------------------------------
  totalCount++;
  try {
    // Login as ADMIN
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@talentpulse.ai',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    const adminToken = loginData.data?.token;

    // Access HR_ADMIN-only endpoint (/auth/users)
    const rbacRes = await fetch(`${BASE_URL}/auth/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const rbacData = await rbacRes.json();

    // Access GET /auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const meData = await meRes.json();

    const is200 = rbacRes.status === 200 && meRes.status === 200;
    const profileMatch = meData.data?.email === 'admin@talentpulse.ai';

    if (is200 && profileMatch) {
      logTest(
        '5. Authorized Role Allowed (200 OK)',
        true,
        `Role 'ADMIN' granted access to HR_ADMIN resource & verified profile: "${meData.data.email}"`
      );
      passedCount++;
    } else {
      logTest('5. Authorized Role Allowed', false, `RBAC: ${rbacRes.status}, Profile: ${meRes.status}`);
    }
  } catch (err) {
    logTest('5. Authorized Role Allowed', false, err.message);
  }

  // -----------------------------------------------------------------
  // Test 6: Registration & Logout Cycle
  // -----------------------------------------------------------------
  totalCount++;
  try {
    const testRegEmail = `test_${Date.now()}@talentpulse.ai`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Test Recruiter',
        email: testRegEmail,
        password: 'Password123!',
        role: 'RECRUITER',
      }),
    });
    const regData = await regRes.json();

    const is201 = regRes.status === 201;
    const regToken = regData.data?.token;

    // Logout
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${regToken}`,
      },
    });
    const isLogout200 = logoutRes.status === 200;

    if (is201 && isLogout200) {
      logTest('6. Register & Logout Flow', true, `Registered ${testRegEmail} and executed logout`);
      passedCount++;
    } else {
      logTest('6. Register & Logout Flow', false, `Reg status: ${regRes.status}, Logout: ${logoutRes.status}`);
    }
  } catch (err) {
    logTest('6. Register & Logout Flow', false, err.message);
  }

  console.log('\n======================================================');
  console.log(` TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
  console.log('======================================================\n');

  if (passedCount === totalCount) {
    process.exit(0);
  } else {
    process.exit(1);
  }
};

runAuthTests();
