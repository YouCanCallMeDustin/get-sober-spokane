/*!
* Start Bootstrap - Creative v7.0.8 (https://YOUR_USERNAME.github.io/sober-spokane)
* Copyright 2013-2026 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
* Built: 2026-02-03T03:13:29.517Z
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {
    // Remove scroll-based navbar shrink/fade behavior to keep navbar solid
    // This intentionally does nothing so the navbar remains consistent

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link:not(.dropdown-toggle)')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Activate SimpleLightbox plugin for portfolio items
    new SimpleLightbox({
        elements: '#portfolio a.portfolio-box'
    });

    // Video playlist logic removed: only a single combined video is used for the masthead background.

    // Contact form custom handler
    // (Removed for Formspree integration)

});
