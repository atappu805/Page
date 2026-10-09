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

    // 2. Interactive Legal Tabs & Hash Routing
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

    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.dataset.target;
            switchTab(target);
            history.replaceState(null, null, '#' + target);
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

    // 3. Screenshot Lightbox Modal with Gallery Navigation
    const lightbox = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const galleryCards = Array.from(document.querySelectorAll('.device-card[data-gallery]'));

    let currentGalleryIndex = 0;

    function updateLightbox(index) {
        if (!galleryCards.length) return;
        currentGalleryIndex = (index + galleryCards.length) % galleryCards.length;
        const card = galleryCards[currentGalleryIndex];
        const img = card.querySelector('img');
        const caption = card.querySelector('.device-caption');

        if (img && lightboxImg) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt || '';
            lightboxImg.classList.remove('zoomed');
        }
        if (lightboxCaption) {
            lightboxCaption.textContent = caption ? caption.textContent.trim() : (img ? img.alt : '');
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
        if (lightboxImg) lightboxImg.classList.remove('zoomed');
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
                updateLightbox(currentGalleryIndex - 1);
            });
        }
        if (lightboxNext) {
            lightboxNext.addEventListener('click', (e) => {
                e.stopPropagation();
                updateLightbox(currentGalleryIndex + 1);
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
                updateLightbox(currentGalleryIndex - 1);
            } else if (e.key === 'ArrowRight') {
                updateLightbox(currentGalleryIndex + 1);
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
});
