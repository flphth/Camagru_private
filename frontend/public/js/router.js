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

// Inline SVG icons for the sidebar (no external icon dependency)
const NAV_ICONS = {
    gallery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    editing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    login: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>',
    register: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>'
};

// Render the sidebar links depending on the connection state
function renderNav() {
    const nav = document.getElementById('nav-links');
    if (!nav) return;

    if (getToken()) {
        nav.innerHTML =
            '<a href="/list" onclick="navigate(event, \'list\')" class="sidebar-link">' + NAV_ICONS.gallery + '<span>Gallery</span></a>' +
            '<a href="/home" onclick="navigate(event, \'home\')" class="sidebar-link">' + NAV_ICONS.editing + '<span>Create</span></a>' +
            '<a href="/profile" onclick="navigate(event, \'profile\')" class="sidebar-link sidebar-bottom">' + NAV_ICONS.profile + '<span>Profile</span></a>' +
            '<a href="/logout" onclick="logout(event)" class="sidebar-link">' + NAV_ICONS.logout + '<span>Logout</span></a>';
    } else {
        nav.innerHTML =
            '<a href="/list" onclick="navigate(event, \'list\')" class="sidebar-link">' + NAV_ICONS.gallery + '<span>Gallery</span></a>' +
            '<a href="/register" onclick="navigate(event, \'register\')" class="sidebar-link">' + NAV_ICONS.register + '<span>Register</span></a>' +
            '<a href="/login" onclick="navigate(event, \'login\')" class="sidebar-link">' + NAV_ICONS.login + '<span>Login</span></a>';
    }

    // The brand is only a link when the user is logged in
    const brand = document.getElementById('sidebar-brand');
    if (brand) {
        if (getToken()) {
            brand.setAttribute('href', '/list');
            brand.setAttribute('onclick', "navigate(event, 'list')");
            brand.classList.remove('is-disabled');
        } else {
            brand.removeAttribute('href');
            brand.removeAttribute('onclick');
            brand.classList.add('is-disabled');
        }
    }
}

function logout(event) {
    event.preventDefault();
    localStorage.removeItem('authToken');
    renderNav();
    navigate(event, 'login');
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

// Themed confirmation dialog; resolves true/false (falls back to native confirm)
function confirmAction(message) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-overlay');
        if (!overlay) { resolve(window.confirm(message)); return; }

        const text = document.getElementById('modal-text');
        const ok = document.getElementById('modal-confirm');
        const cancel = document.getElementById('modal-cancel');
        text.textContent = message;
        overlay.classList.add('is-open');

        const cleanup = () => {
            overlay.classList.remove('is-open');
            ok.removeEventListener('click', onOk);
            cancel.removeEventListener('click', onCancel);
            overlay.removeEventListener('click', onBackdrop);
        };
        const onOk = () => { cleanup(); resolve(true); };
        const onCancel = () => { cleanup(); resolve(false); };
        const onBackdrop = (e) => { if (e.target === overlay) { cleanup(); resolve(false); } };

        ok.addEventListener('click', onOk);
        cancel.addEventListener('click', onCancel);
        overlay.addEventListener('click', onBackdrop);
    });
}

function loadContent(page) {
    const noSidebarPages = ['login', 'register', 'forgot', 'reset', 'activate', 'about'];
    document.body.classList.toggle('no-sidebar', noSidebarPages.includes(page));

    // Back button: on secondary screens only (never on login); returns to login,
    // or to the gallery from the About page
    const backBtn = document.getElementById('auth-back');
    if (backBtn) {
        const showBack = ['register', 'forgot', 'reset', 'activate', 'about'].includes(page);
        backBtn.classList.toggle('is-visible', showBack);
        if (showBack) {
            const target = (page === 'about') ? 'list' : 'login';
            backBtn.setAttribute('href', '/' + target);
            backBtn.setAttribute('onclick', "navigate(event, '" + target + "')");
        }
    }

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