document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });

        // Close mobile menu when clicking any link
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
            });
        });
    }

    // 2. Interactive Legal Tabs & Hash Routing
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function switchTab(targetId) {
        tabButtons.forEach(btn => {
            if (btn.dataset.target === targetId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        tabPanes.forEach(pane => {
            if (pane.id === targetId) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.dataset.target;
            switchTab(target);
            history.replaceState(null, null, `#${target}`);
        });
    });

    // Check URL hash on page load for deep-linking (e.g. #privacy, #terms, #ytm-policy)
    function handleHash() {
        const hash = window.location.hash.replace('#', '');
        if (['ytm-policy', 'privacy', 'terms'].includes(hash)) {
            switchTab(hash);
            const element = document.getElementById('legal');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    window.addEventListener('hashchange', handleHash);
    handleHash();

    // 3. Screenshot Lightbox Modal
    const lightbox = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const deviceCards = document.querySelectorAll('.device-card img');

    if (lightbox && lightboxImg) {
        deviceCards.forEach(img => {
            img.parentElement.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
});
