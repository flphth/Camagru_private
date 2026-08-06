if (typeof registerForm === 'undefined') {

    const registerForm = document.getElementById('register');
    const messageElement = document.getElementById('message');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

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
            const panel = registerForm.closest('.auth-panel');
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
