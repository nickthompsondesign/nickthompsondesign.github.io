/* =============================================
   Nick Thompson Design — shared.js
   Works on index.html and all sub-pages.
   Detects which page it's on via body class.
   ============================================= */

const IS_INDEX = document.body.classList.contains('index-page');
const IS_SUB   = document.body.classList.contains('sub-page');

// ── Preloader ──
const minPreloaderTime = 1800;
const initTime = Date.now();

function dismissPreloader() {
  const remaining = Math.max(0, minPreloaderTime - (Date.now() - initTime));
  setTimeout(() => {
    document.getElementById('preloader').classList.add('fade-out');
    document.body.classList.add('loaded');
  }, remaining);
}
if (document.readyState === 'complete') {
  dismissPreloader();
} else {
  window.addEventListener('load', dismissPreloader);
  setTimeout(dismissPreloader, 6000);
}

// ── Scroll header ──
const header = document.querySelector('header');

if (IS_INDEX) {
  // Index: transitions between dark (over hero) and light (over content)
  const getHeroH = () => document.querySelector('.hero-wrapper').offsetHeight;
  const updateHeader = () => {
    const y = window.scrollY;
    if (y < 20) {
      header.classList.remove('scrolled','scrolled-dark','scrolled-light');
    } else if (y < getHeroH() - 80) {
      header.classList.add('scrolled','scrolled-dark');
      header.classList.remove('scrolled-light');
    } else {
      header.classList.add('scrolled','scrolled-light');
      header.classList.remove('scrolled-dark');
    }
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}

if (IS_SUB) {
  // Sub-pages: transitions between dark (over hero bg) and light (over white content)
  const heroBg = document.querySelector('.hero-bg-wrapper');
  const updateHeaderSub = () => {
    const y = window.scrollY;
    const threshold = heroBg ? heroBg.offsetHeight - 80 : 300;
    if (y < 20) {
      header.classList.remove('scrolled-dark','scrolled-light');
    } else if (y < threshold) {
      header.classList.add('scrolled-dark');
      header.classList.remove('scrolled-light');
    } else {
      header.classList.add('scrolled-light');
      header.classList.remove('scrolled-dark');
    }
  };
  window.addEventListener('scroll', updateHeaderSub, { passive: true });
  updateHeaderSub();

// Mobile & Desktop Layout Adjustments (sub-pages only)
  function adjustSubPageLayout() {
    const metaBox = document.querySelector('.project-meta-light');
    const heroBg = document.querySelector('.hero-bg-wrapper');
    const projectHero = document.querySelector('.project-hero');

    if (metaBox && projectHero) {
      // 1. Calculate exactly half the height of the white box
      const overlapAmount = metaBox.offsetHeight / 2;
      
      // 2. Pull the white box up by that exact amount (Half-in, half-out effect)
      metaBox.style.marginTop = `-${overlapAmount}px`;
      
      // 3. Add that same amount (plus 40px of breathing room) as empty padding 
      // to the bottom of the hero section so the text NEVER gets covered!
      projectHero.style.paddingBottom = `${overlapAmount + 40}px`;
    }

    // 4. Stretch the animated background to cover this newly calculated height
    if (heroBg && projectHero) {
      heroBg.style.height = `${projectHero.offsetHeight}px`;
      heroBg.style.minHeight = 'auto';
    }
  }
  
  adjustSubPageLayout();
  window.addEventListener('load', adjustSubPageLayout);
  window.addEventListener('resize', adjustSubPageLayout);
}

// ── Hamburger ──
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Smooth scroll (index only — hash links) ──
if (IS_INDEX) {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

// ── Interactive bubble — desktop only ──
if (window.innerWidth >= 1024) {
  const interBubble = document.querySelector('.interactive');
  if (interBubble) {
    let curX=0, curY=0, tgX=0, tgY=0;
    const move = () => {
      curX += (tgX-curX)/25; curY += (tgY-curY)/25;
      interBubble.style.transform = `translate(${Math.round(curX)}px,${Math.round(curY)}px)`;
      requestAnimationFrame(move);
    };
    window.addEventListener('mousemove', e => { tgX=e.clientX; tgY=e.clientY; }, { passive: true });
    move();
  }
}

// ── Square box tilt — index desktop only ──
if (IS_INDEX && window.innerWidth >= 1024) {
  const box = document.querySelector('.square-box');
  if (box) {
    let tilting = false, isTicking = false;
    setTimeout(() => { tilting = true; }, 3500);
    window.addEventListener('mousemove', e => {
      if (!tilting || isTicking) return;
      isTicking = true;
      window.requestAnimationFrame(() => {
        const dx = (e.clientX / window.innerWidth - 0.5) * 2;
        const dy = (e.clientY / window.innerHeight - 0.5) * 2;
        box.style.transition = 'transform 0.1s ease-out';
        box.style.transform = `perspective(1000px) rotateX(${dy*-6}deg) rotateY(${dx*6}deg) scale(1)`;
        isTicking = false;
      });
    }, { passive: true });
    window.addEventListener('mouseleave', () => {
      box.style.transition = 'transform 0.6s var(--ease-smooth)';
      box.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }
}

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));
