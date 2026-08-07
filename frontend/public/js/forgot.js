if (typeof forgotForm === 'undefined') {

    const forgotForm = document.getElementById('forgot');
    const messageElement = document.getElementById('message');

    forgotForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;

        const response = await fetch('/api/account/requestReset/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        messageElement.textContent = translateServerMessage(data.message);
        messageElement.classList.remove('text-success', 'text-error');
        messageElement.classList.add(data.status === 'success' ? 'text-success' : 'text-error');
    });

}
