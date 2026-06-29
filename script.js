/* ═══════════════════════════════════════════════
   PesoRápido — script.js
   All interactivity, animations, and UX logic
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ────────────────────────────────────────────
     1. NAV — scroll behavior
  ──────────────────────────────────────────── */
  const nav = document.getElementById('nav');

  function handleNavScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();


  /* ────────────────────────────────────────────
     2. STICKY BOTTOM BAR
  ──────────────────────────────────────────── */
  const stickyBar = document.getElementById('stickyBar');
  let stickyVisible = false;

  function handleStickyBar() {
    const heroHeight = document.querySelector('.hero').offsetHeight;
    const shouldShow = window.scrollY > heroHeight * 0.6;

    if (shouldShow && !stickyVisible) {
      stickyBar.classList.add('visible');
      stickyVisible = true;
    } else if (!shouldShow && stickyVisible) {
      stickyBar.classList.remove('visible');
      stickyVisible = false;
    }
  }

  window.addEventListener('scroll', handleStickyBar, { passive: true });


  /* ────────────────────────────────────────────
     3. SCROLL-TRIGGERED REVEAL (AOS-lite)
  ──────────────────────────────────────────── */
  const aosElements = document.querySelectorAll('[data-aos]');

  const aosObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings slightly
          const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-aos]'));
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('aos-visible');
          }, idx * 80);
          aosObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  aosElements.forEach((el) => aosObserver.observe(el));


  /* ────────────────────────────────────────────
     4. COUNTER ANIMATION (stats)
  ──────────────────────────────────────────── */
  const statNums = document.querySelectorAll('.stat__num[data-target]');
  let countersStarted = false;

  function formatNumber(n, suffix) {
    if (suffix === '%') return n + '%';
    if (suffix === '★') return (n / 10).toFixed(1) + '★';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M+';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K+';
    return n.toString();
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = formatNumber(current, suffix);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting) && !countersStarted) {
        countersStarted = true;
        statNums.forEach((el) => animateCounter(el));
      }
    },
    { threshold: 0.3 }
  );

  const heroStats = document.querySelector('.hero__stats');
  if (heroStats) statsObserver.observe(heroStats);


  /* ────────────────────────────────────────────
     5. ACTIVE USERS — random increment
  ──────────────────────────────────────────── */
  const activeUsersEl = document.getElementById('activeUsers');
  let currentUsers = 12847;

  function updateActiveUsers() {
    const delta = Math.floor(Math.random() * 5) - 1; // -1 to +3
    currentUsers = Math.max(12000, currentUsers + delta);
    activeUsersEl.textContent = currentUsers.toLocaleString('es-MX');
  }

  setInterval(updateActiveUsers, 3500);


  /* ────────────────────────────────────────────
     6. PHONE MOCKUP — loan counter animation
  ──────────────────────────────────────────── */
  const loanCounter = document.getElementById('loanCounter');
  const approvalBar = document.getElementById('approvalBar');
  let loanAnimationRunning = false;

  const LOAN_AMOUNTS = [5000, 8000, 10000, 15000, 20000];
  let loanIndex = 0;

  function animateLoanCounter() {
    const target = LOAN_AMOUNTS[loanIndex % LOAN_AMOUNTS.length];
    loanIndex++;

    // Reset bar
    approvalBar.style.width = '0%';
    loanCounter.textContent = '0';

    // Animate bar
    setTimeout(() => {
      approvalBar.style.width = '100%';
    }, 100);

    // Animate counter
    const duration = 2000;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      const current = Math.round(eased * target);
      loanCounter.textContent = current.toLocaleString('es-MX');
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Wait then restart
        setTimeout(animateLoanCounter, 2800);
      }
    }

    requestAnimationFrame(tick);
  }

  // Trigger once phone is visible
  const phoneObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loanAnimationRunning) {
        loanAnimationRunning = true;
        animateLoanCounter();
      }
    },
    { threshold: 0.3 }
  );

  const phoneWrap = document.querySelector('.hero__phone-wrap');
  if (phoneWrap) phoneObserver.observe(phoneWrap);
  // Start immediately on mobile (no phone visible)
  if (!phoneWrap || window.innerWidth <= 600) {
    animateLoanCounter();
  }


  /* ────────────────────────────────────────────
     7. FAQ ACCORDION
  ──────────────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-item__q');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach((f) => {
        f.classList.remove('open');
        f.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ────────────────────────────────────────────
     8. BROWSER DETECTION — FB / Instagram WebView
  ──────────────────────────────────────────── */
  function isInAppBrowser() {
    const ua = navigator.userAgent || '';
    return (
      /FBAN|FBAV|FB_IAB|Instagram|Twitter|Line\/|MicroMessenger|QQ\//.test(ua) ||
      (ua.includes('iPhone') && !ua.includes('Safari')) ||
      (ua.includes('Android') && ua.includes('wv'))
    );
  }

  const browserModal = document.getElementById('browserModal');
  const openChromeBtn = document.getElementById('openChrome');
  const copyLinkBtn = document.getElementById('copyLink');
  const copiedMsg = document.getElementById('copiedMsg');
  const closeModalBtn = document.getElementById('closeModal');

  const DOWNLOAD_URL = 'https://play.google.com/store/apps/details?id=com.pesorapido.prestamos';
  const PAGE_URL = window.location.href;

  function showModal() {
    browserModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    browserModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // All download buttons
  const downloadBtns = [
    document.getElementById('heroDownloadBtn'),
    document.getElementById('mainDownloadBtn'),
    document.getElementById('stickyDownloadBtn'),
  ];

  downloadBtns.forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isInAppBrowser()) {
        showModal();
      } else {
        window.location.href = DOWNLOAD_URL;
      }
    });
  });

  // Also catch all [href="#download"] anchor links that are NOT the explicit download buttons
  document.querySelectorAll('a[href="#download"]').forEach((link) => {
    if (!downloadBtns.includes(link)) return;
  });

  openChromeBtn && openChromeBtn.addEventListener('click', () => {
    window.location.href = 'intent://' + PAGE_URL.replace(/^https?:\/\//, '') +
      '#Intent;scheme=https;package=com.android.chrome;end';
    setTimeout(() => { window.location.href = DOWNLOAD_URL; }, 1000);
  });

  copyLinkBtn && copyLinkBtn.addEventListener('click', () => {
    navigator.clipboard
      .writeText(PAGE_URL)
      .then(() => {
        copiedMsg.classList.add('visible');
        setTimeout(() => copiedMsg.classList.remove('visible'), 2500);
      })
      .catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = PAGE_URL;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copiedMsg.classList.add('visible');
        setTimeout(() => copiedMsg.classList.remove('visible'), 2500);
      });
  });

  closeModalBtn && closeModalBtn.addEventListener('click', hideModal);

  browserModal && browserModal.addEventListener('click', (e) => {
    if (e.target === browserModal) hideModal();
  });

  // Auto-show modal if in-app browser
  if (isInAppBrowser()) {
    setTimeout(showModal, 1200);
  }


  /* ────────────────────────────────────────────
     9. SMOOTH SCROLL for anchor links
  ──────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = anchor.getAttribute('href');
      if (target === '#' || target === '#download') return; // handled separately
      const el = document.querySelector(target);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ────────────────────────────────────────────
     10. CTA BUTTON — micro interaction (ripple)
  ──────────────────────────────────────────── */
  function addRipple(btn) {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;
        width:10px;height:10px;
        background:rgba(255,255,255,0.35);
        border-radius:50%;
        transform:translate(-50%,-50%) scale(0);
        left:${x}px;top:${y}px;
        animation:rippleAnim 0.55s ease-out forwards;
        pointer-events:none;
      `;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  // Inject ripple keyframes
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes rippleAnim {
      to { transform: translate(-50%,-50%) scale(28); opacity: 0; }
    }
  `;
  document.head.appendChild(rippleStyle);

  document.querySelectorAll('.btn--primary').forEach(addRipple);


  /* ────────────────────────────────────────────
     11. FEATURE CARDS — tilt on hover (desktop)
  ──────────────────────────────────────────── */
  const tiltCards = document.querySelectorAll('.feature-card, .testi-card, .safety-card, .step__content');

  if (window.matchMedia('(hover: hover)').matches) {
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = `translateY(-4px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }


  /* ────────────────────────────────────────────
     12. TRUST STRIP — scroll marquee on mobile
  ──────────────────────────────────────────── */
  const trustStrip = document.querySelector('.trust-strip__inner');

  if (window.innerWidth <= 600 && trustStrip) {
    const clone = trustStrip.innerHTML;
    trustStrip.innerHTML += clone; // duplicate for seamless loop

    const marqueeStyle = document.createElement('style');
    marqueeStyle.textContent = `
      @media (max-width: 600px) {
        .trust-strip { overflow: hidden; }
        .trust-strip__inner {
          flex-wrap: nowrap !important;
          animation: marquee 18s linear infinite;
          width: max-content;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      }
    `;
    document.head.appendChild(marqueeStyle);
  }


  /* ────────────────────────────────────────────
     13. DOWNLOAD SECTION — observe and animate badges
  ──────────────────────────────────────────── */
  const appBadges = document.querySelectorAll('.app-badge');

  const badgeObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        appBadges.forEach((badge, i) => {
          setTimeout(() => {
            badge.style.opacity = '1';
            badge.style.transform = 'translateX(0)';
          }, i * 120);
        });
        badgeObserver.disconnect();
      }
    },
    { threshold: 0.3 }
  );

  appBadges.forEach((badge) => {
    badge.style.opacity = '0';
    badge.style.transform = 'translateX(30px)';
    badge.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const downloadSection = document.querySelector('.download-cta');
  if (downloadSection) badgeObserver.observe(downloadSection);


  /* ────────────────────────────────────────────
     14. HERO ENTRANCE ANIMATION
  ──────────────────────────────────────────── */
  const heroElements = [
    document.querySelector('.hero__badge'),
    document.querySelector('.hero__title'),
    document.querySelector('.hero__sub'),
    document.querySelector('.hero__actions'),
    document.querySelector('.hero__stats'),
  ].filter(Boolean);

  heroElements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200 + i * 120);
  });

  const phoneWrapEl = document.querySelector('.hero__phone-wrap');
  if (phoneWrapEl) {
    phoneWrapEl.style.opacity = '0';
    phoneWrapEl.style.transform = 'translateX(32px) scale(0.96)';
    phoneWrapEl.style.transition = 'opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s';
    setTimeout(() => {
      phoneWrapEl.style.opacity = '1';
      phoneWrapEl.style.transform = 'translateX(0) scale(1)';
    }, 300);
  }


  /* ────────────────────────────────────────────
     15. STEPS — staggered reveal
  ──────────────────────────────────────────── */
  const stepCards = document.querySelectorAll('.step__content');
  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const steps = document.querySelectorAll('.step');
          steps.forEach((step, i) => {
            const content = step.querySelector('.step__content');
            if (content) {
              setTimeout(() => {
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
              }, i * 150);
            }
          });
          stepObserver.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );

  stepCards.forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, box-shadow 0.3s';
  });

  const stepsSection = document.querySelector('.how-it-works');
  if (stepsSection) stepObserver.observe(stepsSection);


  /* ────────────────────────────────────────────
     16. KEYBOARD ACCESSIBILITY — trap focus in modal
  ──────────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && browserModal.classList.contains('active')) {
      hideModal();
    }
  });

  console.log(
    '%cPesoRápido 💚',
    'font-size:20px;font-weight:bold;color:#00E676;background:#0A1628;padding:8px 16px;border-radius:8px;'
  );

})();
