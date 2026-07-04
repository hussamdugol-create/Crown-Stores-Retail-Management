document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (!loginForm) return;

    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Reset messages
        if (errorMessage) errorMessage.classList.add('d-none');
        if (successMessage) successMessage.classList.add('d-none');

        // Disable button during submission
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('csrmsToken', data.token);
                localStorage.setItem('csrmsUser', JSON.stringify({
                    name: data.user.name,
                    role: data.user.role,
                    username: data.user.username,
                    id: data.user.id
                }));

                // Show success message
                if (successMessage) {
                    successMessage.textContent = 'Login successful! Redirecting...';
                    successMessage.classList.remove('d-none');
                }

                // Redirect based on role
                setTimeout(() => {
                    const roleMap = {
                        'agent': '/dashboard-agent.html',
                        'manager': '/dashboard-manager.html',
                        'director': '/dashboard-director.html'
                    };
                    window.location.href = roleMap[data.user.role] || '/';
                }, 1000);
            } else {
                if (errorMessage) {
                    errorMessage.textContent = data.message || 'Login failed. Please try again.';
                    errorMessage.classList.remove('d-none');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            if (errorMessage) {
                errorMessage.textContent = 'Connection error. Please check if the server is running.';
                errorMessage.classList.remove('d-none');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Sign In';
        }
    });
});

// Utility function to check authentication
function checkAuth() {
    const token = localStorage.getItem('csrmsToken');
    const user = localStorage.getItem('csrmsUser');
    
    if (!token || !user) {
        window.location.href = '/';
    }
    
    return {
        token: token,
        user: JSON.parse(user)
    };
}

// Logout function
function logout() {
    localStorage.removeItem('csrmsToken');
    localStorage.removeItem('csrmsUser');
    window.location.href = '/';
}

// Fetch with authentication header
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('csrmsToken');
    
    if (!token) {
        window.location.href = '/';
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    return fetch(url, { ...options, headers });
}