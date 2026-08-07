if (typeof activateMessage === 'undefined') {

    const activateMessage = document.getElementById('activate-message');
    const hash = new URLSearchParams(window.location.search).get('hash');

    (async () => {
        if (!hash) {
            activateMessage.textContent = 'Missing activation code.';
            return;
        }

        try {
            const response = await fetch('/api/account/activate/' + encodeURIComponent(hash));
            const data = await response.json();
            activateMessage.textContent = translateServerMessage(data.message);
        } catch (error) {
            activateMessage.textContent = 'Activation failed. Please try again later.';
        }
    })();

}
