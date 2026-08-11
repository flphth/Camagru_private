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
            '<a href="/list" onclick="navigate(event, \'list\')" class="sidebar-link">' + NAV_ICONS.gallery + '<span>' + t('nav.gallery') + '</span></a>' +
            '<a href="/create" onclick="navigate(event, \'create\')" class="sidebar-link">' + NAV_ICONS.editing + '<span>' + t('nav.create') + '</span></a>' +
            '<a href="/profile" onclick="navigate(event, \'profile\')" class="sidebar-link sidebar-bottom">' + NAV_ICONS.profile + '<span>' + t('nav.profile') + '</span></a>' +
            '<a href="/logout" onclick="logout(event)" class="sidebar-link">' + NAV_ICONS.logout + '<span>' + t('nav.logout') + '</span></a>';
    } else {
        nav.innerHTML =
            '<a href="/list" onclick="navigate(event, \'list\')" class="sidebar-link">' + NAV_ICONS.gallery + '<span>' + t('nav.gallery') + '</span></a>' +
            '<a href="/login" onclick="navigate(event, \'login\')" class="sidebar-link sidebar-bottom">' + NAV_ICONS.login + '<span>' + t('nav.login') + '</span></a>';
    }

    // The brand always links to the gallery
    const brand = document.getElementById('sidebar-brand');
    if (brand) {
        brand.setAttribute('href', '/list');
        brand.setAttribute('onclick', "navigate(event, 'list')");
        brand.classList.remove('is-disabled');
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
    const path = window.location.pathname.split('/')[1] || (getToken() ? 'list' : 'login');
    loadContent(path);
};

// Sun / moon icons for the theme toggle
const THEME_ICONS = {
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
};

// Dark / light theme toggle, persisted in localStorage
function initTheme() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    updateThemeIcon(btn);
    btn.addEventListener('click', () => {
        const dark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        updateThemeIcon(btn);
    });
}

// Show the icon of the mode the click will switch to
function updateThemeIcon(btn) {
    const dark = document.documentElement.classList.contains('dark');
    btn.innerHTML = dark ? THEME_ICONS.sun : THEME_ICONS.moon;
}

document.addEventListener('DOMContentLoaded', () => {
    initI18n();
    initTheme();
    renderNav();
    // Root URL: logged-in users land on the gallery, visitors on the login page
    let initialPage = window.location.pathname.split('/')[1];
    if (!initialPage) {
        initialPage = getToken() ? 'list' : 'login';
    }
    loadContent(initialPage);
});

// Themed dialog. Resolves true (confirm/OK) or false (cancel/backdrop).
function openModal({ message, confirmText, confirmClass, showCancel }) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-overlay');
        if (!overlay) {
            resolve(showCancel ? window.confirm(message) : true);
            return;
        }

        const text = document.getElementById('modal-text');
        const ok = document.getElementById('modal-confirm');
        const cancel = document.getElementById('modal-cancel');

        text.textContent = message;
        ok.textContent = confirmText;
        ok.className = 'btn ' + confirmClass;
        cancel.style.display = showCancel ? '' : 'none';
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

// Confirmation before a destructive action
function confirmAction(message) {
    return openModal({ message, confirmText: t('common.delete'), confirmClass: 'btn-error', showCancel: true });
}

// Informational dialog replacing native alert()
function alertModal(message) {
    return openModal({ message, confirmText: t('common.ok'), confirmClass: 'btn-primary', showCancel: false });
}

function loadContent(page) {
    // Stop the webcam when leaving the editor (otherwise the camera stays on)
    if (window.currentStream) {
        window.currentStream.getTracks().forEach(track => track.stop());
        window.currentStream = null;
    }

    // /home is an alias for the login page
    if (page === 'home') page = 'login';

    const noSidebarPages = ['login', 'register', 'forgot', 'reset', 'activate', 'about'];
    document.body.classList.toggle('no-sidebar', noSidebarPages.includes(page));

    fetch(`${page}.html`)
        .then(response => {
            if (!response.ok) {
                // Unknown route → custom 404 (instead of injecting nginx's default page)
                page = 'notfound';
                return fetch('notfound.html').then(r => r.text());
            }
            return response.text();
        })
        .then(data => {
            const content = document.getElementById('content');
            content.innerHTML = data;

            // Back button placed just left of the centered content block (auth screens
            // + About). About returns to the gallery, the others to login.
            if (['register', 'forgot', 'reset', 'activate', 'about'].includes(page)) {
                const block = content.firstElementChild;
                if (block) {
                    const target = (page === 'about') ? 'list' : 'login';
                    block.classList.add('has-back');
                    const back = document.createElement('a');
                    back.className = 'auth-back';
                    back.href = '/' + target;
                    back.setAttribute('aria-label', 'Back');
                    back.setAttribute('onclick', "navigate(event, '" + target + "')");
                    back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
                    block.insertBefore(back, block.firstChild);
                }
            }

            applyI18n(content);

            if (page === 'create') {
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
            } else if (page === 'list' || page === 'post') {
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
        .catch(() => {
            document.getElementById('content').innerHTML = '<p>Loading page error !</p>';
        });
}