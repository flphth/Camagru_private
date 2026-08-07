if (typeof resetForm === 'undefined') {

    const resetForm = document.getElementById('reset');
    const messageElement = document.getElementById('message');
    const hash = new URLSearchParams(window.location.search).get('hash');

    resetForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const password = document.getElementById('password').value;

        const response = await fetch('/api/account/resetPassword/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ hash, password })
        });

        const data = await response.json();
        messageElement.textContent = translateServerMessage(data.message);
        messageElement.classList.remove('text-success', 'text-error');
        messageElement.classList.add(data.status === 'success' ? 'text-success' : 'text-error');
    });

}
