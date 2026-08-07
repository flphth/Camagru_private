if (typeof registerForm === 'undefined') {

    const registerForm = document.getElementById('register');
    const messageElement = document.getElementById('message');
    const passwordInput = document.getElementById('password');
    const strengthEl = document.getElementById('password-strength');

    // Rough client-side strength hint (the server still enforces the real rules)
    function passwordStrength(pw) {
        if (!pw) return { label: '', level: '' };
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (score <= 1) return { label: 'Weak', level: 'weak' };
        if (score <= 3) return { label: 'Medium', level: 'medium' };
        return { label: 'Strong', level: 'strong' };
    }

    passwordInput.addEventListener('input', () => {
        const s = passwordStrength(passwordInput.value);
        strengthEl.textContent = s.label ? ('Password strength: ' + s.label) : '';
        strengthEl.className = 'password-strength ' + s.level;
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = passwordInput.value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;

        if (password !== passwordConfirm) {
            messageElement.textContent = 'Passwords do not match.';
            messageElement.classList.remove('text-success', 'text-error');
            messageElement.classList.add('text-error');
            return;
        }

        const response = await fetch('/api/account/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, username, password })
        });

        const data = await response.json();

        if (data.status === 'success') {
            // Replace the form with a confirmation screen
            const panel = registerForm.closest('.auth-form');
            panel.innerHTML = '';

            const title = document.createElement('h2');
            title.className = 'auth-title';
            title.textContent = 'Check your email';

            const text = document.createElement('p');
            text.className = 'auth-subtitle';
            text.textContent = data.message;

            const link = document.createElement('a');
            link.className = 'btn btn-primary btn-block';
            link.href = '/login';
            link.textContent = 'Go to login';
            link.setAttribute('onclick', "navigate(event, 'login')");

            panel.appendChild(title);
            panel.appendChild(text);
            panel.appendChild(link);
        } else {
            messageElement.textContent = data.message;
            messageElement.classList.remove('text-success', 'text-error');
            messageElement.classList.add('text-error');
        }
    });

}
