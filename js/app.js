/**
 * ==========================================================================
 * KRISHNA SAGA - MAIN APPLICATION SCRIPT (Milestone 1)
 * Clean, modular Vanilla JavaScript for interactivity and celestial ambiance.
 * ==========================================================================
 */

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initCosmicParticles();
  initGitaExplorer();
  initPortalModals();
  initAttributionModal();
});

/* ==========================================================================
   1. Header Scroll Effect
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
}

/* ==========================================================================
   2. Cosmic Gold Dust & Particle Background Canvas
   A lightweight, tranquil ambient particle animation.
   ========================================================================== */
function initCosmicParticles() {
  const canvas = document.getElementById('cosmic-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 25), 45);

  class GoldParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2 + 0.8;
      this.speedY = Math.random() * 0.4 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.fadeSpeed = Math.random() * 0.005 + 0.002;
      this.fadingIn = true;
      const colors = ['#ffd54f', '#f5a623', '#ffe082', '#ffab91', '#ffffff'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;

      if (this.fadingIn) {
        this.opacity += this.fadeSpeed;
        if (this.opacity >= 0.75) this.fadingIn = false;
      } else {
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0.1) this.fadingIn = true;
      }

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new GoldParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/* ==========================================================================
   3. Bhagavad Gita Explorer & Interactive Verse Reader (Milestone 2)
   Client-side JSON data fetching, view routing, chapter selector, and verse navigation.
   ========================================================================== */
function initGitaExplorer() {
  // Main View Containers
  const landingView = document.getElementById('landing-view');
  const gitaView = document.getElementById('gita-view');
  const chaptersView = document.getElementById('gita-chapters-view');
  const readerView = document.getElementById('gita-reader-view');
  const completionView = document.getElementById('gita-completion-view');
  const chaptersGrid = document.getElementById('gita-chapters-grid');

  // Navigation Buttons
  const backToHomeBtn = document.getElementById('gita-back-to-home-btn');
  const readerBackToChaptersBtn = document.getElementById('reader-back-to-chapters-btn');
  const readerBackToHomeBtn = document.getElementById('reader-back-to-home-btn');
  const brandLogoLink = document.getElementById('brand-logo-link');
  const gitaCard = document.getElementById('card-gita');
  const footerGitaLink = document.getElementById('footer-gita-link');

  // Verse Reader Elements
  const prevVerseBtn = document.getElementById('prev-verse-btn');
  const nextVerseBtn = document.getElementById('next-verse-btn');
  const verseNumberTabs = document.getElementById('verse-number-tabs');
  const verseQuickSelect = document.getElementById('verse-quick-select');
  const translitToggleBtn = document.getElementById('translit-toggle-btn');
  const translitBtnLabel = document.getElementById('translit-btn-label');
  const translitContainer = document.getElementById('verse-translit-container');
  const copyVerseBtn = document.getElementById('copy-verse-btn');

  // Completion View Buttons
  const completionNextBtn = document.getElementById('completion-next-ch-btn');
  const completionAllChBtn = document.getElementById('completion-all-ch-btn');
  const completionHomeBtn = document.getElementById('completion-home-btn');

  // Verse Card Displays
  const verseIdBadge = document.getElementById('verse-id-badge');
  const verseNumberLabel = document.getElementById('verse-number-label');
  const verseSanskritText = document.getElementById('verse-sanskrit-text');
  const verseTranslitText = document.getElementById('verse-translit-text');
  const verseTranslationText = document.getElementById('verse-translation-text');
  const verseMeaningText = document.getElementById('verse-meaning-text');

  // State Management
  let chaptersData = [];
  let chapter1Data = null;
  let currentChapter = 1;
  let currentVerseIndex = 0;
  let isTranslitVisible = true;
  let activeView = 'landing'; // 'landing' | 'chapters' | 'reader' | 'completion'

  // --- View Switching ---
  function showLandingView() {
    activeView = 'landing';
    if (landingView) landingView.style.display = 'block';
    if (gitaView) gitaView.style.display = 'none';
    if (completionView) completionView.style.display = 'none';
    if (window.location.hash.startsWith('#gita')) {
      history.pushState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showGitaChaptersView() {
    activeView = 'chapters';
    if (landingView) landingView.style.display = 'none';
    if (gitaView) gitaView.style.display = 'block';
    if (chaptersView) chaptersView.style.display = 'block';
    if (readerView) readerView.style.display = 'none';
    if (completionView) completionView.style.display = 'none';

    history.pushState(null, '', '#gita');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (chaptersData.length === 0) {
      loadChaptersData();
    }
  }

  function showVerseReaderView(chapterNum = 1, verseNum = 1) {
    activeView = 'reader';
    currentChapter = chapterNum;
    currentVerseIndex = Math.max(0, verseNum - 1);

    if (landingView) landingView.style.display = 'none';
    if (gitaView) gitaView.style.display = 'block';
    if (chaptersView) chaptersView.style.display = 'none';
    if (readerView) readerView.style.display = 'block';
    if (completionView) completionView.style.display = 'none';

    history.pushState(null, '', `#gita/chapter-${chapterNum}/verse-${verseNum}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!chapter1Data) {
      loadChapterVerses(chapterNum);
    } else {
      renderCurrentVerse();
    }
  }

  function showCompletionView(chapterNum = 1) {
    activeView = 'completion';
    currentChapter = chapterNum;

    if (landingView) landingView.style.display = 'none';
    if (gitaView) gitaView.style.display = 'block';
    if (chaptersView) chaptersView.style.display = 'none';
    if (readerView) readerView.style.display = 'none';
    if (completionView) completionView.style.display = 'block';

    history.pushState(null, '', `#gita/chapter-${chapterNum}/completed`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Data Fetching ---
  async function loadChaptersData() {
    try {
      const response = await fetch('data/gita-chapters.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      chaptersData = await response.json();
      renderChaptersGrid(chaptersData);
    } catch (err) {
      console.error('Failed to load Gita chapters:', err);
      if (chaptersGrid) {
        chaptersGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #ff8f00;">
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">✦ Unable to load chapter data ✦</p>
            <p style="color: var(--text-secondary);">Please ensure data/gita-chapters.json is available.</p>
          </div>
        `;
      }
    }
  }

  async function loadChapterVerses(chapterNum) {
    try {
      const response = await fetch(`data/verses/chapter-${chapterNum}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      chapter1Data = await response.json();
      renderVerseTabs();
      renderCurrentVerse();
    } catch (err) {
      console.error(`Failed to load Chapter ${chapterNum} verses:`, err);
    }
  }

  // --- Rendering Chapters Grid ---
  function renderChaptersGrid(chapters) {
    if (!chaptersGrid) return;
    chaptersGrid.innerHTML = '';

    chapters.forEach(ch => {
      const card = document.createElement('article');
      card.className = `gita-chapter-card ${ch.status === 'available' ? 'chapter-card-available' : 'chapter-card-locked'}`;
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Chapter ${ch.chapter_number}: ${ch.name_transliteration}`);

      const statusBadge = ch.status === 'available'
        ? `<span class="chapter-status-pill status-active-pill">Available Now</span>`
        : `<span class="chapter-status-pill status-locked-pill">Milestone 2+</span>`;

      const ctaLabel = ch.status === 'available'
        ? `<span class="chapter-cta-link"><span>Begin Reading</span> <span>→</span></span>`
        : `<span style="font-size: 0.82rem; color: var(--text-muted);">Coming Soon</span>`;

      card.innerHTML = `
        <div class="chapter-card-img-wrap">
          <img src="${ch.image_url}" alt="${ch.name_transliteration} Chariot Artwork" class="chapter-card-img" onerror="this.onerror=null; this.src='assets/images/krishna-and-arjuna.jpg';">
          <div class="chapter-card-overlay"></div>
          <span class="chapter-num-badge">Chapter ${ch.chapter_number}</span>
        </div>
        <div class="chapter-card-content">
          <div class="chapter-card-meta">
            ${statusBadge}
            <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 500;">${ch.verses_count} Verses</span>
          </div>
          <h3 class="chapter-sanskrit-title">${ch.name_sanskrit}</h3>
          <h4 class="chapter-eng-title">${ch.name_transliteration}</h4>
          <p class="chapter-theme-tag">${ch.theme}</p>
          <p class="chapter-summary-snippet">${ch.summary}</p>
          <div class="chapter-card-footer-cta">
            ${ctaLabel}
          </div>
        </div>
      `;

      if (ch.status === 'available') {
        card.addEventListener('click', () => showVerseReaderView(ch.chapter_number, 1));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showVerseReaderView(ch.chapter_number, 1);
          }
        });
      }

      chaptersGrid.appendChild(card);
    });
  }

  // --- Rendering Verse Tabs & Quick Dropdown (1 to 47) ---
  function renderVerseTabs() {
    if (!chapter1Data || !chapter1Data.verses) return;

    if (verseNumberTabs) {
      verseNumberTabs.innerHTML = '';
      chapter1Data.verses.forEach((v, index) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = `verse-tab-btn ${index === currentVerseIndex ? 'active' : ''}`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', index === currentVerseIndex ? 'true' : 'false');
        tab.setAttribute('aria-label', `Go to Verse ${v.verse_number}`);
        tab.textContent = v.verse_number;

        tab.addEventListener('click', () => {
          currentVerseIndex = index;
          renderCurrentVerse();
        });

        verseNumberTabs.appendChild(tab);
      });
    }

    if (verseQuickSelect) {
      verseQuickSelect.innerHTML = '';
      chapter1Data.verses.forEach((v, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = `Verse ${v.verse_number}`;
        verseQuickSelect.appendChild(opt);
      });
    }
  }

  // --- Rendering Current Verse ---
  function renderCurrentVerse() {
    if (!chapter1Data || !chapter1Data.verses || !chapter1Data.verses[currentVerseIndex]) return;

    const verse = chapter1Data.verses[currentVerseIndex];
    const totalVerses = chapter1Data.verses.length;

    // Update Header Meta
    if (verseIdBadge) verseIdBadge.textContent = `BG 1.${verse.verse_number}`;
    if (verseNumberLabel) verseNumberLabel.textContent = `श्लोक ${verse.verse_number} • Verse ${verse.verse_number} of ${chapter1Data.verses_count}`;

    // Format Sanskrit and Transliteration newlines
    if (verseSanskritText) {
      verseSanskritText.innerHTML = verse.text_sanskrit.replace(/\n/g, '<br>');
    }
    if (verseTranslitText) {
      verseTranslitText.innerHTML = verse.transliteration.replace(/\n/g, '<br>');
    }
    if (verseTranslationText) {
      verseTranslationText.textContent = `"${verse.translation}"`;
    }
    if (verseMeaningText) {
      verseMeaningText.textContent = verse.meaning;
    }

    // Update Nav Buttons
    if (prevVerseBtn) prevVerseBtn.disabled = (currentVerseIndex === 0);

    if (nextVerseBtn) {
      if (currentVerseIndex === totalVerses - 1) {
        // Last verse (Verse 47) leads to completion screen
        nextVerseBtn.disabled = false;
        nextVerseBtn.innerHTML = '<span class="btn-text">Complete Chapter</span> <span>✦</span>';
        nextVerseBtn.title = 'Complete Chapter 1 and View Dedication (॥ श्रीकृष्णार्पणमस्तु ॥)';
      } else {
        nextVerseBtn.disabled = false;
        nextVerseBtn.innerHTML = '<span class="btn-text">Next</span> <span>→</span>';
        nextVerseBtn.title = 'Next Verse (Right Arrow Key)';
      }
    }

    // Update Quick Dropdown
    if (verseQuickSelect) {
      verseQuickSelect.value = currentVerseIndex;
    }

    // Update Tabs and auto-scroll active into view
    if (verseNumberTabs) {
      const tabs = verseNumberTabs.querySelectorAll('.verse-tab-btn');
      tabs.forEach((tab, i) => {
        const isActive = (i === currentVerseIndex);
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive) {
          tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    }

    // Update Hash without reload
    history.replaceState(null, '', `#gita/chapter-${currentChapter}/verse-${verse.verse_number}`);
  }

  // --- Event Listeners ---
  if (gitaCard) {
    gitaCard.addEventListener('click', (e) => {
      e.preventDefault();
      showGitaChaptersView();
    });
    gitaCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showGitaChaptersView();
      }
    });
  }

  if (footerGitaLink) {
    footerGitaLink.addEventListener('click', (e) => {
      e.preventDefault();
      showGitaChaptersView();
    });
  }

  if (backToHomeBtn) backToHomeBtn.addEventListener('click', showLandingView);
  if (readerBackToHomeBtn) readerBackToHomeBtn.addEventListener('click', showLandingView);
  if (readerBackToChaptersBtn) readerBackToChaptersBtn.addEventListener('click', showGitaChaptersView);
  if (brandLogoLink) {
    brandLogoLink.addEventListener('click', (e) => {
      e.preventDefault();
      showLandingView();
    });
  }

  // Completion View Action Buttons
  if (completionNextBtn) {
    completionNextBtn.addEventListener('click', () => {
      alert('Chapter 2 (साङ्ख्ययोग - Sāṅkhya Yoga) will be available in the upcoming release!');
    });
  }
  if (completionAllChBtn) completionAllChBtn.addEventListener('click', showGitaChaptersView);
  if (completionHomeBtn) completionHomeBtn.addEventListener('click', showLandingView);

  // Quick Dropdown Jump
  if (verseQuickSelect) {
    verseQuickSelect.addEventListener('change', (e) => {
      currentVerseIndex = parseInt(e.target.value, 10) || 0;
      renderCurrentVerse();
    });
  }

  // Prev / Next Buttons
  if (prevVerseBtn) {
    prevVerseBtn.addEventListener('click', () => {
      if (currentVerseIndex > 0) {
        currentVerseIndex--;
        renderCurrentVerse();
      }
    });
  }

  if (nextVerseBtn) {
    nextVerseBtn.addEventListener('click', () => {
      if (chapter1Data) {
        if (currentVerseIndex < chapter1Data.verses.length - 1) {
          currentVerseIndex++;
          renderCurrentVerse();
        } else {
          showCompletionView(currentChapter);
        }
      }
    });
  }

  // Transliteration Toggle
  if (translitToggleBtn && translitContainer) {
    translitToggleBtn.addEventListener('click', () => {
      isTranslitVisible = !isTranslitVisible;
      translitContainer.style.display = isTranslitVisible ? 'block' : 'none';
      translitToggleBtn.setAttribute('aria-pressed', isTranslitVisible ? 'true' : 'false');
      if (translitBtnLabel) {
        translitBtnLabel.textContent = `Transliteration: ${isTranslitVisible ? 'ON' : 'OFF'}`;
      }
    });
  }

  // Copy Shloka Button
  if (copyVerseBtn) {
    copyVerseBtn.addEventListener('click', () => {
      if (!chapter1Data || !chapter1Data.verses[currentVerseIndex]) return;
      const v = chapter1Data.verses[currentVerseIndex];
      const copyText = `श्रीमद्भगवद्गीता • Bhagavad Gita 1.${v.verse_number}\n\n${v.text_sanskrit}\n\n${v.transliteration}\n\nTranslation:\n"${v.translation}"\n\nMeaning:\n${v.meaning}\n\n— Via Krishna Saga`;

      navigator.clipboard.writeText(copyText).then(() => {
        const originalText = copyVerseBtn.innerHTML;
        copyVerseBtn.innerHTML = `<span>✓ Shloka Copied!</span>`;
        setTimeout(() => {
          copyVerseBtn.innerHTML = originalText;
        }, 2000);
      }).catch(err => {
        console.warn('Clipboard copy notice:', err);
      });
    });
  }

  // Keyboard Shortcuts (Arrow Left / Arrow Right)
  window.addEventListener('keydown', (e) => {
    if (activeView !== 'reader') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    if (e.key === 'ArrowLeft') {
      if (currentVerseIndex > 0) {
        currentVerseIndex--;
        renderCurrentVerse();
      }
    } else if (e.key === 'ArrowRight') {
      if (chapter1Data) {
        if (currentVerseIndex < chapter1Data.verses.length - 1) {
          currentVerseIndex++;
          renderCurrentVerse();
        } else {
          showCompletionView(currentChapter);
        }
      }
    }
  });

  // Handle URL Hash on Initial Page Load & Browser Back/Forward
  function handleHashNavigation() {
    const hash = window.location.hash;
    if (hash.endsWith('/completed')) {
      const match = hash.match(/#gita\/chapter-(\d+)\/completed/);
      const ch = match ? parseInt(match[1], 10) : 1;
      showCompletionView(ch);
    } else if (hash.startsWith('#gita/chapter-')) {
      const match = hash.match(/#gita\/chapter-(\d+)(?:\/verse-(\d+))?/);
      if (match) {
        const ch = parseInt(match[1], 10);
        const v = match[2] ? parseInt(match[2], 10) : 1;
        showVerseReaderView(ch, v);
      } else {
        showGitaChaptersView();
      }
    } else if (hash === '#gita') {
      showGitaChaptersView();
    } else {
      showLandingView();
    }
  }

  window.addEventListener('popstate', handleHashNavigation);
  handleHashNavigation();
}

/* ==========================================================================
   4. Portal Preview Modals
   Interactive previews for the 2 upcoming milestone sections (Udupi & Puja).
   ========================================================================== */
function initPortalModals() {
  const modal = document.getElementById('portal-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const actionBtn = document.getElementById('modal-primary-action');
  const modalTitle = document.getElementById('modal-title');
  const modalSanskrit = document.getElementById('modal-sanskrit');
  const modalDesc = document.getElementById('modal-desc');
  const modalIconImg = document.getElementById('modal-icon-img');
  const modalBoxIcon = document.getElementById('modal-box-icon');
  const modalBoxText = document.getElementById('modal-box-text');

  if (!modal) return;

  const portalData = {
    udupi: {
      title: 'Udupi Sri Krishna & Madhvacharya',
      sanskrit: 'उडुपी श्रीकृष्ण मठा • Coastal Sanctuary of Bhakti',
      icon: 'assets/icons/lotus.svg',
      desc: 'Discover the 800-year history of the Udupi Sri Krishna Matha, the miracle of Kanakana Kindi (the window of devotion for Kanakadasa), the Ashta Mathas, and the philosophical teachings of Sri Madhvacharya.',
      milestone: 'Planned for Milestone 3: Temple Heritage & Philosophy Timeline',
      boxIcon: '🛕'
    },
    puja: {
      title: 'Interactive Virtual Puja Sanctuary',
      sanskrit: 'मानसिक पूजा • The Sacred Inner Offering',
      icon: 'assets/icons/diya.svg',
      desc: 'Step into an interactive devotional altar where you can light a brass diya lamp, offer fragrant flowers (pushpa), ring the sacred temple bell with authentic sound, and perform aarti in peaceful meditation.',
      milestone: 'Planned for Milestone 4: Interactive Virtual Puja & Ritual Sanctuary',
      boxIcon: '🪔'
    },
    about: {
      title: 'About Krishna Saga',
      sanskrit: 'विद्या ददाति विनयं • Knowledge & Devotion',
      icon: 'assets/icons/flute-peacock.svg',
      desc: 'Krishna Saga is an educational and spiritual web sanctuary designed to bring the sacred philosophy, history, and meditative rituals of Sri Krishna to seekers and learners worldwide.',
      milestone: 'Milestones 1 & 2 Live: Portal Foundation & Bhagavad Gita Chapter 1 Explorer',
      boxIcon: '✨'
    }
  };

  function openModal(portalKey) {
    const data = portalData[portalKey] || portalData.about;
    modalTitle.textContent = data.title;
    modalSanskrit.textContent = data.sanskrit;
    modalDesc.textContent = data.desc;
    modalIconImg.src = data.icon;
    modalBoxIcon.textContent = data.boxIcon;
    modalBoxText.textContent = data.milestone;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Connect portal cards (only non-gita cards)
  const cards = document.querySelectorAll('.portal-card:not(#card-gita)');
  cards.forEach(card => {
    const portal = card.getAttribute('data-portal');
    card.addEventListener('click', () => openModal(portal));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(portal);
      }
    });
  });

  const aboutBtn = document.getElementById('open-about-btn');
  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => openModal('about'));
  }

  document.getElementById('footer-udupi-link')?.addEventListener('click', () => openModal('udupi'));
  document.getElementById('footer-puja-link')?.addEventListener('click', () => openModal('puja'));

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (actionBtn) actionBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   5. Attribution & Heritage Modal
   ========================================================================== */
function initAttributionModal() {
  const modal = document.getElementById('attribution-modal');
  const closeBtn = document.getElementById('attr-close-btn');
  const actionBtn = document.getElementById('attr-primary-action');
  const heroAttrBtn = document.getElementById('hero-attr-btn');
  const footerAttrLink = document.getElementById('footer-attr-link');

  if (!modal) return;

  function openAttrModal() {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeAttrModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (heroAttrBtn) heroAttrBtn.addEventListener('click', openAttrModal);
  if (footerAttrLink) footerAttrLink.addEventListener('click', openAttrModal);
  if (closeBtn) closeBtn.addEventListener('click', closeAttrModal);
  if (actionBtn) actionBtn.addEventListener('click', closeAttrModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAttrModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeAttrModal();
    }
  });
}

