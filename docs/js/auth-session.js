// Lightweight session-aware navbar updater for public pages
// Requires: js/config.js to be loaded first (provides initSupabaseWithRetry and supabaseClient)

(function () {
    const LOGIN_HREF = 'login.html';
    const DASHBOARD_HREF = 'dashboard.html';

    function findLoginLinks() {
        const nav = document.querySelector('#navbarResponsive, nav .navbar-nav') || document;
        return Array.from(nav.querySelectorAll('a[href$="' + LOGIN_HREF + '"]'));
    }

    function ensureSignOutControl(container) {
        if (document.getElementById('nav-signout-link')) return;
        const li = document.createElement('li');
        li.className = 'nav-item';
        const a = document.createElement('a');
        a.className = 'nav-link btn btn-outline-secondary btn-sm text-dark px-3';
        a.style.borderRadius = '20px';
        a.id = 'nav-signout-link';
        a.href = '#';
        a.textContent = 'Sign Out';
        a.addEventListener('click', async function (e) {
            e.preventDefault();
            try {
                if (window.auth && typeof window.auth.signOut === 'function') {
                    await window.auth.signOut();
                } else if (window.supabaseClient) {
                    await window.supabaseClient.auth.signOut();
                }
            } catch (err) {
                // Ignore and still redirect
            } finally {
                window.location.href = LOGIN_HREF;
            }
        });
        li.appendChild(a);
        container.appendChild(li);
    }

    function updateNavLoggedIn() {
        const loginLinks = findLoginLinks();
        if (loginLinks.length > 0) {
            loginLinks.forEach((link) => {
                link.href = DASHBOARD_HREF;
                link.textContent = 'Dashboard';
                link.classList.remove('btn-primary');
                link.classList.add('btn', 'btn-primary', 'btn-sm', 'text-white');
            });
            const navList = loginLinks[0].closest('.navbar-nav') || document.querySelector('.navbar-nav');
            if (navList) ensureSignOutControl(navList);
        }
    }

    function updateNavLoggedOut() {
        const navList = document.querySelector('.navbar-nav');
        const signOut = document.getElementById('nav-signout-link');
        if (signOut && signOut.parentElement) signOut.parentElement.remove();
        const loginLinks = findLoginLinks();
        if (loginLinks.length > 0) {
            loginLinks.forEach((link) => {
                link.href = LOGIN_HREF;
                link.textContent = 'Sign In';
                link.classList.add('btn', 'btn-primary', 'btn-sm', 'text-white');
            });
        }
    }

    async function init() {
        if (typeof window.initSupabaseWithRetry === 'function') {
            await window.initSupabaseWithRetry();
        }
        const client = window.supabaseClient;
        if (!client) return;

        try {
            const { data: { user } } = await client.auth.getUser();
            if (user) updateNavLoggedIn();
            else updateNavLoggedOut();

            client.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') updateNavLoggedIn();
                if (event === 'SIGNED_OUT') updateNavLoggedOut();
            });
        } catch (e) {
            // Non-fatal
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();


