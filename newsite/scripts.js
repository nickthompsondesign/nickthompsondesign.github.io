/* =============================================
   Nick Thompson Design — Shared JavaScript
   Used by all sub-pages (not index.html)
   ============================================= */

// PRELOADER
const minPreloaderTime = 1800; // 1.8 seconds minimum
const initTime = Date.now();

function dismissPreloader() {
  const timeElapsed = Date.now() - initTime;
  const timeRemaining = Math.max(0, minPreloaderTime - timeElapsed);

  setTimeout(() => {
    document.getElementById('preloader').classList.add('fade-out');
    document.body.classList.add('loaded');
  }, timeRemaining);
}

if (document.readyState === 'complete') {
  dismissPreloader();
} else {
  window.addEventListener('load', dismissPreloader);
  setTimeout(dismissPreloader, 6000); 
}

// Scroll header — runs on load AND scroll
const header = document.querySelector('header');
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
updateHeader(); // run immediately on load

// Hamburger
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

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// Interactive bubble
const interBubble = document.querySelector('.interactive');
let curX=0,curY=0,tgX=0,tgY=0;
const move = () => {
  curX += (tgX-curX)/25; curY += (tgY-curY)/25;
  if(interBubble) {
    interBubble.style.transform = `translate(${Math.round(curX)}px,${Math.round(curY)}px)`;
  }
  requestAnimationFrame(move);
};
window.addEventListener('mousemove', e => { tgX=e.clientX; tgY=e.clientY; }, { passive: true });
move();

// Square box tilt 
const box = document.querySelector('.square-box');
let tilting = false;
let isTicking = false;

setTimeout(() => { tilting = true; }, 3500);

window.addEventListener('mousemove', e => {
  if (!tilting || !box) return;
  
  if (!isTicking) {
    window.requestAnimationFrame(() => {
      const dx = (e.clientX - window.innerWidth) / window.innerWidth;
      const dy = (e.clientY - window.innerHeight) / window.innerHeight;
      box.style.transition = 'transform 0.1s linear'; 
      box.style.transform = `perspective(800px) rotateX(${dy*-3}deg) rotateY(${dx*3}deg) scale(1)`;
      isTicking = false;
    });
    isTicking = true;
  }
}, { passive: true });

window.addEventListener('mouseleave', () => {
  if (box) {
    box.style.transition = 'transform 0.6s var(--ease-smooth)';
    box.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  }
});

// Scroll reveal observer
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));
