/* =============================================
   Nick Thompson Design — Shared JavaScript
   Used by all sub-pages (not index.html)
   ============================================= */

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

// ── Meta box overlap ──
function adjustMetaOverlap() {
  const metaBox = document.querySelector('.project-meta-light');
  if (metaBox) {
    metaBox.style.marginTop = `-${metaBox.offsetHeight / 2}px`;
  }
}
adjustMetaOverlap();
window.addEventListener('load', adjustMetaOverlap);
window.addEventListener('resize', adjustMetaOverlap);

// ── Scroll header colour ──
const header = document.querySelector('header');
const heroBg = document.querySelector('.hero-bg-wrapper');

const updateHeaderColor = () => {
  const y = window.scrollY;
  const threshold = heroBg ? heroBg.offsetHeight - 80 : 300;
  if (y < 20) {
    header.classList.remove('scrolled-dark', 'scrolled-light');
  } else if (y < threshold) {
    header.classList.add('scrolled-dark');
    header.classList.remove('scrolled-light');
  } else {
    header.classList.add('scrolled-light');
    header.classList.remove('scrolled-dark');
  }
};
window.addEventListener('scroll', updateHeaderColor, { passive: true });
updateHeaderColor();

// ── Hamburger ──
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
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

// ── Interactive fluid bubble (desktop only) ──
if (window.innerWidth >= 1024) {
  const interBubble = document.querySelector('.interactive');
  if (interBubble) {
    let curX = 0, curY = 0, tgX = 0, tgY = 0;
    const move = () => {
      curX += (tgX - curX) / 25;
      curY += (tgY - curY) / 25;
      interBubble.style.transform = `translate(${Math.round(curX)}px,${Math.round(curY)}px)`;
      requestAnimationFrame(move);
    };
    window.addEventListener('mousemove', e => {
      if (e.clientY < window.innerHeight) { tgX = e.clientX; tgY = e.clientY; }
    }, { passive: true });
    move();
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
