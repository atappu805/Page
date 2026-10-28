document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (e) => {
            if (mobileNav.classList.contains('open') && !mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
                mobileNav.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                mobileNav.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 2. Interactive Legal Tabs (Clean URL)
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

    const initialHash = window.location.hash.replace('#', '');
    if (['ytm-policy', 'privacy', 'terms'].includes(initialHash)) {
        switchTab(initialHash);
        const legalSection = document.getElementById('legal');
        if (legalSection) {
            legalSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    cleanUrlHash();

    // 3. Live GitHub Releases Loader
    const relVersion = document.getElementById('relVersion');
    const relMeta = document.getElementById('relMeta');
    const relPrimary = document.getElementById('relPrimary');
    const relAssets = document.getElementById('relAssets');
    const relNotes = document.getElementById('relNotes');
    const relNotesList = document.getElementById('relNotesList');
    const relChangelog = document.getElementById('relChangelog');
    const trustRelease = document.getElementById('trustRelease');
    const trustReleaseMeta = document.getElementById('trustReleaseMeta');
    const trustReleaseBtn = document.getElementById('trustReleaseBtn');

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

            relVersion.textContent = releaseTitle;

            const apkAsset = assets.find(a => a.name && a.name.toLowerCase().endsWith('.apk')) || assets[0];

            const metaParts = [];
            if (publishedDate) metaParts.push('Released on ' + publishedDate);
            if (tagName && releaseTitle !== tagName) metaParts.push(tagName);
            if (apkAsset && apkAsset.size) metaParts.push(formatBytes(apkAsset.size));
            if (relMeta) {
                relMeta.textContent = metaParts.join(' · ');
            }

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

            if (relChangelog) {
                relChangelog.href = htmlUrl;
            }

            if (trustReleaseMeta) {
                trustReleaseMeta.textContent = (tagName ? tagName + ' · ' : '') + 'Verified build' + (publishedDate ? ' (' + publishedDate + ').' : '.');
            }
            if (trustReleaseBtn) {
                trustReleaseBtn.href = htmlUrl;
                if (tagName) trustReleaseBtn.textContent = 'View ' + tagName;
            } else if (trustRelease) {
                trustRelease.innerHTML = '<a href="' + htmlUrl + '" target="_blank" rel="noopener">' + escapeHtml(tagName || releaseTitle) + (publishedDate ? ' (' + publishedDate + ')' : '') + '</a>';
            }

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

    // 4. Scroll-Triggered Reveal System (Excludes horizontal carousel items so they never hide)
    function initScrollReveal() {
        if (!('IntersectionObserver' in window)) return;

        var selectors = [
            '.hero',
            '.hero-visual',
            '.showcase-container',
            '.section-header',
            '.feature-card',
            '.download-card',
            '.trust-item',
            '.faq details',
            '.support-card',
            '.contact-compact-card',
            '.legal-tab-nav',
            '.legal-card'
        ];

        var targets = document.querySelectorAll(selectors.join(', '));
        if (!targets.length) return;

        targets.forEach(function(el) {
            el.classList.add('reveal-item');
        });

        document.documentElement.classList.add('reveal-ready');

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -15px 0px',
            threshold: 0.05
        });

        targets.forEach(function(el) {
            observer.observe(el);
        });
    }

    initScrollReveal();

    // ==========================================================
    // 5. Material You Frameless Carousel & Bounded Shape Motion
    // ==========================================================
    function initMaterialYouCarousel() {
        const viewport = document.getElementById('carouselViewport');
        const track = document.getElementById('carouselTrack');
        const prevBtn = document.getElementById('carouselPrevBtn');
        const nextBtn = document.getElementById('carouselNextBtn');
        const filterChips = document.querySelectorAll('.m3-filter-chip');
        const dotsContainer = document.getElementById('carouselDots');
        const counterText = document.getElementById('carouselCounterText');
        const currentTitle = document.getElementById('carouselCurrentTitle');
        const showcaseShapes = document.querySelectorAll('.m3-carousel-bg-shapes .m3-reactive-shape');

        if (!viewport || !track) return;

        const allCards = Array.from(track.querySelectorAll('.m3-carousel-item'));
        let visibleCards = [...allCards];
        let activeIndex = 0;

        function renderDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            visibleCards.forEach((card, i) => {
                const dot = document.createElement('button');
                dot.className = 'm3-dot' + (i === activeIndex ? ' active' : '');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', 'Screen ' + (i + 1) + ' of ' + visibleCards.length + ': ' + (card.dataset.title || 'Screenshot'));
                dot.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
                dot.addEventListener('click', () => {
                    scrollToCardIndex(i);
                });
                dotsContainer.appendChild(dot);
            });
        }

        function scrollToCardIndex(index) {
            if (index < 0) index = 0;
            if (index >= visibleCards.length) index = visibleCards.length - 1;
            const targetCard = visibleCards[index];
            if (!targetCard) return;

            const cardLeft = targetCard.offsetLeft;
            const cardWidth = targetCard.offsetWidth;
            const viewportWidth = viewport.offsetWidth;
            const targetScroll = cardLeft - (viewportWidth - cardWidth) / 2;

            viewport.scrollTo({
                left: Math.max(0, targetScroll),
                behavior: 'smooth'
            });
        }

        function updateActiveCard() {
            const viewportCenter = viewport.scrollLeft + viewport.offsetWidth / 2;
            let closestIndex = 0;
            let minDistance = Infinity;

            visibleCards.forEach((card, i) => {
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const distance = Math.abs(viewportCenter - cardCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = i;
                }
            });

            activeIndex = closestIndex;

            allCards.forEach(c => c.classList.remove('is-active-card'));
            const currentCard = visibleCards[activeIndex];
            if (currentCard) {
                currentCard.classList.add('is-active-card');
                if (counterText) {
                    const numStr = (activeIndex + 1 < 10 ? '0' : '') + (activeIndex + 1);
                    const totalStr = (visibleCards.length < 10 ? '0' : '') + visibleCards.length;
                    counterText.textContent = numStr + ' / ' + totalStr;
                }
                if (currentTitle) {
                    currentTitle.textContent = currentCard.dataset.title || '';
                }
            }

            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.m3-dot');
                dots.forEach((dot, i) => {
                    const isActive = i === activeIndex;
                    dot.classList.toggle('active', isActive);
                    dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });
            }
        }

        // Category Filtering
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const filter = chip.dataset.filter || 'all';

                filterChips.forEach(c => {
                    const isActive = c === chip;
                    c.classList.toggle('active', isActive);
                    c.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });

                allCards.forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.classList.remove('filtered-out');
                    } else {
                        card.classList.add('filtered-out');
                    }
                });

                visibleCards = allCards.filter(c => !c.classList.contains('filtered-out'));
                activeIndex = 0;
                renderDots();
                viewport.scrollTo({ left: 0, behavior: 'smooth' });
                updateActiveCard();
            });
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                scrollToCardIndex(Math.max(0, activeIndex - 1));
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                scrollToCardIndex(Math.min(visibleCards.length - 1, activeIndex + 1));
            });
        }

        viewport.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollToCardIndex(Math.max(0, activeIndex - 1));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollToCardIndex(Math.min(visibleCards.length - 1, activeIndex + 1));
            }
        });

        // Mouse Drag to Scroll & Click to Center
        let isDown = false;
        let isDragging = false;
        let startX = 0;
        let scrollStart = 0;

        allCards.forEach((card) => {
            card.addEventListener('click', () => {
                if (isDragging) return;
                const idx = visibleCards.indexOf(card);
                if (idx !== -1) scrollToCardIndex(idx);
            });
        });

        viewport.addEventListener('mousedown', (e) => {
            isDown = true;
            isDragging = false;
            startX = e.pageX - viewport.offsetLeft;
            scrollStart = viewport.scrollLeft;
        });

        window.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                updateActiveCard();
            }
        });

        viewport.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - viewport.offsetLeft;
            const walk = (x - startX) * 1.4;
            if (Math.abs(walk) > 6) isDragging = true;
            viewport.scrollLeft = scrollStart - walk;
        });

        // Bounded Reactive Showcase Shapes: Normalized [0..1] progress so shapes stay in their corners
        let ticking = false;
        viewport.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const maxScroll = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
                    const progress = Math.max(0, Math.min(1, viewport.scrollLeft / maxScroll));

                    showcaseShapes.forEach(shape => {
                        const maxShiftX = parseFloat(shape.dataset.shiftX || '50');
                        const maxRot = parseFloat(shape.dataset.rot || '140');
                        const xOffset = (progress - 0.5) * 2 * maxShiftX;
                        const rotOffset = progress * maxRot;
                        shape.style.transform = 'translate3d(' + xOffset.toFixed(1) + 'px, 0, 0) rotate(' + rotOffset.toFixed(1) + 'deg)';
                    });

                    updateActiveCard();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        renderDots();
        updateActiveCard();
    }

    initMaterialYouCarousel();

    // ==========================================================
    // 6. Page-wide Reactive Shapes (Spinning on Scroll, Bounded Y)
    // ==========================================================
    function initPageReactiveShapes() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const pageShapes = document.querySelectorAll('.m3-section-bg-shapes .m3-reactive-shape, .organic-cluster .m3-reactive-shape');
        const sectionMarks = document.querySelectorAll('.section-shape-mark');
        const featureBadges = document.querySelectorAll('.feature-shape-badge > .m3-shape-svg');
        const chipIcons = document.querySelectorAll('.chip-shape-icon, .m3-filter-chip .chip-shape');
        const contactSection = document.getElementById('contact');
        const closingContainer = document.getElementById('closingOrganic');
        const closingTriangle = document.getElementById('closingTriangle');
        const closingCookie = document.getElementById('closingCookie');
        const closingStar = document.getElementById('closingStar');
        const menuMorphPath = document.getElementById('menuToggleMorphPath');
        const menuToggleSvg = document.querySelector('.menu-toggle-shape');

        const MORPH_SHAPES = [
            [89.0, 50.0, 89.0, 61.8, 89.1, 73.8, 81.5, 81.5, 73.8, 89.1, 61.8, 89.0, 50.0, 89.0, 38.2, 89.0, 26.2, 89.1, 18.5, 81.5, 10.9, 73.8, 11.0, 61.8, 11.0, 50.0, 11.0, 38.2, 10.9, 26.2, 18.5, 18.5, 26.2, 10.9, 38.2, 11.0, 50.0, 11.0, 61.8, 11.0, 73.8, 10.9, 81.5, 18.5, 89.1, 26.2, 89.0, 38.2, 89.0, 50.0],
            [94.2, 50.0, 94.2, 64.5, 91.5, 71.0, 81.3, 81.3, 71.0, 91.5, 64.5, 94.2, 50.0, 94.2, 35.5, 94.2, 29.0, 91.5, 18.7, 81.3, 8.5, 71.0, 5.8, 64.5, 5.8, 50.0, 5.8, 35.5, 8.5, 29.0, 18.7, 18.7, 29.0, 8.5, 35.5, 5.8, 50.0, 5.8, 64.5, 5.8, 71.0, 8.5, 81.3, 18.7, 91.5, 29.0, 94.2, 35.5, 94.2, 50.0],
            [95.0, 50.0, 95.0, 66.5, 69.4, 58.8, 64.1, 64.1, 58.8, 69.4, 66.5, 95.0, 50.0, 95.0, 33.5, 95.0, 41.2, 69.4, 35.9, 64.1, 30.6, 58.8, 5.0, 66.5, 5.0, 50.0, 5.0, 33.5, 30.6, 41.2, 35.9, 35.9, 41.2, 30.6, 33.5, 5.0, 50.0, 5.0, 66.5, 5.0, 58.8, 30.6, 64.1, 35.9, 69.4, 41.2, 95.0, 33.5, 95.0, 50.0],
            [92.0, 50.0, 92.0, 61.1, 87.5, 71.8, 79.7, 79.7, 71.8, 87.5, 61.1, 92.0, 50.0, 92.0, 38.9, 92.0, 28.2, 87.5, 20.3, 79.7, 12.5, 71.8, 8.0, 61.1, 8.0, 50.0, 8.0, 38.9, 12.5, 28.2, 20.3, 20.3, 28.2, 12.5, 38.9, 8.0, 50.0, 8.0, 61.1, 8.0, 71.8, 12.5, 79.7, 20.3, 87.5, 28.2, 92.0, 38.9, 92.0, 50.0]
        ];

        function getMorphSvgPath(coords) {
            let d = 'M ' + coords[0].toFixed(1) + ' ' + coords[1].toFixed(1);
            for (let i = 2; i < coords.length; i += 6) {
                d += ' C ' + coords[i].toFixed(1) + ' ' + coords[i+1].toFixed(1) + ', '
                           + coords[i+2].toFixed(1) + ' ' + coords[i+3].toFixed(1) + ', '
                           + coords[i+4].toFixed(1) + ' ' + coords[i+5].toFixed(1);
            }
            return d + ' Z';
        }

        let smoothScrollY = window.pageYOffset || window.scrollY || 0;
        let isTicking = false;

        function updateShapes() {
            const currentY = window.pageYOffset || window.scrollY || 0;
            smoothScrollY += (currentY - smoothScrollY) * 0.16;

            // Faster, energetic rotation for background shapes
            pageShapes.forEach(shape => {
                const pRot = parseFloat(shape.dataset.rot || '0.10') * 2.8;
                const pY = parseFloat(shape.dataset.parallaxY || '0.05');
                const rot = (smoothScrollY * pRot) % 360;
                const rawY = Math.sin(smoothScrollY * 0.003) * 24 * (pY >= 0 ? 1 : -1);
                shape.style.transform = 'translate3d(0, ' + rawY.toFixed(1) + 'px, 0) rotate(' + rot.toFixed(1) + 'deg)';
            });

            // Section marks: 5x faster rotation (0.68) with alternating directions
            sectionMarks.forEach((mark, idx) => {
                const dir = idx % 2 === 0 ? 1 : -1;
                const rot = (smoothScrollY * 0.68 * dir) % 360;
                mark.style.transform = 'rotate(' + rot.toFixed(1) + 'deg)';
            });

            // Feature shape badges: active fast spin (0.58) as user scrolls down/up
            featureBadges.forEach((badge, idx) => {
                const dir = idx % 2 === 0 ? 1 : -1;
                const rot = (smoothScrollY * 0.58 * dir) % 360;
                badge.style.transform = 'rotate(' + rot.toFixed(1) + 'deg)';
            });

            // Highlight chips & filter chips: lively spin on scroll
            chipIcons.forEach((chipIcon, idx) => {
                const dir = idx % 2 === 0 ? 1 : -1;
                const rot = (smoothScrollY * 0.52 * dir) % 360;
                chipIcon.style.transform = 'rotate(' + rot.toFixed(1) + 'deg)';
            });

            // Floating Pill Menu Toggle: Material You shape morphing & gentle rotation on scroll
            if (menuMorphPath) {
                const docHeight = Math.max(
                    document.body.scrollHeight || 0,
                    document.documentElement.scrollHeight || 0
                );
                const vh = window.innerHeight || 800;
                const maxScroll = Math.max(1, docHeight - vh);
                const scrollProgress = Math.min(1, Math.max(0, smoothScrollY / maxScroll));

                const scaled = scrollProgress * (MORPH_SHAPES.length - 1);
                const idxA = Math.floor(scaled);
                const idxB = Math.min(MORPH_SHAPES.length - 1, idxA + 1);
                const blend = scaled - idxA;

                const shapeA = MORPH_SHAPES[idxA];
                const shapeB = MORPH_SHAPES[idxB];
                const currentCoords = [];
                for (let i = 0; i < shapeA.length; i++) {
                    currentCoords.push(shapeA[i] + (shapeB[i] - shapeA[i]) * blend);
                }

                menuMorphPath.setAttribute('d', getMorphSvgPath(currentCoords));

                if (menuToggleSvg) {
                    const btnRot = (smoothScrollY * 0.45) % 360;
                    menuToggleSvg.style.transform = 'rotate(' + btnRot.toFixed(1) + 'deg)';
                }
            }

            // Closing 3 Shapes Choreography: (Triangle, Cookie, Star)
            // Cookie starts large in the background at Contact area, spins & shrinks/grows on scroll down/up,
            // and docks at its small position at the bottom while Triangle and Star rise up from down below.
            if (contactSection && closingContainer && closingCookie && closingTriangle && closingStar) {
                const vh = window.innerHeight || 800;
                const vw = window.innerWidth || 400;
                const docHeight = Math.max(
                    document.body.scrollHeight || 0,
                    document.documentElement.scrollHeight || 0
                );
                const maxScroll = Math.max(1, docHeight - vh);

                const contactTop = contactSection.offsetTop;
                const closingTop = closingContainer.offsetTop;
                const closingHeight = closingContainer.offsetHeight || 90;

                // Vertical distance from closing slot up to the center of Contact section
                const contactCenterDoc = contactTop + (contactSection.offsetHeight || 380) * 0.42;
                const closingCenterDoc = closingTop + closingHeight * 0.5;
                const travelDistanceY = Math.max(300, closingCenterDoc - contactCenterDoc);

                // Scroll window: starts as Contact enters view, reaches 1.0 as user reaches bottom
                const startScroll = Math.max(0, contactTop - vh * 0.70);
                const endScroll = Math.max(
                    startScroll + 220,
                    Math.min(maxScroll - 16, (closingTop + closingHeight * 0.5) - vh * 0.68)
                );

                const rawT = (smoothScrollY - startScroll) / Math.max(1, endScroll - startScroll);
                const t = Math.max(0, Math.min(1, rawT));

                // 1. Center Cookie: significantly larger in background at Contact (t=0), spins & shrinks down to small slot (t=1)
                const maxScale = vw < 700 ? 13.2 : 16.5;
                const cookieScale = 1 + (1 - t) * (maxScale - 1);
                const cookieY = -(1 - t) * travelDistanceY;
                const cookieRot = (1 - t) * 540;
                // Soft background opacity while behind Contact/Policies cards, solid 1.0 when docked at bottom
                const cookieOpacity = t < 0.72
                    ? (0.16 + (t / 0.72) * 0.22)
                    : (0.38 + ((t - 0.72) / 0.28) * 0.62);

                closingCookie.style.transform =
                    'translate3d(0, ' + cookieY.toFixed(1) + 'px, 0) scale(' + cookieScale.toFixed(3) + ') rotate(' + cookieRot.toFixed(1) + 'deg)';
                closingCookie.style.opacity = cookieOpacity.toFixed(3);

                // 2. Left Triangle & Right Star: rise up from down below as Cookie docks near the bottom
                const u = Math.max(0, Math.min(1, (t - 0.42) / 0.58));
                const easeU = 1 - Math.pow(1 - u, 3);

                const triY = (1 - easeU) * 145;
                const triX = -(1 - easeU) * 24;
                const triScale = 0.42 + 0.58 * easeU;
                const triRot = -6 - (1 - easeU) * 135;

                closingTriangle.style.transform =
                    'translate3d(' + triX.toFixed(1) + 'px, ' + triY.toFixed(1) + 'px, 0) scale(' + triScale.toFixed(3) + ') rotate(' + triRot.toFixed(1) + 'deg)';
                closingTriangle.style.opacity = easeU.toFixed(3);

                const starY = (1 - easeU) * 160;
                const starX = (1 - easeU) * 24;
                const starScale = 0.42 + 0.58 * easeU;
                const starRot = 8 + (1 - easeU) * 150;

                closingStar.style.transform =
                    'translate3d(' + starX.toFixed(1) + 'px, ' + starY.toFixed(1) + 'px, 0) scale(' + starScale.toFixed(3) + ') rotate(' + starRot.toFixed(1) + 'deg)';
                closingStar.style.opacity = easeU.toFixed(3);
            }

            if (Math.abs(currentY - smoothScrollY) > 0.4) {
                requestAnimationFrame(updateShapes);
            } else {
                isTicking = false;
            }
        }

        function requestShapeUpdate() {
            if (!isTicking) {
                isTicking = true;
                requestAnimationFrame(updateShapes);
            }
        }

        window.addEventListener('scroll', requestShapeUpdate, { passive: true });
        window.addEventListener('resize', requestShapeUpdate, { passive: true });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => setTimeout(requestShapeUpdate, 50));
        });

        updateShapes();
    }

    initPageReactiveShapes();

    // Universal Material You Shape Morphing on Button Taps
    function initButtonShapeMorph() {
        const btnSelector = '.btn, .trust-btn, .contact-chip, .tab-btn, .m3-filter-chip, .support-card, .m3-carousel-fab, .asset-name';

        document.addEventListener('pointerdown', (e) => {
            const targetBtn = e.target.closest(btnSelector);
            if (!targetBtn) return;

            targetBtn.classList.remove('shape-morph-tap');
            void targetBtn.offsetWidth;
            targetBtn.classList.add('shape-morph-tap');

            setTimeout(() => {
                targetBtn.classList.remove('shape-morph-tap');
            }, 470);
        }, { passive: true });
    }

    initButtonShapeMorph();
});
