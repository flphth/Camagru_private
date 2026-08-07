if (typeof profileForm === 'undefined') {

    const profileForm = document.getElementById('profile');
    const messageElement = document.getElementById('message');

    (async () => {
        const data = await fetchWithAuth('/api/account/getProfile/');
        if (data.status === 'success' && data.user) {
            document.getElementById('username').value = data.user.username;
            document.getElementById('email').value = data.user.email;
            document.getElementById('notifyOnComment').checked = Number(data.user.notifyOnComment) === 1;

            document.getElementById('profile-username').textContent = data.user.username;
            document.getElementById('profile-avatar').textContent = (data.user.username || '?').charAt(0).toUpperCase();
        } else {
            // Not logged in: send to the login page instead of showing a message
            history.pushState(null, '', '/login');
            loadContent('login');
        }
    })();

    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const notifyOnComment = document.getElementById('notifyOnComment').checked;
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const newPasswordConfirm = document.getElementById('newPasswordConfirm').value;

        const payload = { username, email, notifyOnComment };

        // Only touch the password when the user is actually changing it
        if (currentPassword !== '' || newPassword !== '' || newPasswordConfirm !== '') {
            if (newPassword !== newPasswordConfirm) {
                showMessage('New passwords do not match.', false);
                return;
            }
            payload.currentPassword = currentPassword;
            payload.password = newPassword;
        }

        const data = await fetchWithAuth('/api/account/update/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        showMessage(data.message, data.status === 'success');

        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('newPasswordConfirm').value = '';
    });

    function showMessage(text, ok) {
        messageElement.textContent = text;
        messageElement.classList.remove('text-success', 'text-error');
        messageElement.classList.add(ok ? 'text-success' : 'text-error');
    }

}
