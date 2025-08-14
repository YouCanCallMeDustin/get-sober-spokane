// Lightweight session-aware navbar updater for public pages
// Requires: js/config.js to be loaded first (provides initSupabaseWithRetry and supabaseClient)

(function () {
    const LOGIN_HREF = CONFIG.REDIRECT_URLS.LOGIN_PAGE;
    const DASHBOARD_HREF = CONFIG.REDIRECT_URLS.AFTER_LOGIN;

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
                window.location.href = CONFIG.REDIRECT_URLS.LOGIN_PAGE;
            }
        });
        li.appendChild(a);
        container.appendChild(li);
    }

    function updateNavLoggedIn() {
		const loginLinks = findLoginLinks();
		if (loginLinks.length > 0) {
			// Hide the Sign In button instead of converting it to a purple Dashboard button
			loginLinks.forEach((link) => {
				const li = link.closest('li');
				if (li) li.style.display = 'none';
			});
			const navList = loginLinks[0].closest('.navbar-nav') || document.querySelector('.navbar-nav');
			if (navList) ensureSignOutControl(navList);
		} else {
			// No login link present on this page; still add Sign Out to the navbar
			const navList = document.querySelector('.navbar-nav');
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
				// Restore Sign In button visibility and text without overwriting custom classes/styles
				const li = link.closest('li');
				if (li) li.style.display = '';
				link.href = LOGIN_HREF;
				link.textContent = 'Sign In';
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


