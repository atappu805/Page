document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close mobile menu when clicking any link
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 2. Interactive Legal Tabs (Clean URL - No #terms or #ytm-policy in address bar)
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function switchTab(targetId) {
        tabButtons.forEach(btn => {
            const active = btn.dataset.target === targetId;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active);
        });

        tabPanes.forEach(pane => {
            pane.classList.toggle('active', pane.id === targetId);
        });
    }

    // Clean any hash from address bar so URL remains clear (https://pixelmusic.pages.dev)
    function cleanUrlHash() {
        if (window.location.hash && history.replaceState) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.dataset.target;
            switchTab(target);
            cleanUrlHash();
        });
    });

    // Intercept footer/policy links to #ytm-policy, #privacy, #terms without adding hash to URL
    document.querySelectorAll('a[href="#ytm-policy"], a[href="#privacy"], a[href="#terms"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').replace('#', '');
            switchTab(targetId);
            const legalSection = document.getElementById('legal');
            if (legalSection) {
                legalSection.scrollIntoView({ behavior: 'smooth' });
            }
            cleanUrlHash();
        });
    });

    // On page load or refresh: if a policy hash exists, open the tab and scroll to it,
    // then immediately strip the hash so the user has the clear URL (https://pixelmusic.pages.dev)
    const initialHash = window.location.hash.replace('#', '');
    if (['ytm-policy', 'privacy', 'terms'].includes(initialHash)) {
        switchTab(initialHash);
        const legalSection = document.getElementById('legal');
        if (legalSection) {
            legalSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    cleanUrlHash();

    // 3. Screenshot Lightbox Modal with Gallery Navigation
    const lightbox = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const galleryCards = Array.from(document.querySelectorAll('.device-card[data-gallery]'));

    let currentGalleryIndex = 0;
    let isTransitioning = false;

    function updateLightbox(index, direction = null) {
        if (!galleryCards.length) return;
        const newIndex = (index + galleryCards.length) % galleryCards.length;
        currentGalleryIndex = newIndex;
        const card = galleryCards[currentGalleryIndex];
        const img = card.querySelector('img');
        const caption = card.querySelector('.device-caption');

        if (!img || !lightboxImg) return;

        if (direction && !isTransitioning) {
            isTransitioning = true;
            const outOffset = direction === 'next' ? -22 : 22;
            lightboxImg.style.transition = 'opacity 0.16s ease, transform 0.16s ease';
            lightboxImg.style.opacity = '0';
            lightboxImg.style.transform = 'translateX(' + outOffset + 'px) scale(0.96)';

            setTimeout(() => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || '';
                lightboxImg.classList.remove('zoomed');
                if (lightboxCaption) {
                    lightboxCaption.textContent = caption ? caption.textContent.trim() : (img ? img.alt : '');
                }

                const inOffset = direction === 'next' ? 22 : -22;
                lightboxImg.style.transition = 'none';
                lightboxImg.style.transform = 'translateX(' + inOffset + 'px) scale(0.96)';

                // Force reflow
                void lightboxImg.offsetWidth;

                lightboxImg.style.transition = 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1)';
                lightboxImg.style.opacity = '1';
                lightboxImg.style.transform = 'translateX(0) scale(1)';

                setTimeout(() => {
                    isTransitioning = false;
                    lightboxImg.style.transition = '';
                    lightboxImg.style.transform = '';
                }, 260);
            }, 160);
        } else {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt || '';
            lightboxImg.classList.remove('zoomed');
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = '';
            if (lightboxCaption) {
                lightboxCaption.textContent = caption ? caption.textContent.trim() : (img ? img.alt : '');
            }
        }
    }

    function openLightbox(index) {
        if (!lightbox) return;
        updateLightbox(index);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        if (lightboxImg) {
            lightboxImg.classList.remove('zoomed');
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = '';
        }
        document.body.style.overflow = '';
    }

    if (lightbox && lightboxImg) {
        galleryCards.forEach((card, index) => {
            card.addEventListener('click', () => openLightbox(index));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });
        });

        // Also support clicking hero visual phone
        const heroPhone = document.querySelector('.hero-phone');
        if (heroPhone) {
            heroPhone.addEventListener('click', () => {
                const img = heroPhone.querySelector('img');
                const caption = heroPhone.querySelector('.device-caption');
                if (img) {
                    lightboxImg.src = img.src;
                    lightboxImg.alt = img.alt || '';
                    lightboxImg.classList.remove('zoomed');
                    if (lightboxCaption) lightboxCaption.textContent = caption ? caption.textContent.trim() : '';
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        }

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                updateLightbox(currentGalleryIndex - 1, 'prev');
            });
        }
        if (lightboxNext) {
            lightboxNext.addEventListener('click', (e) => {
                e.stopPropagation();
                updateLightbox(currentGalleryIndex + 1, 'next');
            });
        }

        // Toggle zoom on image click
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            lightboxImg.classList.toggle('zoomed');
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === lightboxCaption) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                updateLightbox(currentGalleryIndex - 1, 'prev');
            } else if (e.key === 'ArrowRight') {
                updateLightbox(currentGalleryIndex + 1, 'next');
            }
        });
    }

    // 4. Live GitHub Releases Loader
    const relVersion = document.getElementById('relVersion');
    const relMeta = document.getElementById('relMeta');
    const relPrimary = document.getElementById('relPrimary');
    const relAssets = document.getElementById('relAssets');
    const relNotes = document.getElementById('relNotes');
    const relNotesList = document.getElementById('relNotesList');
    const relChangelog = document.getElementById('relChangelog');
    const trustRelease = document.getElementById('trustRelease');

    function formatBytes(bytes) {
        if (!bytes || bytes <= 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function extractSha256(body, filename) {
        if (!body) return null;
        if (filename) {
            const cleanName = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const fileMatch = new RegExp(cleanName + '[^\\n]*?([a-fA-F0-9]{64})', 'i').exec(body) ||
                              new RegExp('([a-fA-F0-9]{64})[^\\n]*?' + cleanName, 'i').exec(body);
            if (fileMatch) return fileMatch[1];
        }
        const generalMatch = /(?:sha-?256|checksum|hash)[:\s]+([a-fA-F0-9]{64})/i.exec(body);
        return generalMatch ? generalMatch[1] : null;
    }

    async function loadLatestRelease() {
        if (!relVersion) return;

        const repo = 'Saurav-02/PixelMusic';
        const repoUrl = 'https://github.com/' + repo;
        const releasesPageUrl = repoUrl + '/releases';

        let timeoutId;
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        if (controller) {
            timeoutId = setTimeout(() => controller.abort(), 8000);
        }

        try {
            const fetchOpts = {
                headers: { 'Accept': 'application/vnd.github.v3+json' }
            };
            if (controller) fetchOpts.signal = controller.signal;

            let res = await fetch('https://api.github.com/repos/' + repo + '/releases/latest', fetchOpts);

            // If 404 (e.g. only pre-releases exist), fall back to list of releases
            if (!res.ok) {
                res = await fetch('https://api.github.com/repos/' + repo + '/releases?per_page=1', fetchOpts);
            }

            if (timeoutId) clearTimeout(timeoutId);

            if (!res.ok) {
                throw new Error('GitHub API responded with status ' + res.status);
            }

            let data = await res.json();
            if (Array.isArray(data)) {
                if (data.length === 0) throw new Error('No releases found');
                data = data[0];
            }

            const release = data;
            const tagName = release.tag_name || '';
            const releaseTitle = release.name || tagName || 'PixelMusic Latest Release';
            const publishedDate = formatDate(release.published_at);
            const htmlUrl = release.html_url || releasesPageUrl;
            const assets = release.assets || [];

            // 1. Release Title
            relVersion.textContent = releaseTitle;

            // 2. Find APK asset (prefer .apk)
            const apkAsset = assets.find(a => a.name && a.name.toLowerCase().endsWith('.apk')) || assets[0];

            // 3. Metadata
            const metaParts = [];
            if (publishedDate) metaParts.push('Released on ' + publishedDate);
            if (tagName && releaseTitle !== tagName) metaParts.push(tagName);
            if (apkAsset && apkAsset.size) metaParts.push(formatBytes(apkAsset.size));
            if (relMeta) {
                relMeta.textContent = metaParts.join(' · ');
            }

            // 4. Primary CTA button
            if (relPrimary) {
                if (apkAsset && apkAsset.browser_download_url) {
                    relPrimary.href = apkAsset.browser_download_url;
                    relPrimary.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="margin-right: 6px; vertical-align: -3px;"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>Download APK (' + formatBytes(apkAsset.size) + ')';
                    relPrimary.setAttribute('download', apkAsset.name);
                } else {
                    relPrimary.href = htmlUrl;
                    relPrimary.textContent = 'View release on GitHub';
                }
            }

            // 5. Changelog links
            if (relChangelog) {
                relChangelog.href = htmlUrl;
            }

            // 6. Trust Section latest release link
            if (trustRelease) {
                trustRelease.innerHTML = '<a href="' + htmlUrl + '" target="_blank" rel="noopener">' + escapeHtml(tagName || releaseTitle) + (publishedDate ? ' (' + publishedDate + ')' : '') + '</a>';
            }

            // 7. Assets list
            if (relAssets) {
                if (assets.length > 0) {
                    const releaseBody = release.body || '';
                    relAssets.innerHTML = assets.map(asset => {
                        const isApk = asset.name.toLowerCase().endsWith('.apk');
                        const sizeStr = formatBytes(asset.size);
                        const sha = extractSha256(releaseBody, asset.name);
                        return '<div class="asset-row">' +
                            '<div class="asset-top">' +
                                '<a class="asset-name" href="' + asset.browser_download_url + '" ' + (isApk ? 'download' : '') + ' target="_blank" rel="noopener">' +
                                    escapeHtml(asset.name) +
                                '</a>' +
                                '<span class="asset-size">' + sizeStr + '</span>' +
                            '</div>' +
                            (sha ? '<div class="hash"><span class="hash-label">SHA-256: </span>' + sha + '</div>' : '') +
                        '</div>';
                    }).join('');
                } else {
                    relAssets.innerHTML = '';
                }
            }

            // 8. Release Notes / Changelog preview
            if (relNotes && relNotesList && release.body) {
                const lines = release.body
                    .split(/\r?\n/)
                    .map(l => l.trim())
                    .filter(l => l.length > 0);

                const bulletLines = lines.filter(l => /^[-*•]\s+/.test(l) || /^\d+\.\s+/.test(l));
                const displayItems = (bulletLines.length > 0 ? bulletLines : lines.filter(l => !l.startsWith('#'))).slice(0, 8);

                if (displayItems.length > 0) {
                    relNotesList.innerHTML = displayItems.map(item => {
                        const clean = item.replace(/^([-*•]|\d+\.)\s+/, '');
                        return '<li>' + escapeHtml(clean) + '</li>';
                    }).join('');
                    relNotes.hidden = false;
                }
            }

        } catch (err) {
            if (timeoutId) clearTimeout(timeoutId);
            console.warn('Could not load latest GitHub release live:', err);

            // Graceful fallback so the UI is never stuck on "Loading latest release…"
            if (relVersion) {
                relVersion.textContent = 'PixelMusic Releases';
            }
            if (relMeta) {
                relMeta.textContent = 'Download the latest APK build directly from GitHub Releases.';
            }
            if (relPrimary) {
                relPrimary.href = releasesPageUrl;
                relPrimary.textContent = 'View Releases on GitHub';
            }
            if (relAssets) {
                relAssets.innerHTML = '<div class="asset-row">' +
                    '<div class="asset-top">' +
                        '<a class="asset-name" href="' + releasesPageUrl + '" target="_blank" rel="noopener">' +
                            'PixelMusic APK Releases on GitHub' +
                        '</a>' +
                        '<span class="asset-size">Latest Build</span>' +
                    '</div>' +
                '</div>';
            }
        }
    }

    loadLatestRelease();

    // 5. Scroll-Triggered Reveal System
    function initScrollReveal() {
        if (!('IntersectionObserver' in window)) return;

        var selectors = [
            '.hero',
            '.hero-visual',
            '.section-header',
            '.showcase-header',
            '.gallery-group',
            '.device-card',
            '.feature-card',
            '.download-card',
            '.trust-item',
            '.faq details',
            '.support-card',
            '.contact-card',
            '.legal-tab-nav',
            '.legal-card'
        ];

        var targets = document.querySelectorAll(selectors.join(', '));
        if (!targets.length) return;

        targets.forEach(function(el) {
            el.classList.add('reveal-item');
        });

        document.documentElement.classList.add('reveal-ready');

        var observer = new IntersectionObserver(function(entries, obs) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.08
        });

        targets.forEach(function(el) {
            observer.observe(el);
        });
    }

    initScrollReveal();

    // 6. Interactive 3D Curved Particle Canopy (Reacts to Scroll & Theme)
    function initReactiveBackground() {
        var canvas = document.getElementById('bgCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        var width = 0;
        var height = 0;
        var dpr = 1;

        // Precompute grid in normalized 3D parameter space
        var cols = 56;
        var rows = 28;
        var grid = [];
        for (var c = 0; c < cols; c++) {
            var u = -2.3 + (4.6 * c) / (cols - 1);
            for (var r = 0; r < rows; r++) {
                var v = 0.85 + (3.0 * r) / (rows - 1);
                grid.push({
                    u: u,
                    v: v,
                    arch: -0.32 + 0.36 * (u * u) - 0.08 * v
                });
            }
        }
        var gridLen = grid.length;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        // Scroll tracking
        var lastScrollY = window.scrollY || 0;
        var scrollVelocity = 0;
        var smoothVelocity = 0;

        window.addEventListener('scroll', function() {
            var curY = window.scrollY || 0;
            var delta = curY - lastScrollY;
            scrollVelocity = delta;
            lastScrollY = curY;
        }, { passive: true });

        // Mouse tracking for subtle 3D perspective parallax
        var mouseX = 0;
        var mouseY = 0;
        var targetMouseX = 0;
        var targetMouseY = 0;

        window.addEventListener('mousemove', function(e) {
            targetMouseX = (e.clientX / Math.max(1, width) - 0.5) * 2;
            targetMouseY = (e.clientY / Math.max(1, height) - 0.5) * 2;
        }, { passive: true });

        // Theme tracking
        var darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        var isDark = darkModeQuery.matches;
        darkModeQuery.addEventListener('change', function(e) {
            isDark = e.matches;
        });

        var time = 0;
        var isPageVisible = true;

        document.addEventListener('visibilitychange', function() {
            isPageVisible = !document.hidden;
            if (isPageVisible) {
                lastScrollY = window.scrollY || 0;
                requestAnimationFrame(render);
            }
        });

        function render() {
            if (!isPageVisible) return;

            // Smooth kinetic dampening
            smoothVelocity += (scrollVelocity - smoothVelocity) * 0.1;
            scrollVelocity *= 0.88;

            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            var curScroll = window.scrollY || 0;
            var velocitySurge = 1 + Math.min(Math.abs(smoothVelocity) * 0.035, 2.2);
            time += 0.016;

            ctx.clearRect(0, 0, width, height);

            var fov = Math.min(width, height) * 0.85;
            var horizonY = height * 0.08;
            var scrollPhase = curScroll * 0.0025;
            var baseWaveAmp = 0.045 * velocitySurge;

            var tiltX = mouseX * 0.08;
            var tiltY = mouseY * 0.05;

            for (var i = 0; i < gridLen; i++) {
                var pt = grid[i];
                var u = pt.u + tiltX;
                var v = pt.v;

                // 3D undulating waves (harmonic ripple)
                var wave1 = Math.sin(u * 3.6 + v * 2.4 + time * 1.4 + scrollPhase) * baseWaveAmp;
                var wave2 = Math.cos(u * 2.2 - time * 0.9 + scrollPhase * 0.5) * (baseWaveAmp * 0.35);
                var y3d = pt.arch + wave1 + wave2 + tiltY;

                // 3D Perspective projection
                var px = width * 0.5 + (u * fov) / v;
                var py = horizonY + (y3d * fov) / v;

                // Screen boundary culling
                if (px < -15 || px > width + 15 || py < -15 || py > height + 15) {
                    continue;
                }

                // Perspective scaling & depth alpha
                var depthFactor = 1 / Math.pow(v, 1.25);
                var radius = Math.max(0.9, Math.min(4.5, 13.0 * depthFactor));
                var alpha = Math.max(0.12, Math.min(0.85, 0.95 * depthFactor));

                ctx.beginPath();
                ctx.arc(px, py, radius, 0, Math.PI * 2);

                if (isDark) {
                    // Ice blue / cyan glow from video demo
                    ctx.fillStyle = 'rgba(135, 206, 250, ' + alpha + ')';
                } else {
                    // Warm terracotta / bronze for light theme
                    ctx.fillStyle = 'rgba(152, 73, 39, ' + (alpha * 0.75) + ')';
                }
                ctx.fill();
            }

            requestAnimationFrame(render);
        }

        render();
    }

    initReactiveBackground();
});
