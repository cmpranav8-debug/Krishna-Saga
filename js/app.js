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
  const particleCount = Math.min(Math.floor(width / 25), 45); // Responsive particle density

  class GoldParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2 + 0.8;
      this.speedY = Math.random() * 0.4 + 0.15; // Slow, tranquil upward drift
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.fadeSpeed = Math.random() * 0.005 + 0.002;
      this.fadingIn = true;
      // Warm palette: Gold, Saffron, Soft Starlight
      const colors = ['#ffd54f', '#f5a623', '#ffe082', '#ffab91', '#ffffff'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;

      // Pulse opacity gently
      if (this.fadingIn) {
        this.opacity += this.fadeSpeed;
        if (this.opacity >= 0.75) this.fadingIn = false;
      } else {
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0.1) this.fadingIn = true;
      }

      // Reset when particle floats off-screen
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

  // Initialize particle array
  for (let i = 0; i < particleCount; i++) {
    particles.push(new GoldParticle());
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/* ==========================================================================
   3. Portal Preview Modals
   Interactive previews for the 3 upcoming milestone sections.
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

  // Metadata for each portal card
  const portalData = {
    gita: {
      title: 'Bhagavad Gita Explorer',
      sanskrit: 'भगवद्गीता • The Song of the Divine',
      icon: 'assets/icons/shankha.svg',
      desc: 'You will be able to explore all 18 Chapters and 700 sacred verses with Sanskrit text, transliterations, word-by-word meanings, and commentaries from revered masters.',
      milestone: 'Planned for Milestone 2: Scripture Explorer & Chapter Selector',
      boxIcon: '📜'
    },
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
      milestone: 'Currently in Milestone 1: Visual Theme & Portal Foundation',
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

  // Connect portal cards
  const cards = document.querySelectorAll('.portal-card');
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

  // Header "About" button
  const aboutBtn = document.getElementById('open-about-btn');
  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => openModal('about'));
  }

  // Footer preview links
  document.getElementById('footer-gita-link')?.addEventListener('click', () => openModal('gita'));
  document.getElementById('footer-udupi-link')?.addEventListener('click', () => openModal('udupi'));
  document.getElementById('footer-puja-link')?.addEventListener('click', () => openModal('puja'));

  // Close handlers
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
