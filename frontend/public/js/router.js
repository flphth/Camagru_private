function storeToken(token) {
    localStorage.setItem('authToken', token);
}

function getToken() {
    return localStorage.getItem('authToken');
}

async function fetchWithAuth(url, options = {}) {
    const token = getToken();

    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }

    const response = await fetch(url, options);

    // Vérifiez si le type de contenu de la réponse est JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    } else {
        // Si le type de contenu n'est pas JSON, renvoyez la réponse telle quelle
        return response;
    }
}

// Render the header links depending on the connection state
function renderNav() {
    const nav = document.getElementById('nav-links');
    if (!nav) return;

    if (getToken()) {
        nav.innerHTML =
            '<a href="/list" onclick="navigate(event, \'list\')" class="btn btn-link">Gallery</a>' +
            '<a href="/home" onclick="navigate(event, \'home\')" class="btn btn-link">Editing</a>' +
            '<a href="/profile" onclick="navigate(event, \'profile\')" class="btn btn-link">Profile</a>' +
            '<a href="/logout" onclick="logout(event)" class="btn btn-primary">Logout</a>';
    } else {
        nav.innerHTML =
            '<a href="/list" onclick="navigate(event, \'list\')" class="btn btn-link">Gallery</a>' +
            '<a href="/register" onclick="navigate(event, \'register\')" class="btn btn-link">Register</a>' +
            '<a href="/login" onclick="navigate(event, \'login\')" class="btn btn-primary">Login</a>';
    }
}

function logout(event) {
    event.preventDefault();
    localStorage.removeItem('authToken');
    renderNav();
    navigate(event, 'list');
}

// One page navigation block
function navigate(event, page) {
    event.preventDefault();
    history.pushState(null, '', `/${page}`);
    loadContent(page);
}

window.onpopstate = function () {
    const path = window.location.pathname.split('/')[1];
    loadContent(path);
};

document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    const initialPage = window.location.pathname.split('/')[1] || 'home';
    loadContent(initialPage);
});

function loadContent(page) {
    fetch(`${page}.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
            if (page === 'home') {
                const script = document.createElement('script');
                script.src = '/js/webcam.js';
                document.body.appendChild(script);
            } else if (page === 'register') {
                const script = document.createElement('script');
                script.src = '/js/register.js';
                document.body.appendChild(script);
            } else if (page === 'login') {
                const script = document.createElement('script');
                script.src = '/js/login.js';
                document.body.appendChild(script);
            } else if (page === 'list') {
                const script = document.createElement('script');
                script.src = '/js/list.js';
                document.body.appendChild(script);
            } else if (page === 'activate') {
                const script = document.createElement('script');
                script.src = '/js/activate.js';
                document.body.appendChild(script);
            } else if (page === 'forgot') {
                const script = document.createElement('script');
                script.src = '/js/forgot.js';
                document.body.appendChild(script);
            } else if (page === 'reset') {
                const script = document.createElement('script');
                script.src = '/js/reset.js';
                document.body.appendChild(script);
            } else if (page === 'profile') {
                const script = document.createElement('script');
                script.src = '/js/profile.js';
                document.body.appendChild(script);
            }
        })
        .catch(error => {
            console.error('Error loading the page:', error);
            document.getElementById('content').innerHTML = '<p>Loading page error !</p>';
        });
}