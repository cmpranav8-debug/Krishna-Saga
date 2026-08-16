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
  initHeroSlideshow();
  initPortalModals();
  initAttributionModal();
  initVirtualPooja();
  initGitaExplorer();
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
   2.1. Hero Automated Sacred Darshana Slideshow
   Pure hands-off slideshow with smooth crossfade transitions (~1.3s ease-in-out),
   caching/preloading, smart auto-play pausing on scroll or view switch.
   ========================================================================== */
function initHeroSlideshow() {
  const HERO_SLIDES = [
    {
      src: 'assets/images/Slideshow images/udupi-krishna-hero.jpg',
      alt: 'Sri Krishna — Authentic Darshana of the sacred idol at Udupi Sri Krishna Matha',
      title: 'Sri Krishna Darshana',
      subtitle: 'Udupi Sri Krishna Matha'
    },
    {
      src: 'assets/images/Slideshow images/WhatsApp Image 2026-08-15 at 11.33.34.jpeg',
      alt: 'Sri Krishna — Divine Golden Alankara and Temple Splendor',
      title: 'Divya Alankara',
      subtitle: 'Golden Temple Splendor'
    },
    {
      src: 'assets/images/Slideshow images/WhatsApp Image 2026-08-15 at 11.33.35.jpeg',
      alt: 'Sri Krishna — Bala Krishna Adornment and Auspicious Grace',
      title: 'Bala Krishna',
      subtitle: 'Sacred Coastal Heritage'
    },
    {
      src: 'assets/images/Slideshow images/WhatsApp Image 2026-08-15 at 11.33.35 (1).jpeg',
      alt: 'Sri Krishna — Sacred Devotional Form and Blessing',
      title: 'Ananda Krishna',
      subtitle: 'Divine Form & Grace'
    },
    {
      src: 'assets/images/Slideshow images/WhatsApp Image 2026-08-15 at 11.33.35 (2).jpeg',
      alt: 'Sri Krishna — Celestial Sanctuary Darshana',
      title: 'Maha Alankara',
      subtitle: 'Sanctuary of Peace'
    },
    {
      src: 'assets/images/Slideshow images/WhatsApp Image 2026-08-15 at 11.33.36.jpeg',
      alt: 'Sri Krishna — Kadagolu Navaneetha Krishna with Churning Rod',
      title: 'Navaneetha Chora',
      subtitle: 'Eternal Devotion'
    },
    {
      src: 'assets/images/Slideshow images/WhatsApp Image 2026-08-15 at 11.34.17.jpeg',
      alt: 'Sri Krishna — Divine Glow and Auspicious Presence',
      title: 'Bhagavan Sri Krishna',
      subtitle: 'The Supreme Compassion'
    }
  ];

  const heroContainer = document.getElementById('hero-image') || document.querySelector('.hero-art-container');
  const slidesTrack = document.getElementById('hero-slides-track');
  const captionMeta = document.getElementById('hero-caption-meta');
  const slideTitle = document.getElementById('hero-slide-title');
  const slideSubtitle = document.getElementById('hero-slide-subtitle');

  if (!heroContainer || HERO_SLIDES.length === 0) return;

  let currentIndex = 0;
  const SLIDE_INTERVAL = 5500; // 5.5 seconds rotation
  let autoPlayTimer = null;
  let isHeroInView = true;

  // Preload and build DOM slide elements for instant zero-lag crossfade
  const slideElements = [];
  if (slidesTrack) {
    slidesTrack.innerHTML = '';
    HERO_SLIDES.forEach((slide, idx) => {
      const img = document.createElement('img');
      img.src = slide.src;
      img.alt = slide.alt;
      img.className = `hero-art-img hero-slide-img ${idx === 0 ? 'active' : ''}`;
      if (idx === 0) img.id = 'hero-krishna-image';
      slidesTrack.appendChild(img);
      slideElements.push(img);
    });
  }

  // Preload in browser memory
  HERO_SLIDES.forEach(slide => {
    const preloader = new Image();
    preloader.src = slide.src;
  });

  // Automated Smooth Crossfade Progression
  function nextSlide() {
    if (slideElements.length < 2) return;

    const prevIndex = currentIndex;
    currentIndex = (currentIndex + 1) % HERO_SLIDES.length;
    const nextSlideData = HERO_SLIDES[currentIndex];

    // Smoothly transition slide image layers
    slideElements[prevIndex].classList.remove('active');
    slideElements[currentIndex].classList.add('active');

    // Smoothly crossfade caption text
    if (captionMeta) {
      captionMeta.classList.add('fading');
      setTimeout(() => {
        if (slideTitle) slideTitle.textContent = nextSlideData.title;
        if (slideSubtitle) slideSubtitle.textContent = nextSlideData.subtitle;
        captionMeta.classList.remove('fading');
      }, 400);
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      const landingView = document.getElementById('landing-view');
      const isLandingVisible = !landingView || landingView.style.display !== 'none';
      if (!document.hidden && isLandingVisible && isHeroInView) {
        nextSlide();
      }
    }, SLIDE_INTERVAL);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // Pause automatically when user scrolls away from hero container
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isHeroInView = entry.isIntersecting;
        if (isHeroInView) {
          startAutoPlay();
        } else {
          stopAutoPlay();
        }
      });
    }, { threshold: 0.15 });
    observer.observe(heroContainer);
  } else {
    startAutoPlay();
  }

  // Pause when browser tab is inactive
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  // Connect Explore Sanctuaries Button for smooth scroll
  const exploreBtn = document.getElementById('explore-portals-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = document.getElementById('portals') || document.querySelector('.portals-section');
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  startAutoPlay();
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
  const bottomPrevVerseBtn = document.getElementById('bottom-prev-verse-btn');
  const bottomNextVerseBtn = document.getElementById('bottom-next-verse-btn');
  const verseNumberTabs = document.getElementById('verse-number-tabs');
  const verseQuickSelect = document.getElementById('verse-quick-select');
  const translitToggleBtn = document.getElementById('translit-toggle-btn');
  const translitBtnLabel = document.getElementById('translit-btn-label');
  const translitContainer = document.getElementById('verse-translit-container');

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

  const STATIC_GITA_CHAPTERS = [
    {
      "chapter_number": 1,
      "name_sanskrit": "अर्जुनविषादयोग",
      "name_transliteration": "Arjuna Viṣāda Yoga",
      "name_translation": "The Yoga of Arjuna's Dejection",
      "verses_count": 47,
      "theme": "Moral Dilemma, Compassion, and Surrender",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "summary": "As the Pandava and Kaurava armies assemble on the sacred field of Kurukshetra, Arjuna is overwhelmed by grief and moral crisis upon seeing his revered teachers, kinsmen, and friends poised for battle. Casting down his bow Gandiva, he collapses in utter despondency, preparing the stage for Sri Krishna's divine discourse.",
      "status": "available"
    },
    {
      "chapter_number": 2,
      "name_sanskrit": "साङ्ख्ययोग",
      "name_transliteration": "Sāṅkhya Yoga",
      "name_translation": "The Yoga of Analytical Knowledge",
      "verses_count": 72,
      "theme": "Immortal Soul, Duty, and Equanimity (Karma Yoga)",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "summary": "Sri Krishna begins His immortal teachings, dispelling Arjuna's grief by unveiling the eternal nature of the soul (Atman), the duty of a warrior (Svadharma), the path of selfless action (Karma Yoga), and the qualities of a person of steady wisdom (Sthitaprajna).",
      "status": "available"
    },
    {
      "chapter_number": 3,
      "name_sanskrit": "कर्मयोग",
      "name_transliteration": "Karma Yoga",
      "name_translation": "The Yoga of Action",
      "verses_count": 43,
      "theme": "Selfless Duty, Sacrifice, and Overcoming Desire",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "summary": "Sri Krishna expounds on the necessity of performing one's natural prescribed duties without attachment to results (Nishkama Karma), following the cosmic cycle of sacrifice (Yajna), leading by personal example (Lokasangraha), and conquering inner desire and anger through Self-knowledge.",
      "status": "available"
    },
    {
      "chapter_number": 4,
      "name_sanskrit": "ज्ञानकर्मसंन्यासयोग",
      "name_transliteration": "Jñāna Karma Sannyāsa Yoga",
      "name_translation": "The Yoga of Knowledge, Action, and Renunciation",
      "verses_count": 42,
      "theme": "Divine Incarnation, Sacred Knowledge, and the Fire of Wisdom",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "summary": "Sri Krishna reveals the eternal lineage of Yoga, His divine descent (Avatarana) to protect dharma across ages, the profound nature of action in inaction, the various dimensions of inner sacrifice (Yajna), and how the blazing fire of spiritual wisdom (Jñanagni) burns all binding karmas to ashes.",
      "status": "available"
    },
    {
      "chapter_number": 5,
      "name_sanskrit": "कर्मसंन्यासयोग",
      "name_transliteration": "Karma Sannyāsa Yoga",
      "name_translation": "The Yoga of Renunciation of Action",
      "verses_count": 29,
      "theme": "Renunciation vs. Selfless Action, Equanimity, and Supreme Peace",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "summary": "Sri Krishna harmonizes the path of renunciation (Sannyasa) with selfless action (Karma Yoga), establishing that selfless dedicated work is superior and easier for purification. The enlightened sage sees the divine in all beings with equal vision, remains untouched by sin like a lotus leaf by water, and attains the supreme peace of Brahman Nirvana.",
      "status": "available"
    },
    {
      "chapter_number": 6,
      "name_sanskrit": "आत्मसंयमयोग",
      "name_transliteration": "Dhyāna Yoga",
      "name_translation": "The Yoga of Meditation",
      "verses_count": 47,
      "theme": "Mind Mastery, The Science of Meditation, and Inner Absorption",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "summary": "Sri Krishna expounds the practical science of meditation (Dhyana Yoga), the art of mastering the mind as one's greatest friend, the ideal posture and discipline for inner stillness, equal vision toward all beings, and reassures Arjuna that no sincere yogic effort is ever lost.",
      "status": "available"
    },
    {
      "chapter_number": 7,
      "name_sanskrit": "ज्ञानविज्ञानयोग",
      "name_transliteration": "Jñāna Vijñāna Yoga",
      "name_translation": "The Yoga of Knowledge and Realization",
      "verses_count": 30,
      "theme": "The Supreme Reality Behind Cosmic Manifestation",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "summary": "Sri Krishna unveils the mysteries of knowledge (Jnana) and experiential realization (Vijnana), His twofold material and spiritual energies (Apara and Para Prakriti), the divine illusion of Maya, the four types of noble devotees, and the rare devotee who realizes that Vasudeva is everything.",
      "status": "available"
    },
    {
      "chapter_number": 8,
      "name_sanskrit": "अक्षरब्रह्मयोग",
      "name_transliteration": "Akṣara Brahma Yoga",
      "name_translation": "The Yoga of the Imperishable Absolute",
      "verses_count": 28,
      "theme": "The Imperishable Brahman, Cosmic Cycles, and Attainment of the Supreme",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "completion_image": "assets/images/8th-adhyaya-end.jpg",
      "summary": "Sri Krishna reveals the nature of the Imperishable Brahman, the secret of constant remembrance at the moment of bodily departure, yogic concentration on OM (Pranava), the cosmic cycles of Brahma's day and night, and the luminous Northern (Devayana) and Southern (Pitriyana) paths leading to the Supreme Abode.",
      "colophon": "ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे श्रीकृष्णार्जुनसंवादे अक्षरब्रह्मयोगो नाम अष्टमोऽध्यायः ॥ ८ ॥",
      "status": "available"
    },
    {
      "chapter_number": 9,
      "name_sanskrit": "राजविद्याराजगुह्ययोग",
      "name_transliteration": "Rājavidyā Rājaguhya Yoga",
      "name_translation": "The Yoga of the Sovereign Science and Sovereign Secret",
      "verses_count": 34,
      "theme": "The Sovereign Science, Sovereign Secret, and Unconditional Devotional Refuge",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "completion_image": "assets/images/9th-adhyaya-end.jpg",
      "summary": "Sri Krishna reveals the supreme confidential wisdom (Raja Vidya Raja Guhya), His unmanifest cosmic pervasion, the nature of Prakriti working under His divine supervision, the futility of polytheistic fruitive rites versus the infallible refuge of exclusive devotion (Ananya Bhakti), His promise to personally preserve what His devotees possess (Yoga-kṣema), accepting simple offerings of love with grace (Patram Pushpam Phalam Toyam), and welcoming all souls into supreme liberation.",
      "colophon": "ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे श्रीकृष्णार्जुनसंवादे राजविद्याराजगुह्ययोगो नाम नवमोऽध्यायः ॥ ९ ॥",
      "status": "available"
    },
    {
      "chapter_number": 10,
      "name_sanskrit": "विभूतियोग",
      "name_transliteration": "Vibhūti Yoga",
      "name_translation": "The Yoga of Divine Opulence",
      "verses_count": 42,
      "theme": "The Omnipresence of Krishna in All Excellence and Divine Opulence",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "completion_image": "assets/images/10th-adhyaya-end.jpg",
      "summary": "Sri Krishna reveals His transcendent origin, the sacred Chatushloki Gita (10.8–10.11), and enumerates His infinite cosmic manifestations—the indwelling Self of all creatures, Vishnu among Adityas, the radiant Sun, the holy syllable OM, Japa Yajna, the Himalayas, Lord Rama, the holy Ganges, inexhaustible Time, and supporting the entire universe with a single fraction of His Being.",
      "colophon": "ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे श्रीकृष्णार्जुनसंवादे विभूतियोगो नाम दशमोऽध्यायः ॥ १० ॥",
      "status": "available"
    },
    {
      "chapter_number": 11,
      "name_sanskrit": "विश्वरूपदर्शनयोग",
      "name_transliteration": "Viśvarūpa Darśana Yoga",
      "name_translation": "The Yoga of the Cosmic Vision",
      "verses_count": 55,
      "theme": "The Awe-Inspiring Universal Form, Cosmic Time, and the Vision of the Divine",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "completion_image": "assets/images/11th-adhyaya-end.jpg",
      "summary": "Sri Krishna bestows divine vision (Divya Chakshu) upon Arjuna to behold the dazzling, terrifying, and transcendent Universal Form (Vishvarupa)—blazing like a thousand suns, displaying all gods, worlds, and time-destroying jaws. Krishna proclaims Himself as Time (Kala), urging Arjuna to be an instrument (Nimitta-matram), before resuming His gentle, loving two-armed form accessible only through unalloyed devotion.",
      "colophon": "ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे श्रीकृष्णार्जुनसंवादे विश्वरूपदर्शनयोगो नाम एकादशोऽध्यायः ॥ ११ ॥",
      "status": "available"
    },
    {
      "chapter_number": 12,
      "name_sanskrit": "भक्तियोग",
      "name_transliteration": "Bhakti Yoga",
      "name_translation": "The Yoga of Pure Devotion",
      "verses_count": 20,
      "theme": "The Superiority of Love, the Ladder of Practice, and Qualities of the Dear Devotee",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "completion_image": "assets/images/12th-adhyaya-end.jpg",
      "summary": "Sri Krishna expounds the glory and direct sweetness of loving devotion (Bhakti Yoga) over the arduous contemplation of the unmanifest Absolute, outlines the practical ladder of spiritual ascent, and reveals the profound virtues of the devotee who is exceedingly dear to Him.",
      "colophon": "ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे श्रीकृष्णार्जुनसंवादे भक्तियोगो नाम द्वादशोऽध्यायः ॥ १२ ॥",
      "status": "available"
    },
    {
      "chapter_number": 13,
      "name_sanskrit": "क्षेत्रक्षेत्रज्ञविभागयोग",
      "name_transliteration": "Kṣetra Kṣetrajña Vibhāga Yoga",
      "name_translation": "The Yoga of the Field and the Knower of the Field",
      "verses_count": 35,
      "theme": "Distinction Between Matter, Consciousness, and the Supreme Indweller",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "completion_image": "assets/images/13th-adhyaya-end.jpg",
      "summary": "Sri Krishna expounds the metaphysical discrimination between the body-mind complex (the Field / Kshetra) and the indwelling pure Consciousness (the Knower / Kshetrajna), delineates the twenty virtues of true wisdom, unveils the supreme nature of Parabrahman (Jneya), and reveals the path of liberation through the eye of wisdom (Jnana Chakshu).",
      "colophon": "ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे श्रीकृष्णार्जुनसंवादे क्षेत्रक्षेत्रज्ञविभागयोगो नाम त्रयोदशोऽध्यायः ॥ १३ ॥",
      "status": "available"
    },
    {
      "chapter_number": 14,
      "name_sanskrit": "गुणत्रयविभागयोग",
      "name_transliteration": "Guṇatraya Vibhāga Yoga",
      "name_translation": "The Yoga of the Three Modes of Material Nature",
      "verses_count": 27,
      "theme": "Transcending Sattva, Rajas, and Tamas through Supreme Devotion",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "completion_image": "assets/images/14th-adhyaya-end.jpg",
      "summary": "Sri Krishna reveals the mechanics of the three modes of material nature (Sattva, Rajas, Tamas) that bind the soul, describes the characteristics and conduct of the Gunatita (one who has transcended the gunas), and establishes unswerving Bhakti Yoga as the direct path to Brahman realization.",
      "colophon": "ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे श्रीकृष्णार्जुनसंवादे गुणत्रयविभागयोगो नाम चतुर्दशोऽध्यायः ॥ १४ ॥",
      "status": "available"
    },
    {
      "chapter_number": 15,
      "name_sanskrit": "पुरुषोत्तमयोग",
      "name_transliteration": "Puruṣottama Yoga",
      "name_translation": "The Yoga of the Supreme Person",
      "verses_count": 20,
      "theme": "The Inverted Tree of Samsara and the Majesty of Purushottama",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "completion_image": "assets/images/15th-adhyaya-end.jpg",
      "summary": "Sri Krishna expounds the allegory of the inverted Ashvattha tree of material existence, reveals how the soul is an eternal fragment of God (Mamaivamsho), unveils the digestive fire and indwelling witness, and delivers the Tri-shloki Gita establishing His identity as Purushottama—the Supreme Person beyond both matter and individual spirit.",
      "colophon": "ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे श्रीकृष्णार्जुनसंवादे पुरुषोत्तमयोगो नाम पञ्चदशोऽध्यायः ॥ १५ ॥",
      "status": "available"
    },
    {
      "chapter_number": 16,
      "name_sanskrit": "दैवासुरसम्पद्विभागयोग",
      "name_transliteration": "Daivāsura Sampad Vibhāga Yoga",
      "name_translation": "The Yoga of the Divine and Demonic Natures",
      "verses_count": 24,
      "theme": "The 26 Divine Virtues, Demonic Pitfalls, and the Authority of Scripture",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "completion_image": "assets/images/16th-adhyaya-end.jpg",
      "summary": "Sri Krishna contrasts the 26 sublime virtues of the divine nature (Daivi Sampad) leading to liberation against the destructive traits of the demonic temperament (Asuri Sampad) leading to bondage. He unveils the 3 gates to self-ruin—Lust (Kama), Anger (Krodha), and Greed (Lobha)—and establishes scriptural authority (Shastra-Pramana) as the true guide for righteous action.",
      "colophon": "ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे श्रीकृष्णार्जुनसंवादे दैवासुरसम्पद्विभागयोगो नाम षोडशोऽध्यायः ॥ १६ ॥",
      "status": "available"
    },
    {
      "chapter_number": 17,
      "name_sanskrit": "श्रद्धात्रयविभागयोग",
      "name_transliteration": "Śraddhātraya Vibhāga Yoga",
      "name_translation": "The Yoga of the Threefold Faith",
      "verses_count": 28,
      "theme": "The Threefold Faith, Food, Sacrifice, Austerities, and OM TAT SAT",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "completion_image": "assets/images/Madhav ✨.jpg",
      "summary": "Sri Krishna reveals how faith (Shraddha), worship, dietary preferences, sacrifices (Yajna), austerities of body-speech-mind (Tapas), and charities (Dana) are divided across the three gunas. He unveils the supreme purifying power of the threefold designation of Brahman: OM TAT SAT, teaching that works offered without faith are Asat.",
      "colophon": "ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे श्रीकृष्णार्जुनसंवादे श्रद्धात्रयविभागयोगो नाम सप्तदशोऽध्यायः ॥ १७ ॥",
      "status": "available"
    },
    {
      "chapter_number": 18,
      "name_sanskrit": "मोक्षसंन्यासयोग",
      "name_transliteration": "Mokṣa Sannyāsa Yoga",
      "name_translation": "The Yoga of Liberation through Renunciation",
      "verses_count": 78,
      "theme": "The Culmination of the Gita: Supreme Surrender and Victory",
      "image_url": "assets/images/krishna-and-arjuna.jpg",
      "completion_image": "assets/images/18th-adhyaya-end.jpg",
      "summary": "The ultimate synthesis of duty, wisdom, and devotion, culminating in Krishna's crowning promise: 'Surrendering all duties, take refuge in Me alone; I will deliver you from all sin, fear not.' (18.66)",
      "colophon": "ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे श्रीकृष्णार्जुनसंवादे मोक्षसंन्यासयोगो नाम अष्टादशोऽध्यायः ॥ १८ ॥",
      "status": "available"
    }
  ];

  // State Management — Initialize immediately with all 18 chapters for instantaneous zero-delay render
  let chaptersData = [...STATIC_GITA_CHAPTERS];
  const chaptersVersesCache = {};
  let currentChapter = 1;
  let currentVerseIndex = 0;
  let isTranslitVisible = true;
  let activeView = 'landing'; // 'landing' | 'chapters' | 'reader' | 'completion'

  function stopPoojaAudioIfPlaying() {
    if (typeof window.stopVirtualPoojaAudio === 'function') {
      window.stopVirtualPoojaAudio();
    }
  }

  // --- View Switching ---
  function showLandingView() {
    activeView = 'landing';
    stopPoojaAudioIfPlaying();

    if (landingView) landingView.style.display = 'block';
    if (gitaView) gitaView.style.display = 'none';
    if (completionView) completionView.style.display = 'none';

    const poojaView = document.getElementById('pooja-view');
    if (poojaView) poojaView.style.display = 'none';

    const welcomeModal = document.getElementById('pooja-welcome-modal');
    if (welcomeModal) {
      welcomeModal.classList.remove('active');
      welcomeModal.setAttribute('aria-hidden', 'true');
      welcomeModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    if (window.location.hash && window.location.hash !== '') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showGitaChaptersView() {
    activeView = 'chapters';
    stopPoojaAudioIfPlaying();

    if (landingView) landingView.style.display = 'none';
    if (gitaView) gitaView.style.display = 'block';
    if (chaptersView) chaptersView.style.display = 'block';
    if (readerView) readerView.style.display = 'none';
    if (completionView) completionView.style.display = 'none';

    const poojaView = document.getElementById('pooja-view');
    if (poojaView) poojaView.style.display = 'none';

    history.pushState(null, '', '#gita');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (chaptersData.length === 0) {
      loadChaptersData();
    }
  }

  function updateOverviewBanner(chapterNum) {
    const chMeta = chaptersData.find(c => c.chapter_number === chapterNum);
    if (!chMeta) return;

    const pillLabel = document.getElementById('reader-chapter-pill-label');
    if (pillLabel) pillLabel.textContent = `Chapter ${chMeta.chapter_number} • ${chMeta.verses_count} Verses`;

    const artImg = document.getElementById('overview-art-img');
    if (artImg) {
      artImg.src = chMeta.image_url;
      artImg.alt = `${chMeta.name_transliteration} Artwork`;
    }

    const themeBadge = document.getElementById('overview-theme-badge');
    if (themeBadge) themeBadge.innerHTML = `<span>✦ ${chMeta.theme} ✦</span>`;

    const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const sanskritNum = chapterNum.toString().split('').map(d => devanagariDigits[parseInt(d, 10)] || d).join('');
    const sanskritTitle = document.getElementById('overview-sanskrit-title');
    if (sanskritTitle) sanskritTitle.textContent = `अध्याय ${sanskritNum} • ${chMeta.name_sanskrit}`;

    const engTitle = document.getElementById('overview-eng-title');
    if (engTitle) engTitle.textContent = `${chMeta.name_transliteration} — ${chMeta.name_translation}`;

    const summaryText = document.getElementById('overview-summary-text');
    if (summaryText) summaryText.textContent = chMeta.summary;
  }

  function showVerseReaderView(chapterNum = 1, verseNum = 1) {
    activeView = 'reader';
    stopPoojaAudioIfPlaying();

    currentChapter = Math.max(1, Math.min(18, chapterNum));
    currentVerseIndex = Math.max(0, verseNum - 1);

    if (landingView) landingView.style.display = 'none';
    if (gitaView) gitaView.style.display = 'block';
    if (chaptersView) chaptersView.style.display = 'none';
    if (readerView) readerView.style.display = 'block';
    if (completionView) completionView.style.display = 'none';

    const poojaView = document.getElementById('pooja-view');
    if (poojaView) poojaView.style.display = 'none';

    updateOverviewBanner(currentChapter);
    history.pushState(null, '', `#gita/chapter-${currentChapter}/verse-${verseNum}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!chaptersVersesCache[currentChapter]) {
      loadChapterVerses(currentChapter);
    } else {
      renderVerseTabs();
      renderCurrentVerse();
    }
  }

  function showCompletionView(chapterNum = 1) {
    activeView = 'completion';
    stopPoojaAudioIfPlaying();

    currentChapter = Math.max(1, Math.min(18, chapterNum));

    if (landingView) landingView.style.display = 'none';
    if (gitaView) gitaView.style.display = 'block';
    if (chaptersView) chaptersView.style.display = 'none';
    if (readerView) readerView.style.display = 'none';
    if (completionView) completionView.style.display = 'block';

    const poojaView = document.getElementById('pooja-view');
    if (poojaView) poojaView.style.display = 'none';

    const compImg = document.getElementById('completion-art-img');
    const compBadge = document.getElementById('completion-badge-tag');
    const compColophon = document.getElementById('completion-sanskrit-colophon');
    const compDesc = document.getElementById('completion-translation-desc');
    const compNextLabel = document.getElementById('completion-next-ch-label');

    if (chapterNum === 18) {
      if (compImg) {
        compImg.src = 'assets/images/18th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna and Arjuna on the Chariot - Srimad Bhagavad Gita Completed';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ सम्पूर्ण श्रीमद्भगवद्गीता समाप्तम् • SRIMAD BHAGAVAD GITA COMPLETED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसंवादे मोक्षसंन्यासयोगो नाम अष्टादशोऽध्यायः ॥ १८ ॥<br><div class="gita-grand-conclusion"><span class="conclusion-flourish">✦</span><span class="conclusion-mantra">॥ इति श्रीमद्भगवद्गीता समाप्ता ॥</span><span class="conclusion-flourish">✦</span></div>';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the eighteenth chapter named <strong>Mokṣa Sannyāsa Yoga</strong>, concluding the sacred scripture of the Srimad Bhagavad Gita, the immortal dialogue between Bhagavan Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Restart Journey: अर्जुनविषादयोग (Chapter 1)';
    } else if (chapterNum === 17) {
      if (compImg) {
        compImg.src = 'assets/images/Madhav ✨.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 17 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय १७ समाप्तम् • CHAPTER 17 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसंवादे श्रद्धात्रयविभागयोगो नाम सप्तदशोऽध्यायः ॥ १७ ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the seventeenth chapter named <strong>Śraddhātraya Vibhāga Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: मोक्षसंन्यासयोग (Chapter 18)';
    } else if (chapterNum === 16) {
      if (compImg) {
        compImg.src = 'assets/images/16th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 16 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय १६ समाप्तम् • CHAPTER 16 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसंवादे दैवासुरसम्पद्विभागयोगो नाम षोडशोऽध्यायः ॥ १६ ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the sixteenth chapter named <strong>Daivāsura Sampad Vibhāga Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: श्रद्धात्रयविभागयोग (Chapter 17)';
    } else if (chapterNum === 15) {
      if (compImg) {
        compImg.src = 'assets/images/15th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 15 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय १५ समाप्तम् • CHAPTER 15 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसंवादे पुरुषोत्तमयोगो नाम पञ्चदशोऽध्यायः ॥ १५ ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the fifteenth chapter named <strong>Puruṣottama Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: दैवासुरसम्पद्विभागयोग (Chapter 16)';
    } else if (chapterNum === 14) {
      if (compImg) {
        compImg.src = 'assets/images/14th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 14 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय १४ समाप्तम् • CHAPTER 14 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसंवादे गुणत्रयविभागयोगो नाम चतुर्दशोऽध्यायः ॥ १४ ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the fourteenth chapter named <strong>Guṇatraya Vibhāga Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: पुरुषोत्तमयोग (Chapter 15)';
    } else if (chapterNum === 13) {
      if (compImg) {
        compImg.src = 'assets/images/13th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 13 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय १३ समाप्तम् • CHAPTER 13 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसंवादे क्षेत्रक्षेत्रज्ञविभागयोगो नाम त्रयोदशोऽध्यायः ॥ १३ ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the thirteenth chapter named <strong>Kṣetra Kṣetrajña Vibhāga Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: गुणत्रयविभागयोग (Chapter 14)';
    } else if (chapterNum === 12) {
      if (compImg) {
        compImg.src = 'assets/images/12th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 12 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय १२ समाप्तम् • CHAPTER 12 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसंवादे भक्तियोगो नाम द्वादशोऽध्यायः ॥ १२ ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the twelfth chapter named <strong>Bhakti Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: क्षेत्रक्षेत्रज्ञविभागयोग (Chapter 13)';
    } else if (chapterNum === 11) {
      if (compImg) {
        compImg.src = 'assets/images/11th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 11 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय ११ समाप्तम् • CHAPTER 11 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसंवादे विश्वरूपदर्शनयोगो नाम एकादशोऽध्यायः ॥ ११ ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the eleventh chapter named <strong>Viśvarūpa Darśana Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: भक्तियोग (Chapter 12)';
    } else if (chapterNum === 10) {
      if (compImg) {
        compImg.src = 'assets/images/10th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 10 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय १० समाप्तम् • CHAPTER 10 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसंवादे विभूतियोगो नाम दशमोऽध्यायः ॥ १० ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the tenth chapter named <strong>Vibhūti Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: विश्वरूपदर्शनयोग (Chapter 11)';
    } else if (chapterNum === 9) {
      if (compImg) {
        compImg.src = 'assets/images/9th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 9 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय ९ समाप्तम् • CHAPTER 9 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसंवादे राजविद्याराजगुह्ययोगो नाम नवमोऽध्यायः ॥ ९ ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the ninth chapter named <strong>Rājavidyā Rājaguhya Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: विभूतियोग (Chapter 10)';
    } else if (chapterNum === 8) {
      if (compImg) {
        compImg.src = 'assets/images/8th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 8 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय ८ समाप्तम् • CHAPTER 8 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसंवादे अक्षरब्रह्मयोगो नाम अष्टमोऽध्यायः ॥ ८ ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the eighth chapter named <strong>Akṣara Brahma Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: राजविद्याराजगुह्ययोग (Chapter 9)';
    } else if (chapterNum === 7) {
      if (compImg) {
        compImg.src = 'assets/images/7th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 7 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय ७ समाप्तम् • CHAPTER 7 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसम्वादे ज्ञानविज्ञानयोगो नाम सप्तमोऽध्यायः ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the seventh chapter named <strong>Jñāna Vijñāna Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: अक्षरब्रह्मयोग (Chapter 8)';
    } else if (chapterNum === 6) {
      if (compImg) {
        compImg.src = 'assets/images/6th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 6 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय ६ समाप्तम् • CHAPTER 6 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसम्वादे आत्मसंयमयोगो नाम षष्ठोऽध्यायः ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the sixth chapter named <strong>Dhyāna Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: ज्ञानविज्ञानयोग (Chapter 7)';
    } else if (chapterNum === 5) {
      if (compImg) {
        compImg.src = 'assets/images/5th-adhyaya-end_.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 5 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय ५ समाप्तम् • CHAPTER 5 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसम्वादे कर्मसंन्यासयोगो नाम पञ्चमोऽध्यायः ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the fifth chapter named <strong>Karma Sannyāsa Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: आत्मसंयमयोग (Chapter 6)';
    } else if (chapterNum === 4) {
      if (compImg) {
        compImg.src = 'assets/images/4th-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 4 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय ४ समाप्तम् • CHAPTER 4 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसम्वादे ज्ञानकर्मसंन्यासयोगो नाम चतुर्थोऽध्यायः ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the fourth chapter named <strong>Jñāna Karma Sannyāsa Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: कर्मसंन्यासयोग (Chapter 5)';
    } else if (chapterNum === 3) {
      if (compImg) {
        compImg.src = 'assets/images/3rd-adhyaya-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 3 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय ३ समाप्तम् • CHAPTER 3 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसम्वादे कर्मयोगो नाम तृतीयोऽध्यायः ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the third chapter named <strong>Karma Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: ज्ञानकर्मसंन्यासयोग (Chapter 4)';
    } else if (chapterNum === 2) {
      if (compImg) {
        compImg.src = 'assets/images/adhyaya-2-end.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 2 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय २ समाप्तम् • CHAPTER 2 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसम्वादे साङ्ख्ययोगो नाम द्वितीयोऽध्यायः ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the second chapter named <strong>Sāṅkhya Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: कर्मयोग (Chapter 3)';
    } else {
      // Default Chapter 1
      if (compImg) {
        compImg.src = 'assets/images/slideshow-2.jpg';
        compImg.alt = 'Bhagavan Sri Krishna - Chapter 1 Concluded';
      }
      if (compBadge) compBadge.innerHTML = '<span>✦ अध्याय १ समाप्तम् • CHAPTER 1 CONCLUDED ✦</span>';
      if (compColophon) {
        compColophon.innerHTML = 'ॐ तत्सदिति श्रीमद्भगवद्गीतासूपनिषत्सु ब्रह्मविद्यायां योगशास्त्रे<br>श्रीकृष्णार्जुनसम्वादे अर्जुनविषादयोगो नाम प्रथमोऽध्यायः ॥';
      }
      if (compDesc) {
        compDesc.innerHTML = '<em>"Om Tat Sat — Thus ends the first chapter named <strong>Arjuna Viṣāda Yoga</strong> in the Upanishad of the Srimad Bhagavad Gita, the science of the Supreme Spirit, the scripture of Yoga, and the sacred dialogue between Sri Krishna and Arjuna."</em>';
      }
      if (compNextLabel) compNextLabel.textContent = 'Next Chapter: साङ्ख्ययोग (Chapter 2)';
    }

    history.pushState(null, '', `#gita/chapter-${chapterNum}/completed`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Data Fetching with Resilient Fallbacks & Cache Busting ---
  async function loadChaptersData() {
    try {
      // 1. Primary fetch with cache busting & no-cache header
      const response = await fetch('data/gita-chapters.json?v=2.0.0', { cache: 'no-cache' });
      if (response.ok) {
        chaptersData = await response.json();
        renderChaptersGrid(chaptersData);
        updateOverviewBanner(currentChapter);
        return;
      }
    } catch (e1) {
      console.warn('Primary fetch for gita-chapters.json failed, trying relative path...', e1);
    }

    try {
      // 2. Relative path fallback
      const response2 = await fetch('./data/gita-chapters.json?v=2.0.0');
      if (response2.ok) {
        chaptersData = await response2.json();
        renderChaptersGrid(chaptersData);
        updateOverviewBanner(currentChapter);
        return;
      }
    } catch (e2) {
      console.warn('Relative fetch for gita-chapters.json failed, applying static fallback...', e2);
    }

    // 3. Guaranteed Static Fallback (All 18 chapters)
    if (STATIC_GITA_CHAPTERS && STATIC_GITA_CHAPTERS.length === 18) {
      chaptersData = [...STATIC_GITA_CHAPTERS];
      renderChaptersGrid(chaptersData);
      updateOverviewBanner(currentChapter);
    }
  }

  async function loadChapterVerses(chapterNum) {
    try {
      // 1. Primary fetch with cache busting & no-cache
      const response = await fetch(`data/verses/chapter-${chapterNum}.json?v=2.0.0`, { cache: 'no-cache' });
      if (response.ok) {
        const data = await response.json();
        chaptersVersesCache[chapterNum] = data;
        renderVerseTabs();
        renderCurrentVerse();
        return;
      }
    } catch (e1) {
      console.warn(`Primary fetch for Chapter ${chapterNum} failed, trying relative path...`, e1);
    }

    try {
      // 2. Relative path fallback
      const response2 = await fetch(`./data/verses/chapter-${chapterNum}.json?v=2.0.0`);
      if (response2.ok) {
        const data2 = await response2.json();
        chaptersVersesCache[chapterNum] = data2;
        renderVerseTabs();
        renderCurrentVerse();
        return;
      }
    } catch (e2) {
      console.error(`Failed to load Chapter ${chapterNum} verses via all fallbacks:`, e2);
    }
  }

  // --- Rendering Chapters Grid ---
  function renderChaptersGrid(chapters) {
    if (!chaptersGrid) return;
    chaptersGrid.innerHTML = '';

    if (!chapters || chapters.length === 0) {
      chaptersGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: rgba(14, 25, 48, 0.6); border: 1px dashed rgba(245, 166, 35, 0.3); border-radius: 16px;">
          <p style="font-size: 1.2rem; color: var(--gold-bright); margin-bottom: 0.5rem;">✦ No chapters found ✦</p>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Try searching with different keywords like "Karma", "Sankhya", "Yoga", or "Arjuna".</p>
        </div>
      `;
      return;
    }

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

  // --- Rendering Verse Tabs & Quick Dropdown ---
  function renderVerseTabs() {
    const activeData = chaptersVersesCache[currentChapter];
    if (!activeData || !activeData.verses) return;

    if (verseNumberTabs) {
      verseNumberTabs.innerHTML = '';
      activeData.verses.forEach((v, index) => {
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
      activeData.verses.forEach((v, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = `Verse ${v.verse_number}`;
        verseQuickSelect.appendChild(opt);
      });
    }
  }

  // --- Rendering Current Verse ---
  function renderCurrentVerse() {
    const activeData = chaptersVersesCache[currentChapter];
    if (!activeData || !activeData.verses || activeData.verses.length === 0) return;

    // Clamp verse index safely within bounds
    if (currentVerseIndex >= activeData.verses.length) {
      currentVerseIndex = activeData.verses.length - 1;
    }
    if (currentVerseIndex < 0) {
      currentVerseIndex = 0;
    }

    const verse = activeData.verses[currentVerseIndex];
    if (!verse) return;
    const totalVerses = activeData.verses.length;

    // Update Header Meta
    if (verseIdBadge) verseIdBadge.textContent = `BG ${currentChapter}.${verse.verse_number}`;
    if (verseNumberLabel) {
      verseNumberLabel.textContent = `श्लोक ${verse.verse_number} • Verse ${verse.verse_number} of ${activeData.verses.length} (Adhyaya Total: ${activeData.verses_count})`;
    }

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

    // Update Top & Bottom Prev Navigation Buttons (Verse 1 is strictly disabled)
    if (prevVerseBtn) {
      prevVerseBtn.disabled = (currentVerseIndex === 0);
      prevVerseBtn.title = (currentVerseIndex === 0) ? 'Beginning of Chapter (First Verse)' : 'Previous Verse (Left Arrow Key)';
    }

    if (bottomPrevVerseBtn) {
      if (currentVerseIndex === 0) {
        bottomPrevVerseBtn.disabled = true;
        bottomPrevVerseBtn.innerHTML = '<span class="btn-nav-icon">←</span> <span class="btn-nav-label">Previous Verse</span>';
        bottomPrevVerseBtn.title = 'Beginning of Chapter (First Verse)';
      } else {
        bottomPrevVerseBtn.disabled = false;
        bottomPrevVerseBtn.innerHTML = '<span class="btn-nav-icon">←</span> <span class="btn-nav-label">Previous Verse</span>';
        bottomPrevVerseBtn.title = `Previous Verse (Verse ${verse.verse_number - 1})`;
      }
    }

    // Update Top & Bottom Next Navigation Buttons
    if (nextVerseBtn) {
      if (currentVerseIndex === totalVerses - 1) {
        nextVerseBtn.disabled = false;
        nextVerseBtn.innerHTML = '<span class="btn-text">Complete Chapter</span> <span>✦</span>';
        nextVerseBtn.title = `Complete Chapter ${currentChapter} and View Dedication (॥ श्रीकृष्णार्पणमस्तु ॥)`;
      } else {
        nextVerseBtn.disabled = false;
        nextVerseBtn.innerHTML = '<span class="btn-text">Next</span> <span>→</span>';
        nextVerseBtn.title = 'Next Verse (Right Arrow Key)';
      }
    }

    if (bottomNextVerseBtn) {
      bottomNextVerseBtn.disabled = false;
      if (currentVerseIndex === totalVerses - 1) {
        bottomNextVerseBtn.classList.add('btn-verse-complete');
        bottomNextVerseBtn.innerHTML = '<span class="btn-nav-label">Complete Chapter</span> <span class="btn-nav-icon">✦</span>';
        bottomNextVerseBtn.title = `Complete Chapter ${currentChapter} and View Dedication (॥ श्रीकृष्णार्पणमस्तु ॥)`;
      } else {
        bottomNextVerseBtn.classList.remove('btn-verse-complete');
        bottomNextVerseBtn.innerHTML = '<span class="btn-nav-label">Next Verse</span> <span class="btn-nav-icon">→</span>';
        bottomNextVerseBtn.title = `Next Verse (Verse ${verse.verse_number + 1})`;
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
      if (currentChapter === 1) {
        showVerseReaderView(2, 1);
      } else if (currentChapter === 2) {
        showVerseReaderView(3, 1);
      } else if (currentChapter === 3) {
        showVerseReaderView(4, 1);
      } else if (currentChapter === 4) {
        showVerseReaderView(5, 1);
      } else if (currentChapter === 5) {
        showVerseReaderView(6, 1);
      } else if (currentChapter === 6) {
        showVerseReaderView(7, 1);
      } else if (currentChapter === 7) {
        showVerseReaderView(8, 1);
      } else if (currentChapter === 8) {
        showVerseReaderView(9, 1);
      } else if (currentChapter === 9) {
        showVerseReaderView(10, 1);
      } else if (currentChapter === 10) {
        showVerseReaderView(11, 1);
      } else if (currentChapter === 11) {
        showVerseReaderView(12, 1);
      } else if (currentChapter === 12) {
        showVerseReaderView(13, 1);
      } else if (currentChapter === 13) {
        showVerseReaderView(14, 1);
      } else if (currentChapter === 14) {
        showVerseReaderView(15, 1);
      } else if (currentChapter === 15) {
        showVerseReaderView(16, 1);
      } else if (currentChapter === 16) {
        showVerseReaderView(17, 1);
      } else if (currentChapter === 17) {
        showVerseReaderView(18, 1);
      } else {
        showVerseReaderView(1, 1);
      }
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

  // Navigation Action Handlers with Smooth Scroll Reset
  function scrollToVerseTop() {
    const target = document.getElementById('verse-display-card') || document.getElementById('gita-reader-view');
    if (target) {
      const yOffset = -24;
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function navigatePrevVerse(shouldScroll = false) {
    if (currentVerseIndex > 0) {
      currentVerseIndex--;
      renderCurrentVerse();
      if (shouldScroll) scrollToVerseTop();
    }
  }

  function navigateNextVerse(shouldScroll = false) {
    const activeData = chaptersVersesCache[currentChapter];
    if (!activeData || !activeData.verses) return;

    if (currentVerseIndex < activeData.verses.length - 1) {
      currentVerseIndex++;
      renderCurrentVerse();
      if (shouldScroll) scrollToVerseTop();
    } else {
      showCompletionView(currentChapter);
    }
  }

  // Prev / Next Button Listeners (Top & Bottom)
  if (prevVerseBtn) {
    prevVerseBtn.addEventListener('click', () => navigatePrevVerse(false));
  }

  if (nextVerseBtn) {
    nextVerseBtn.addEventListener('click', () => navigateNextVerse(false));
  }

  if (bottomPrevVerseBtn) {
    bottomPrevVerseBtn.addEventListener('click', () => navigatePrevVerse(true));
  }

  if (bottomNextVerseBtn) {
    bottomNextVerseBtn.addEventListener('click', () => navigateNextVerse(true));
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

  // Keyboard Shortcuts (Arrow Left / Arrow Right)
  window.addEventListener('keydown', (e) => {
    if (activeView !== 'reader') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    if (e.key === 'ArrowLeft') {
      navigatePrevVerse(true);
    } else if (e.key === 'ArrowRight') {
      navigateNextVerse(true);
    }
  });

  // Handle URL Hash on Initial Page Load & Browser Back/Forward
  function handleHashNavigation() {
    const rawHash = (window.location.hash || '').trim();
    const cleanHash = rawHash.toLowerCase();

    // 1. Explicit Root / Home / Landing routes
    if (!cleanHash || cleanHash === '' || cleanHash === '#' || cleanHash === '#home' || cleanHash === '#landing' || cleanHash === '#hero' || cleanHash === '/') {
      showLandingView();
      return;
    }

    // 1.1. Portals / Sanctuaries Anchor
    if (cleanHash === '#portals' || cleanHash === '#sanctuaries-grid' || cleanHash === '#explore-portals-btn' || cleanHash === '#sanctuaries') {
      showLandingView();
      const targetSection = document.getElementById('portals') || document.querySelector('.portals-section');
      if (targetSection) {
        setTimeout(() => {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      return;
    }

    // 1.2. Udupi Preview Modal Route
    if (cleanHash === '#udupi' || cleanHash === '#udupi-krishna' || cleanHash === '#udupi-matha') {
      showLandingView();
      if (typeof window.openPortalModal === 'function') {
        window.openPortalModal('udupi');
      } else {
        setTimeout(() => {
          if (typeof window.openPortalModal === 'function') window.openPortalModal('udupi');
        }, 150);
      }
      return;
    }

    // 2. Virtual Pooja Routes
    if (cleanHash.startsWith('#pooja') || cleanHash.startsWith('#puja')) {
      const match = cleanHash.match(/#(?:pooja|puja)(?:\/([a-z]+))?/);
      const phase = match && match[1] ? match[1] : null;
      if (typeof window.showPoojaView === 'function') {
        window.showPoojaView(phase);
      } else {
        setTimeout(() => {
          if (typeof window.showPoojaView === 'function') window.showPoojaView(phase);
        }, 150);
      }
      return;
    }

    // 3. Gita Completion Routes
    if (cleanHash.endsWith('/completed')) {
      const match = cleanHash.match(/#(?:gita|geeta)\/(?:chapter-)?(\d+)\/completed/);
      const ch = match ? parseInt(match[1], 10) : 1;
      showCompletionView(ch);
      return;
    }

    // 4. Gita Chapter / Verse Reader Routes
    if (cleanHash.startsWith('#gita/') || cleanHash.startsWith('#geeta/')) {
      const match = cleanHash.match(/#(?:gita|geeta)\/(?:chapter-)?(\d+)(?:\/(?:verse-)?(\d+))?/);
      if (match) {
        const ch = parseInt(match[1], 10);
        const v = match[2] ? parseInt(match[2], 10) : 1;
        showVerseReaderView(ch, v);
      } else {
        showGitaChaptersView();
      }
      return;
    }

    // 5. Gita Chapters Overview
    if (cleanHash === '#gita' || cleanHash === '#gita-explorer' || cleanHash === '#geeta' || cleanHash === '#gita-chapters') {
      showGitaChaptersView();
      return;
    }

    // Default Fallback: Always Home Portal View
    showLandingView();
  }

  window.addEventListener('popstate', handleHashNavigation);
  window.addEventListener('hashchange', handleHashNavigation);

  // Synchronously evaluate on startup
  handleHashNavigation();
  loadChaptersData();
}

/* ==========================================================================
   4. Portal Preview Modals
   Interactive preview for the upcoming Milestone 3 section (Udupi).
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
    about: {
      title: 'About Krishna Saga',
      sanskrit: 'विद्या ददाति विनयं • Knowledge & Devotion',
      icon: 'assets/icons/flute-peacock.svg',
      desc: 'Krishna Saga is an educational and spiritual web sanctuary designed to bring the sacred philosophy, history, and meditative rituals of Sri Krishna to seekers and learners worldwide.',
      milestone: 'Milestones 1, 2 & 4 Live: Portal Foundation, Gita Scripture Engine & Virtual Pooja Sanctuary',
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

  // Connect Udupi preview card
  const udupiCard = document.getElementById('card-udupi');
  if (udupiCard) {
    udupiCard.addEventListener('click', () => openModal('udupi'));
    udupiCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal('udupi');
      }
    });
  }

  const aboutBtn = document.getElementById('open-about-btn');
  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => openModal('about'));
  }

  document.getElementById('footer-udupi-link')?.addEventListener('click', () => openModal('udupi'));

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

  // Global Exports for Hash Navigation & Deep Links
  window.openPortalModal = openModal;
  window.closePortalModal = closeModal;
}

/* ==========================================================================
   5. Attribution & Heritage Modal
   ========================================================================== */
function initAttributionModal() {
  const modal = document.getElementById('attribution-modal');
  const closeBtn = document.getElementById('attr-close-btn');
  const actionBtn = document.getElementById('attr-primary-action');
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

/* ==========================================================================
   6. Virtual Pooja Engine (Milestone 4 Two-Column & Aarti Refactor)
   ========================================================================== */
function initVirtualPooja() {
  const landingView = document.getElementById('landing-view');
  const gitaView = document.getElementById('gita-view');
  const poojaView = document.getElementById('pooja-view');
  const welcomeModal = document.getElementById('pooja-welcome-modal');
  const welcomeCloseBtn = document.getElementById('pooja-modal-close-btn');

  const cardAbhisheka = document.getElementById('seva-card-abhisheka');
  const cardMahapooja = document.getElementById('seva-card-mahapooja');
  const btnEnterAbhisheka = document.getElementById('btn-enter-abhisheka');
  const btnEnterMahapooja = document.getElementById('btn-enter-mahapooja');

  const backToHomeBtn = document.getElementById('pooja-back-to-home-btn');
  const tabAbhisheka = document.getElementById('pooja-tab-abhisheka');
  const tabMahapooja = document.getElementById('pooja-tab-mahapooja');
  const tanpuraToggleBtn = document.getElementById('pooja-tanpura-toggle');
  const sfxToggleBtn = document.getElementById('pooja-sfx-toggle');
  const changeSevaBtn = document.getElementById('pooja-change-seva-btn');

  const deityImg = document.getElementById('pooja-deity-img');
  const canvas = document.getElementById('pooja-effects-canvas');
  const toastEl = document.getElementById('pooja-status-toast');
  const toastShloka = document.getElementById('pooja-toast-shloka');
  const toastDesc = document.getElementById('pooja-toast-desc');

  const aartiOverlay = document.getElementById('pooja-aarti-overlay');
  const dhoopOverlay = document.getElementById('pooja-dhoop-overlay');
  const tilakOverlay = document.getElementById('pooja-tilak-overlay');
  const tulsiOverlay = document.getElementById('pooja-tulsi-overlay');
  const naivedyaOverlay = document.getElementById('pooja-naivedya-overlay');

  const abhishekaTray = document.getElementById('pooja-abhisheka-tray');
  const mahapoojaTray = document.getElementById('pooja-mahapooja-tray');
  const toMahapoojaBtn = document.getElementById('pooja-to-mahapooja-btn');
  const toAbhishekaBtn = document.getElementById('pooja-to-abhisheka-btn');
  const completePoojaBtn = document.getElementById('pooja-complete-btn');
  const cardPuja = document.getElementById('card-puja');
  const footerPujaLink = document.getElementById('footer-puja-link');
  const tickerText = document.getElementById('pooja-ticker-text');

  const btnAartiAbh = document.getElementById('btn-offer-aarti-abh');
  const aartiIconAbh = document.getElementById('aarti-icon-abh');
  const aartiLabelSanskritAbh = document.getElementById('aarti-label-sanskrit-abh');
  const aartiLabelEngAbh = document.getElementById('aarti-label-eng-abh');

  const btnAartiMaha = document.getElementById('btn-offer-maha-aarti');
  const aartiIconMaha = document.getElementById('aarti-icon-maha');
  const aartiLabelSanskritMaha = document.getElementById('aarti-label-sanskrit-maha');
  const aartiLabelEngMaha = document.getElementById('aarti-label-eng-maha');

  let currentPhase = 'abhisheka';
  let isTanpuraOn = true;
  let isSfxOn = true;
  let audioCtx = null;
  let tanpuraGain = null;
  let tanpuraNodes = [];
  
  // Particles & Settled Accumulation
  let particles = [];
  let settledPetals = [];
  let animFrameId = null;
  let activeOfferingTimeout = null;
  let flowerOfferingCount = 0;

  // Aarti & Synchronized Bell State
  let isAartiActive = false;
  let aartiBellInterval = null;
  let activeAartiPhase = null;

  // Web Audio API Synthesis
  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function startTanpura() {
    if (!isTanpuraOn) return;
    initAudioContext();
    if (!audioCtx) return;

    stopTanpura();

    try {
      tanpuraGain = audioCtx.createGain();
      tanpuraGain.gain.setValueAtTime(0.24, audioCtx.currentTime);
      tanpuraGain.connect(audioCtx.destination);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(620, audioCtx.currentTime);
      filter.Q.setValueAtTime(2.8, audioCtx.currentTime);
      filter.connect(tanpuraGain);

      // C# / D chord harmonic partials: Pa (207.65), Sa (277.18), Sa (138.59), Kharja Sa (69.30)
      const partials = [
        { freq: 207.65, detune: -2, type: 'sawtooth', gain: 0.07 },
        { freq: 277.18, detune: 4, type: 'triangle', gain: 0.10 },
        { freq: 277.18, detune: -3, type: 'sawtooth', gain: 0.07 },
        { freq: 138.59, detune: 0, type: 'sawtooth', gain: 0.12 },
        { freq: 69.30, detune: 0, type: 'triangle', gain: 0.18 }
      ];

      partials.forEach(p => {
        const osc = audioCtx.createOscillator();
        const pGain = audioCtx.createGain();
        osc.type = p.type;
        osc.frequency.setValueAtTime(p.freq, audioCtx.currentTime);
        osc.detune.setValueAtTime(p.detune, audioCtx.currentTime);

        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.3 + Math.random() * 0.15, audioCtx.currentTime);
        lfoGain.gain.setValueAtTime(3.0, audioCtx.currentTime);
        lfo.connect(osc.detune);
        lfo.start();

        pGain.gain.setValueAtTime(p.gain, audioCtx.currentTime);
        osc.connect(pGain);
        pGain.connect(filter);
        osc.start();

        tanpuraNodes.push(osc, lfo, pGain);
      });
    } catch (e) {
      console.warn('Tanpura audio note:', e);
    }
  }

  function stopTanpura() {
    tanpuraNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    tanpuraNodes = [];
    if (tanpuraGain) {
      try {
        tanpuraGain.disconnect();
      } catch (e) {}
      tanpuraGain = null;
    }
  }

  function toggleTanpura() {
    isTanpuraOn = !isTanpuraOn;
    if (tanpuraToggleBtn) {
      tanpuraToggleBtn.classList.toggle('active', isTanpuraOn);
      const label = document.getElementById('tanpura-label');
      if (label) label.textContent = `Tanpura: ${isTanpuraOn ? 'On' : 'Off'}`;
    }
    if (isTanpuraOn) {
      startTanpura();
    } else {
      stopTanpura();
    }
  }

  function toggleSfx() {
    isSfxOn = !isSfxOn;
    if (sfxToggleBtn) {
      sfxToggleBtn.classList.toggle('active', isSfxOn);
      const label = document.getElementById('sfx-label');
      if (label) label.textContent = `Sound: ${isSfxOn ? 'On' : 'Off'}`;
    }
  }

  // SFX Synthesizers
  function playBellSound() {
    if (!isSfxOn) return;
    initAudioContext();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const ratios = [1.0, 2.0, 3.01, 4.15, 5.43];
      const baseFreq = 587.33; // D5

      ratios.forEach((r, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * r, now);

        const decay = 2.4 / (idx + 1);
        gain.gain.setValueAtTime(0.22 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + decay);
      });
    } catch (e) {}
  }

  function playPouringSound() {
    if (!isSfxOn) return;
    initAudioContext();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const bufferSize = audioCtx.sampleRate * 2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(1400, now + 1.8);
      filter.Q.setValueAtTime(4.0, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 2.0);
    } catch (e) {}
  }

  function playChimeSound() {
    if (!isSfxOn) return;
    initAudioContext();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 1.8);
      });
    } catch (e) {}
  }

  function playDhoopSound() {
    if (!isSfxOn) return;
    initAudioContext();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const freqs = [659.25, 987.77, 1318.51];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.08 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 2.4);
      });
    } catch (e) {}
  }

  // Particle & Botanical Flower Sprites Engine
  function setupCanvas() {
    if (!canvas || !deityImg) return;
    const rect = deityImg.getBoundingClientRect();
    canvas.width = rect.width || 440;
    canvas.height = rect.height || 410;
  }

  window.addEventListener('resize', setupCanvas);

  class BotanicalParticle {
    constructor(category, subtype, x, y) {
      this.category = category; // 'fluid' | 'flower' | 'sparkle'
      this.subtype = subtype;   // 'milk' | 'water' | 'honey' | 'lotus' | 'marigold' | 'jasmine' | 'tulsi' | 'sparkle'
      this.x = x;
      this.y = y;
      this.life = 1;
      this.decay = 0.006 + Math.random() * 0.008;
      this.isSettled = false;
      this.size = Math.random() * 6 + 5;
      this.vx = (Math.random() - 0.5) * 1.6;
      this.vy = Math.random() * 2.2 + 1.6;
      this.angle = Math.random() * Math.PI * 2;
      this.vAngle = (Math.random() - 0.5) * 0.06;
      this.wobble = Math.random() * Math.PI * 2;

      if (category === 'fluid') {
        if (subtype === 'milk') {
          this.color = '#ffffff';
          this.size = Math.random() * 5 + 3;
          this.vy = Math.random() * 4 + 3.5;
        } else if (subtype === 'water') {
          this.color = 'rgba(186, 230, 253, 0.85)';
          this.size = Math.random() * 4 + 2;
          this.vy = Math.random() * 4 + 3;
        } else if (subtype === 'honey') {
          this.color = 'rgba(245, 158, 11, 0.9)';
          this.size = Math.random() * 6 + 4;
          this.vy = Math.random() * 2.5 + 1.5;
        }
      } else if (category === 'flower') {
        this.size = Math.random() * 8 + 7;
        this.targetY = (canvas.height || 410) - 12 - (Math.random() * 28);
      } else if (category === 'sparkle') {
        this.color = '#fef08a';
        this.size = Math.random() * 3 + 2;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.decay = 0.02 + Math.random() * 0.02;
      }
    }

    update() {
      if (this.isSettled) return;

      if (this.category === 'flower') {
        this.x += Math.sin(this.y * 0.04 + this.wobble) * 1.5;
        this.y += this.vy;
        this.angle += this.vAngle;

        // Check if settled at bottom base of vigraha
        if (this.y >= this.targetY) {
          this.isSettled = true;
          this.y = this.targetY;
          settledPetals.push(this);
        }
      } else {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.vAngle;
        this.life -= this.decay;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.isSettled ? 0.92 : this.life);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      if (this.category === 'flower') {
        if (this.subtype === 'lotus') {
          // Pink Lotus Petal
          const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, this.size);
          grad.addColorStop(0, '#fbcfe8');
          grad.addColorStop(0.6, '#f472b6');
          grad.addColorStop(1, '#db2777');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.subtype === 'marigold') {
          // Golden Genda Petal
          const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, this.size);
          grad.addColorStop(0, '#fef08a');
          grad.addColorStop(0.5, '#fbbf24');
          grad.addColorStop(1, '#d97706');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size * 0.85, this.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.subtype === 'jasmine') {
          // White Starry Jasmine Blossom
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.ellipse(
              Math.cos((i * Math.PI * 2) / 5) * (this.size * 0.45),
              Math.sin((i * Math.PI * 2) / 5) * (this.size * 0.45),
              this.size * 0.4,
              this.size * 0.2,
              (i * Math.PI * 2) / 5,
              0,
              Math.PI * 2
            );
          }
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 0.18, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.subtype === 'tulsi') {
          // Sacred Tulsi Leaf with Manjari tip
          const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, this.size);
          grad.addColorStop(0, '#86efac');
          grad.addColorStop(0.5, '#22c55e');
          grad.addColorStop(1, '#15803d');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size * 1.1, this.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          // Leaf vein
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-this.size * 0.9, 0);
          ctx.lineTo(this.size * 0.9, 0);
          ctx.stroke();
        }
      } else if (this.category === 'sparkle') {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Fluid Drop
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function renderCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw settled accumulated petals at the lotus feet
    for (let i = 0; i < settledPetals.length; i++) {
      settledPetals[i].draw(ctx);
    }

    // Update and draw active airborne particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      if (!p.isSettled) {
        p.draw(ctx);
      }
      if (p.isSettled || p.life <= 0 || p.y > canvas.height + 30) {
        particles.splice(i, 1);
      }
    }

    animFrameId = requestAnimationFrame(renderCanvas);
  }

  renderCanvas();

  // Interactive Flower Scattering & Clearing
  function scatterSettledFlowers() {
    if (settledPetals.length === 0) return;
    playChimeSound();
    const w = canvas.width || 440;
    
    settledPetals.forEach(p => {
      p.isSettled = false;
      p.life = 0.95;
      p.decay = 0.02 + Math.random() * 0.02;
      p.vx = (p.x - w * 0.5) * 0.035 + (Math.random() - 0.5) * 3.5;
      p.vy = -2.8 - Math.random() * 3.5;
      particles.push(p);
    });

    settledPetals = [];
    flowerOfferingCount = 0;
    updateToast('॥ पुष्प विसर्जन ॥', 'Flowers gently scattered in reverence.');
  }

  if (canvas) {
    canvas.addEventListener('click', scatterSettledFlowers);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      scatterSettledFlowers();
    });
  }

  // Spawners
  function spawnFluidStream(subtype, durationMs = 2800) {
    setupCanvas();
    const w = canvas.width || 440;
    const startTime = Date.now();

    const emitter = setInterval(() => {
      if (Date.now() - startTime > durationMs) {
        clearInterval(emitter);
        return;
      }
      for (let i = 0; i < 4; i++) {
        const x = w * 0.5 + (Math.random() - 0.5) * (w * 0.28);
        particles.push(new BotanicalParticle('fluid', subtype, x, -5));
      }
    }, 30);
  }

  function spawnBotanicalFlowers(count = 42) {
    setupCanvas();
    const w = canvas.width || 440;
    const flowerTypes = ['lotus', 'marigold', 'jasmine', 'tulsi'];

    // Pile-up Logic: 1 to 5 accumulate, 6th resets
    flowerOfferingCount++;
    if (flowerOfferingCount > 5) {
      settledPetals = []; // Clear settled pile
      flowerOfferingCount = 1;
    }

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        const x = Math.random() * (w * 0.85) + (w * 0.075);
        const y = -10 - Math.random() * 40;
        particles.push(new BotanicalParticle('flower', type, x, y));
      }, i * 35);
    }
  }

  function spawnSparkles(count = 35) {
    setupCanvas();
    const w = canvas.width || 440;
    const h = canvas.height || 410;
    for (let i = 0; i < count; i++) {
      particles.push(new BotanicalParticle('sparkle', 'sparkle', w * 0.5 + (Math.random() - 0.5) * 130, h * 0.45 + (Math.random() - 0.5) * 130));
    }
  }

  function updateToast(shloka, desc) {
    if (toastShloka) toastShloka.textContent = shloka;
    if (toastDesc) toastDesc.textContent = desc;
    if (toastEl) {
      toastEl.style.transform = 'scale(1.02)';
      toastEl.style.borderColor = 'var(--gold-primary)';
      setTimeout(() => {
        toastEl.style.transform = 'scale(1)';
        toastEl.style.borderColor = 'rgba(245, 166, 35, 0.35)';
      }, 400);
    }
  }

  function clearActiveOverlays() {
    stopAarti();
    if (dhoopOverlay) dhoopOverlay.style.display = 'none';
    if (tilakOverlay) tilakOverlay.style.display = 'none';
    if (tulsiOverlay) tulsiOverlay.style.display = 'none';
    if (naivedyaOverlay) naivedyaOverlay.style.display = 'none';
    if (activeOfferingTimeout) clearTimeout(activeOfferingTimeout);
  }

  // Synchronized Aarti & Continuous Temple Bell Controller
  function startAarti(phase) {
    isAartiActive = true;
    activeAartiPhase = phase;

    if (aartiOverlay) aartiOverlay.style.display = 'block';

    // Play first bell chime immediately and loop in rhythmic cadence
    playBellSound();
    if (aartiBellInterval) clearInterval(aartiBellInterval);
    aartiBellInterval = setInterval(playBellSound, 950);

    spawnSparkles(50);

    if (phase === 'abhisheka') {
      if (btnAartiAbh) btnAartiAbh.classList.add('active-aarti');
      if (aartiIconAbh) aartiIconAbh.textContent = '🛑';
      if (aartiLabelSanskritAbh) aartiLabelSanskritAbh.textContent = 'आरती विराम';
      if (aartiLabelEngAbh) aartiLabelEngAbh.textContent = 'Stop Aarti';
      updateToast('॥ वसुदेवसुतं देवं कंसचाणूरमर्दनम् । देवकीपरमानन्दं कृष्णं वन्दे जगद्गुरुम् ॥', 'I offer my salutations to Lord Krishna, the son of Vasudeva, the supreme bliss of mother Devaki, the Guru of the universe.');
    } else {
      if (btnAartiMaha) btnAartiMaha.classList.add('active-aarti');
      if (aartiIconMaha) aartiIconMaha.textContent = '🛑';
      if (aartiLabelSanskritMaha) aartiLabelSanskritMaha.textContent = 'आरती विराम';
      if (aartiLabelEngMaha) aartiLabelEngMaha.textContent = 'Stop Aarti';
      updateToast('॥ ॐ जय जगदीश हरे • मङ्गलं भगवान विष्णुः ॥', 'Performing the glorious Deepa Maha Aarti with continuous temple bell chimes.');
    }
  }

  function stopAarti() {
    isAartiActive = false;
    activeAartiPhase = null;

    if (aartiBellInterval) {
      clearInterval(aartiBellInterval);
      aartiBellInterval = null;
    }

    if (aartiOverlay) aartiOverlay.style.display = 'none';

    // Reset Abhisheka Button
    if (btnAartiAbh) btnAartiAbh.classList.remove('active-aarti');
    if (aartiIconAbh) aartiIconAbh.textContent = '🪔';
    if (aartiLabelSanskritAbh) aartiLabelSanskritAbh.textContent = 'कर्पूर आरती';
    if (aartiLabelEngAbh) aartiLabelEngAbh.textContent = 'Camphor Aarti';

    // Reset Mahapooja Button
    if (btnAartiMaha) btnAartiMaha.classList.remove('active-aarti');
    if (aartiIconMaha) aartiIconMaha.textContent = '🪔';
    if (aartiLabelSanskritMaha) aartiLabelSanskritMaha.textContent = 'महा आरती';
    if (aartiLabelEngMaha) aartiLabelEngMaha.textContent = 'Deepa Maha Aarti';
  }

  function toggleAarti(phase) {
    if (isAartiActive && activeAartiPhase === phase) {
      stopAarti();
      updateToast('॥ श्रीकृष्णार्पणमस्तु ॥', 'Aarti concludes in peaceful serenity.');
    } else {
      clearActiveOverlays();
      startAarti(phase);
    }
  }

  function setPhase(phase) {
    currentPhase = phase;
    clearActiveOverlays();
    particles = [];
    settledPetals = [];
    flowerOfferingCount = 0;

    if (phase === 'mahapooja') {
      if (tabAbhisheka) {
        tabAbhisheka.classList.remove('active');
        tabAbhisheka.setAttribute('aria-selected', 'false');
      }
      if (tabMahapooja) {
        tabMahapooja.classList.add('active');
        tabMahapooja.setAttribute('aria-selected', 'true');
      }
      if (abhishekaTray) abhishekaTray.style.display = 'none';
      if (mahapoojaTray) mahapoojaTray.style.display = 'flex';

      if (deityImg) {
        deityImg.style.opacity = '0';
        setTimeout(() => {
          deityImg.src = 'assets/images/vp_b.jpeg';
          deityImg.alt = 'Bhagavan Sri Krishna - Mahapooja Alankara Darshana';
          deityImg.style.opacity = '1';
        }, 300);
      }

      updateToast('॥ ॐ नमो भगवते वासुदेवाय ॥', 'Select an offering from the seva dock to perform your Mahapooja.');
      history.replaceState(null, '', '#pooja/mahapooja');
    } else {
      // Abhisheka
      if (tabAbhisheka) {
        tabAbhisheka.classList.add('active');
        tabAbhisheka.setAttribute('aria-selected', 'true');
      }
      if (tabMahapooja) {
        tabMahapooja.classList.remove('active');
        tabMahapooja.setAttribute('aria-selected', 'false');
      }
      if (abhishekaTray) abhishekaTray.style.display = 'flex';
      if (mahapoojaTray) mahapoojaTray.style.display = 'none';

      if (deityImg) {
        deityImg.style.opacity = '0';
        setTimeout(() => {
          deityImg.src = 'assets/images/vp_a.jpeg';
          deityImg.alt = 'Bhagavan Sri Krishna - Sacred Vigraha';
          deityImg.style.opacity = '1';
        }, 300);
      }

      updateToast('॥ श्रीकृष्ण शरणं मम ॥', 'Select an offering from the seva dock to perform your Abhisheka.');
      history.replaceState(null, '', '#pooja/abhisheka');
    }
  }

  // Welcome Modal Handling
  function openWelcomeModal() {
    if (!welcomeModal) return;
    welcomeModal.style.display = 'flex';
    welcomeModal.classList.add('active');
    welcomeModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeWelcomeModal() {
    if (!welcomeModal) return;
    welcomeModal.classList.remove('active');
    welcomeModal.setAttribute('aria-hidden', 'true');
    welcomeModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function selectSevaAndEnter(phase) {
    initAudioContext();
    startTanpura();
    closeWelcomeModal();
    setPhase(phase);
  }

  // Offerings Handlers
  function handleMilkOffering() {
    stopAarti();
    playPouringSound();
    spawnFluidStream('milk', 3000);
    updateToast('॥ ॐ नमः क्षीरधाराभिषेकाय ॥', 'Offering pure sacred milk abhisheka unto the Vigraha.');
  }

  function handleWaterOffering() {
    stopAarti();
    playPouringSound();
    spawnFluidStream('water', 2800);
    updateToast('॥ गङ्गे च यमुने चैव गोदावरि सरस्वति ॥', 'Offering holy consecrated Ganga water abhisheka with divine sparkles.');
  }

  function handleHoneyOffering() {
    stopAarti();
    playPouringSound();
    spawnFluidStream('honey', 3200);
    updateToast('॥ ॐ मधु वाता ऋतायते मधु क्षरन्ति सिन्धवः ॥', 'Offering sweet golden honey nectar abhisheka unto the Lord.');
  }

  function handleFlowersAbhisheka() {
    stopAarti();
    playChimeSound();
    spawnBotanicalFlowers(40);
    updateToast('॥ तुलसीदलपुष्पाणि समर्पयामि ॥', 'Offering fresh lotus petals and sacred Tulsi leaves at the lotus feet.');
  }

  function handleDhoopOffering() {
    stopAarti();
    playDhoopSound();
    clearActiveOverlays();
    if (dhoopOverlay) dhoopOverlay.style.display = 'block';
    spawnSparkles(25);
    updateToast('॥ ॐ वनस्पतिरसो दिव्यो गन्धाढ्यो गन्ध उत्तमः । आघ्रेयः सर्वदेवानां धूपोऽयं प्रतिगृह्यताम् ॥', 'Offering sacred fragrant Dhoop incense smoke unto the Lord.');

    activeOfferingTimeout = setTimeout(() => {
      if (dhoopOverlay) dhoopOverlay.style.display = 'none';
    }, 5500);
  }

  function handleAartiAbhisheka() {
    toggleAarti('abhisheka');
  }

  function handleGandhaOffering() {
    stopAarti();
    playChimeSound();
    if (tilakOverlay) tilakOverlay.style.display = 'block';
    spawnSparkles(35);
    updateToast('॥ दिव्यं गन्धं चन्दनं समर्पयामि ॥', 'Offering fragrant Malayaja Sandalwood Gandha paste with golden aura.');
  }

  function handleTulsiOffering() {
    stopAarti();
    playChimeSound();
    if (tulsiOverlay) tulsiOverlay.style.display = 'block';
    spawnBotanicalFlowers(25);
    updateToast('॥ श्रीतुलसी मञ्जरीं समर्पयामि ॥', 'Offering auspicious sacred Tulsi Manjari sprigs at the lotus feet.');
  }

  function handleNaivedyaOffering() {
    stopAarti();
    playChimeSound();
    clearActiveOverlays();
    if (naivedyaOverlay) naivedyaOverlay.style.display = 'flex';
    spawnSparkles(35);
    updateToast('॥ नवनीतं पायसं फलानि च समर्पयामि ॥', 'Offering freshly churned sweet butter and sacred fruits at the lotus feet.');

    activeOfferingTimeout = setTimeout(() => {
      if (naivedyaOverlay) naivedyaOverlay.style.display = 'none';
    }, 6000);
  }

  function handleFlowersMahapooja() {
    stopAarti();
    playChimeSound();
    spawnBotanicalFlowers(45);
    updateToast('॥ नानाविध सुगन्ध पुष्पाणि समर्पयामि ॥', 'Offering grand Pushpa Archana with cascading blossoms.');
  }

  function handleBellOffering() {
    stopAarti();
    playBellSound();
    spawnSparkles(30);
    updateToast('॥ आगमार्थं तु देवानां घण्टानादं करोम्यहम् ॥', 'Ringing the consecrated brass temple bell with divine resonance.');
  }

  function handleMahaAartiOffering() {
    toggleAarti('mahapooja');
  }

  // Continuous Mantra Ticker Rotation
  const mantras = [
    'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे । हरे राम हरे राम राम राम हरे हरे ॥',
    'ॐ नमो भगवते वासुदेवाय ॥',
    'कस्तूरीतिलकं ललाटपटले वक्षःस्थले कौस्तुभम् । नासाग्रे वरमौक्तिकं करतले वेणुं करे कङ्कणम् ॥',
    'कृष्णाय वासुदेवाय हरये परमात्मने । प्रणतक्लेशनाशाय गोविन्दाय नमो नमः ॥',
    'वसुदेवसुतं देवं कंसचाणूरमर्दनम् । देवकीपरमानन्दं कृष्णं वन्दे जगद्गुरुम् ॥'
  ];
  let mantraIdx = 0;
  setInterval(() => {
    mantraIdx = (mantraIdx + 1) % mantras.length;
    if (tickerText) {
      tickerText.style.opacity = '0';
      setTimeout(() => {
        tickerText.textContent = mantras[mantraIdx];
        tickerText.style.opacity = '1';
      }, 300);
    }
  }, 7000);

  // Global showPoojaView & audio controller exports
  window.showPoojaView = function (phase) {
    if (landingView) landingView.style.display = 'none';
    if (gitaView) gitaView.style.display = 'none';
    if (poojaView) poojaView.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (phase === 'mahapooja' || phase === 'alankara') {
      selectSevaAndEnter('mahapooja');
    } else if (phase === 'abhisheka') {
      selectSevaAndEnter('abhisheka');
    } else {
      setPhase('abhisheka');
      openWelcomeModal();
    }
  };

  window.stopVirtualPoojaAudio = function () {
    stopAarti();
    stopTanpura();
  };

  // Wire Event Listeners
  if (cardAbhisheka) cardAbhisheka.addEventListener('click', () => selectSevaAndEnter('abhisheka'));
  if (btnEnterAbhisheka) btnEnterAbhisheka.addEventListener('click', (e) => { e.stopPropagation(); selectSevaAndEnter('abhisheka'); });
  if (cardMahapooja) cardMahapooja.addEventListener('click', () => selectSevaAndEnter('mahapooja'));
  if (btnEnterMahapooja) btnEnterMahapooja.addEventListener('click', (e) => { e.stopPropagation(); selectSevaAndEnter('mahapooja'); });

  if (welcomeCloseBtn) welcomeCloseBtn.addEventListener('click', () => selectSevaAndEnter(currentPhase));
  if (welcomeModal) {
    welcomeModal.addEventListener('click', (e) => {
      if (e.target === welcomeModal) selectSevaAndEnter(currentPhase);
    });
  }

  if (tabAbhisheka) tabAbhisheka.addEventListener('click', () => setPhase('abhisheka'));
  if (tabMahapooja) tabMahapooja.addEventListener('click', () => setPhase('mahapooja'));
  if (toMahapoojaBtn) toMahapoojaBtn.addEventListener('click', () => setPhase('mahapooja'));
  if (toAbhishekaBtn) toAbhishekaBtn.addEventListener('click', () => setPhase('abhisheka'));

  if (tanpuraToggleBtn) tanpuraToggleBtn.addEventListener('click', toggleTanpura);
  if (sfxToggleBtn) sfxToggleBtn.addEventListener('click', toggleSfx);
  if (changeSevaBtn) changeSevaBtn.addEventListener('click', openWelcomeModal);

  function returnToLanding(showBlessing = false) {
    stopAarti();
    stopTanpura();
    clearActiveOverlays();
    closeWelcomeModal();

    if (showBlessing) {
      updateToast('॥ श्रीकृष्णार्पणमस्तु ॥', 'Pooja completed with devotion. Returning to the celestial portal...');
      spawnSparkles(40);
      setTimeout(() => {
        if (poojaView) poojaView.style.display = 'none';
        if (landingView) landingView.style.display = 'block';
        history.pushState(null, '', window.location.pathname);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1000);
    } else {
      if (poojaView) poojaView.style.display = 'none';
      if (landingView) landingView.style.display = 'block';
      history.pushState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (backToHomeBtn) backToHomeBtn.addEventListener('click', () => returnToLanding(false));
  if (completePoojaBtn) completePoojaBtn.addEventListener('click', () => returnToLanding(true));

  if (cardPuja) {
    cardPuja.addEventListener('click', (e) => {
      e.preventDefault();
      window.showPoojaView();
    });
    cardPuja.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.showPoojaView();
      }
    });
  }

  if (footerPujaLink) {
    footerPujaLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.showPoojaView();
    });
  }

  // Offering Buttons
  document.getElementById('btn-offer-milk')?.addEventListener('click', handleMilkOffering);
  document.getElementById('btn-offer-water')?.addEventListener('click', handleWaterOffering);
  document.getElementById('btn-offer-honey')?.addEventListener('click', handleHoneyOffering);
  document.getElementById('btn-offer-flowers-abh')?.addEventListener('click', handleFlowersAbhisheka);
  document.getElementById('btn-offer-dhoop-abh')?.addEventListener('click', handleDhoopOffering);
  document.getElementById('btn-offer-aarti-abh')?.addEventListener('click', handleAartiAbhisheka);

  document.getElementById('btn-offer-gandha')?.addEventListener('click', handleGandhaOffering);
  document.getElementById('btn-offer-tulsi')?.addEventListener('click', handleTulsiOffering);
  document.getElementById('btn-offer-dhoop-maha')?.addEventListener('click', handleDhoopOffering);
  document.getElementById('btn-offer-naivedya')?.addEventListener('click', handleNaivedyaOffering);
  document.getElementById('btn-offer-flowers-maha')?.addEventListener('click', handleFlowersMahapooja);
  document.getElementById('btn-offer-bell')?.addEventListener('click', handleBellOffering);
  document.getElementById('btn-offer-maha-aarti')?.addEventListener('click', handleMahaAartiOffering);
}

