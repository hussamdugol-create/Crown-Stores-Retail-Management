/**
 * CROWN STORES RMS - API TESTING SCRIPT
 * Test all authentication endpoints and protected routes
 * Run: node test-auth.js
 */

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUsers = [
    { username: 'cashier', password: '123456', role: 'agent' },
    { username: 'manager', password: '123456', role: 'manager' },
    { username: 'director', password: '123456', role: 'director' }
];

let tokens = {};

// Utility function for API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { status: 0, data: { error: error.message } };
    }
}

// Test login for each role
async function testLogin() {
    console.log('\n🔐 TESTING LOGIN ENDPOINTS\n' + '='.repeat(50));

    for (const user of testUsers) {
        console.log(`\n📝 Testing login for: ${user.username} (${user.role})`);
        const result = await apiCall('/auth/login', 'POST', {
            username: user.username,
            password: user.password
        });

        if (result.status === 200) {
            console.log(`   ✅ Login successful`);
            console.log(`   🔑 Token: ${result.data.token.substring(0, 20)}...`);
            console.log(`   👤 User: ${result.data.user.name} (${result.data.user.role})`);
            tokens[user.role] = result.data.token;
        } else {
            console.log(`   ❌ Login failed: ${result.data.message}`);
        }
    }
}

// Test invalid credentials
async function testInvalidCredentials() {
    console.log('\n\n🚫 TESTING INVALID CREDENTIALS\n' + '='.repeat(50));

    const invalidTests = [
        { username: 'cashier', password: 'wrongpass', label: 'Wrong password' },
        { username: 'invalid', password: '123456', label: 'Non-existent user' },
        { username: '', password: '', label: 'Empty credentials' }
    ];

    for (const test of invalidTests) {
        console.log(`\n📝 Testing: ${test.label}`);
        const result = await apiCall('/auth/login', 'POST', {
            username: test.username,
            password: test.password
        });

        if (result.status !== 200) {
            console.log(`   ✅ Correctly rejected: ${result.data.message}`);
        } else {
            console.log(`   ❌ Should have failed but passed`);
        }
    }
}

// Test protected endpoints
async function testProtectedEndpoints() {
    console.log('\n\n🔒 TESTING PROTECTED ENDPOINTS\n' + '='.repeat(50));

    // Test with valid token
    console.log(`\n📝 Testing /auth/me with valid token`);
    const result = await apiCall('/auth/me', 'GET', null, tokens.agent);

    if (result.status === 200) {
        console.log(`   ✅ Access granted`);
        console.log(`   👤 User: ${result.data.user.name}`);
    } else {
        console.log(`   ❌ Access denied: ${result.data.message}`);
    }

    // Test without token
    console.log(`\n📝 Testing /auth/me without token`);
    const resultNoToken = await apiCall('/auth/me', 'GET');

    if (resultNoToken.status !== 200) {
        console.log(`   ✅ Correctly rejected: ${resultNoToken.data.message}`);
    } else {
        console.log(`   ❌ Should have rejected but passed`);
    }

    // Test with invalid token
    console.log(`\n📝 Testing /auth/me with invalid token`);
    const resultInvalidToken = await apiCall('/auth/me', 'GET', null, 'invalid-token-123');

    if (resultInvalidToken.status !== 200) {
        console.log(`   ✅ Correctly rejected: ${resultInvalidToken.data.message}`);
    } else {
        console.log(`   ❌ Should have rejected but passed`);
    }
}

// Test registration
async function testRegistration() {
    console.log('\n\n📋 TESTING REGISTRATION\n' + '='.repeat(50));

    const newUser = {
        username: 'testagent',
        password: 'testpass123',
        email: 'testagent@crownstores.com',
        name: 'Test Agent',
        role: 'agent'
    };

    console.log(`\n📝 Testing new user registration`);
    const result = await apiCall('/auth/register', 'POST', newUser);

    if (result.status === 201) {
        console.log(`   ✅ Registration successful`);
        console.log(`   👤 User: ${result.data.user.name}`);
        console.log(`   🔑 Token generated: ${result.data.token.substring(0, 20)}...`);
    } else {
        console.log(`   ℹ️ Registration response: ${result.data.message}`);
    }

    // Try to register duplicate
    console.log(`\n📝 Testing duplicate registration`);
    const duplicateResult = await apiCall('/auth/register', 'POST', newUser);

    if (duplicateResult.status !== 201) {
        console.log(`   ✅ Correctly rejected: ${duplicateResult.data.message}`);
    } else {
        console.log(`   ❌ Should have rejected duplicate`);
    }
}

// Test logout
async function testLogout() {
    console.log('\n\n🚪 TESTING LOGOUT\n' + '='.repeat(50));

    console.log(`\n📝 Testing logout endpoint`);
    const result = await apiCall('/auth/logout', 'POST', null, tokens.agent);

    if (result.status === 200) {
        console.log(`   ✅ Logout successful: ${result.data.message}`);
    } else {
        console.log(`   ⚠️ Logout response: ${result.data.message}`);
    }
}

// Main test runner
async function runTests() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   CROWN STORES RMS - AUTHENTICATION TEST SUITE        ║');
    console.log('╚════════════════════════════════════════════════════════╝');

    try {
        await testLogin();
        await testInvalidCredentials();
        await testProtectedEndpoints();
        await testRegistration();
        await testLogout();

        console.log('\n\n✅ TEST SUITE COMPLETED\n' + '='.repeat(50));
        console.log('\n📊 Summary:');
        console.log('   - Login endpoints: ✅ Tested');
        console.log('   - Invalid credentials: ✅ Tested');
        console.log('   - Protected endpoints: ✅ Tested');
        console.log('   - Registration: ✅ Tested');
        console.log('   - Logout: ✅ Tested\n');

    } catch (error) {
        console.error('\n❌ Test suite error:', error.message);
    }
}

// Run tests
runTests();
