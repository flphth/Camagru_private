if (typeof profileForm === 'undefined') {

    const profileForm = document.getElementById('profile');
    const messageElement = document.getElementById('message');

    (async () => {
        const data = await fetchWithAuth('/api/account/getProfile/');
        if (data.status === 'success' && data.user) {
            document.getElementById('username').value = data.user.username;
            document.getElementById('email').value = data.user.email;
            document.getElementById('notifyOnComment').checked = Number(data.user.notifyOnComment) === 1;
        } else {
            messageElement.textContent = 'You must be logged in.';
            messageElement.classList.add('text-error');
        }
    })();

    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const notifyOnComment = document.getElementById('notifyOnComment').checked;

        const data = await fetchWithAuth('/api/account/update/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, notifyOnComment })
        });

        messageElement.textContent = data.message;
        messageElement.classList.remove('text-success', 'text-error');
        messageElement.classList.add(data.status === 'success' ? 'text-success' : 'text-error');
        document.getElementById('password').value = '';
    });

}
