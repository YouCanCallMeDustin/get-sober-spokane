//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Navbar fade-in animation function
    var navbarFadeIn = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        
        // Add initial state
        if (window.scrollY === 0) {
            navbarCollapsible.style.transform = 'translateY(-100%)';
            navbarCollapsible.style.opacity = '0';
        } else {
            // Trigger fade-in animation
            navbarCollapsible.style.transform = 'translateY(0)';
            navbarCollapsible.style.opacity = '1';
        }
    };

    // Initialize navbar state
    navbarShrink();
    navbarFadeIn();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);
    document.addEventListener('scroll', navbarFadeIn);

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
        document.querySelectorAll('#navbarResponsive .nav-link')
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
