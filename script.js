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

    // 6. Interactive Scroll-Reactive Audio-Wave & Ambient Aurora Background
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

        var lastScrollY = window.scrollY || 0;
        var scrollVelocity = 0;
        var smoothVelocity = 0;
        var scrollProgress = 0;

        window.addEventListener('scroll', function() {
            var curY = window.scrollY || 0;
            var delta = curY - lastScrollY;
            scrollVelocity = delta;
            lastScrollY = curY;
        }, { passive: true });

        var mouseX = width * 0.5;
        var mouseY = height * 0.5;
        var targetMouseX = mouseX;
        var targetMouseY = mouseY;

        window.addEventListener('mousemove', function(e) {
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;
        }, { passive: true });

        var particleCount = 38;
        var particles = [];
        for (var i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.35,
                speedY: (Math.random() - 0.5) * 0.35,
                depth: Math.random() * 0.7 + 0.3,
                baseAlpha: Math.random() * 0.35 + 0.15
            });
        }

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

            smoothVelocity += (scrollVelocity - smoothVelocity) * 0.1;
            scrollVelocity *= 0.88;

            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            var docHeight = Math.max(1, document.documentElement.scrollHeight - height);
            scrollProgress = Math.min(1, Math.max(0, (window.scrollY || 0) / docHeight));

            var velocityMagnitude = Math.min(Math.abs(smoothVelocity), 50);
            var timeSpeed = 0.008 + velocityMagnitude * 0.0008;
            time += timeSpeed;

            ctx.clearRect(0, 0, width, height);

            // 1. Ambient Chromatic Aurora Blobs (Reactive to scroll and mouse)
            ctx.save();
            ctx.globalCompositeOperation = isDark ? 'screen' : 'source-over';

            var blob1X = width * 0.3 + Math.sin(time * 0.6) * 120 + (mouseX - width * 0.5) * 0.1;
            var blob1Y = height * 0.35 + Math.cos(time * 0.5) * 80 + scrollProgress * 100;
            var blob1Radius = Math.max(width, height) * 0.45;
            var grad1 = ctx.createRadialGradient(blob1X, blob1Y, 0, blob1X, blob1Y, blob1Radius);
            if (isDark) {
                grad1.addColorStop(0, 'rgba(255, 82, 82, 0.15)');
                grad1.addColorStop(0.5, 'rgba(255, 82, 82, 0.03)');
                grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
            } else {
                grad1.addColorStop(0, 'rgba(240, 140, 100, 0.20)');
                grad1.addColorStop(0.6, 'rgba(255, 214, 201, 0.08)');
                grad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
            }
            ctx.fillStyle = grad1;
            ctx.beginPath();
            ctx.arc(blob1X, blob1Y, blob1Radius, 0, Math.PI * 2);
            ctx.fill();

            var blob2X = width * 0.75 + Math.cos(time * 0.4) * 100 + (mouseX - width * 0.5) * 0.08;
            var blob2Y = height * 0.65 + Math.sin(time * 0.7) * 90 - scrollProgress * 120;
            var blob2Radius = Math.max(width, height) * 0.42;
            var grad2 = ctx.createRadialGradient(blob2X, blob2Y, 0, blob2X, blob2Y, blob2Radius);
            if (isDark) {
                grad2.addColorStop(0, 'rgba(168, 85, 247, 0.11)');
                grad2.addColorStop(0.5, 'rgba(120, 60, 200, 0.025)');
                grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
            } else {
                grad2.addColorStop(0, 'rgba(255, 175, 130, 0.22)');
                grad2.addColorStop(0.6, 'rgba(255, 236, 217, 0.10)');
                grad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
            }
            ctx.fillStyle = grad2;
            ctx.beginPath();
            ctx.arc(blob2X, blob2Y, blob2Radius, 0, Math.PI * 2);
            ctx.fill();

            var blob3X = mouseX;
            var blob3Y = mouseY;
            var blob3Radius = Math.min(width, height) * 0.35;
            var grad3 = ctx.createRadialGradient(blob3X, blob3Y, 0, blob3X, blob3Y, blob3Radius);
            if (isDark) {
                grad3.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
                grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');
            } else {
                grad3.addColorStop(0, 'rgba(255, 255, 255, 0.26)');
                grad3.addColorStop(1, 'rgba(255, 255, 255, 0)');
            }
            ctx.fillStyle = grad3;
            ctx.beginPath();
            ctx.arc(blob3X, blob3Y, blob3Radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 2. Harmonic Audio Waveform Ribbons (Kinetic resonance reacting to scroll)
            var waves = [
                {
                    baseY: height * 0.48,
                    freq: 0.0022,
                    amp: 45,
                    speed: 1.1,
                    scrollMultiplier: 0.0035,
                    colorDark: 'rgba(255, 82, 82, 0.42)',
                    colorLight: 'rgba(152, 73, 39, 0.32)',
                    fillDark: 'rgba(255, 82, 82, 0.03)',
                    fillLight: 'rgba(152, 73, 39, 0.035)'
                },
                {
                    baseY: height * 0.54,
                    freq: 0.0032,
                    amp: 35,
                    speed: -0.9,
                    scrollMultiplier: -0.0025,
                    colorDark: 'rgba(255, 255, 255, 0.38)',
                    colorLight: 'rgba(180, 90, 50, 0.28)',
                    fillDark: 'rgba(255, 255, 255, 0.02)',
                    fillLight: 'rgba(180, 90, 50, 0.025)'
                },
                {
                    baseY: height * 0.60,
                    freq: 0.0018,
                    amp: 55,
                    speed: 1.3,
                    scrollMultiplier: 0.0045,
                    colorDark: 'rgba(244, 63, 94, 0.38)',
                    colorLight: 'rgba(215, 120, 75, 0.26)',
                    fillDark: 'rgba(244, 63, 94, 0.025)',
                    fillLight: 'rgba(215, 120, 75, 0.03)'
                }
            ];

            var velocitySurge = 1 + Math.min(Math.abs(smoothVelocity) * 0.04, 2.2);

            waves.forEach(function(w) {
                ctx.save();
                ctx.beginPath();

                var curY = window.scrollY || 0;
                var phase = time * w.speed + curY * w.scrollMultiplier;
                var step = Math.max(12, Math.floor(width / 70));

                ctx.moveTo(0, height);
                for (var x = 0; x <= width + step; x += step) {
                    var h1 = Math.sin(x * w.freq + phase) * w.amp;
                    var h2 = Math.cos(x * w.freq * 1.8 - phase * 0.8) * (w.amp * 0.35);
                    var h3 = Math.sin(x * 0.0008 + time * 0.5) * (w.amp * 0.25);

                    var distToMouse = Math.abs(x - mouseX);
                    var mouseInfluence = Math.max(0, 1 - distToMouse / (width * 0.4)) * 25;

                    var y = w.baseY + (h1 + h2 + h3) * velocitySurge + Math.sin(time + x * 0.001) * 8 + (mouseY - height * 0.5) * 0.06 - mouseInfluence;

                    if (x === 0) {
                        ctx.lineTo(0, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.strokeStyle = isDark ? w.colorDark : w.colorLight;
                ctx.lineWidth = 1.8;
                ctx.stroke();

                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();
                ctx.fillStyle = isDark ? w.fillDark : w.fillLight;
                ctx.fill();
                ctx.restore();
            });

            // 3. Floating Sound Particles & Constellation Network
            ctx.save();
            var scrollDelta = smoothVelocity * 0.6;
            for (var pIdx = 0; pIdx < particles.length; pIdx++) {
                var p = particles[pIdx];
                p.x += p.speedX;
                p.y += p.speedY - scrollDelta * p.depth * 0.15;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * p.depth, 0, Math.PI * 2);
                ctx.fillStyle = isDark
                    ? 'rgba(255, 255, 255, ' + (p.baseAlpha * 0.7) + ')'
                    : 'rgba(152, 73, 39, ' + (p.baseAlpha * 0.5) + ')';
                ctx.fill();

                for (var j = pIdx + 1; j < particles.length; j++) {
                    var p2 = particles[j];
                    var dx = p.x - p2.x;
                    var dy = p.y - p2.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    var maxDist = 95;
                    if (dist < maxDist) {
                        var lineAlpha = (1 - dist / maxDist) * (isDark ? 0.08 : 0.06);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = isDark
                            ? 'rgba(255, 255, 255, ' + lineAlpha + ')'
                            : 'rgba(152, 73, 39, ' + lineAlpha + ')';
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
            ctx.restore();

            requestAnimationFrame(render);
        }

        render();
    }

    initReactiveBackground();
});
