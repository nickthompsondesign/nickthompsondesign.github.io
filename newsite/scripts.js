// PRELOADER
const minPreloaderTime = 1800; // 1.8 seconds minimum
const initTime = Date.now();

function dismissPreloader() {
  const timeElapsed = Date.now() - initTime;
  const timeRemaining = Math.max(0, minPreloaderTime - timeElapsed);

  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('fade-out'); // Checks if preloader exists
    document.body.classList.add('loaded');
  }, timeRemaining);
}

if (document.readyState === 'complete') {
  dismissPreloader();
} else {
  window.addEventListener('load', dismissPreloader);
  setTimeout(dismissPreloader, 6000); 
}

// SCROLL HEADER — runs on load AND scroll
const header = document.querySelector('header');

// Dynamically check for either the index hero or the sub-page hero
const getHeroH = () => {
  const hero = document.querySelector('.hero-wrapper') || document.querySelector('.project-hero');
  return hero ? hero.offsetHeight : window.innerHeight; // Fallback to window height if neither exist
};

const updateHeader = () => {
  if (!header) return; // Stop if no header exists
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

// HAMBURGER
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
if (hamburger && mobileNav) { // Only run if nav elements exist
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

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) { 
      e.preventDefault(); 
      target.scrollIntoView({ behavior: 'smooth' }); 
    }
  });
});

// INTERACTIVE BUBBLE (Index page only)
const interBubble = document.querySelector('.interactive');
if (interBubble) { // Only run if bubble exists on this page
  let curX=0, curY=0, tgX=0, tgY=0;
  const move = () => {
    curX += (tgX-curX)/25; curY += (tgY-curY)/25;
    interBubble.style.transform = `translate(${Math.round(curX)}px,${Math.round(curY)}px)`;
    requestAnimationFrame(move);
  };
  window.addEventListener('mousemove', e => { tgX=e.clientX; tgY=e.clientY; }, { passive: true });
  move();
}

// SQUARE BOX TILT (Index page only)
const box = document.querySelector('.square-box');
if (box) { // Only run if the 3D box exists
  let tilting = false;
  let isTicking = false;

  setTimeout(() => { tilting = true; }, 3500);

  window.addEventListener('mousemove', e => {
    if (!tilting) return;
    
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
    box.style.transition = 'transform 0.6s var(--ease-smooth)';
    box.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  });
}

// SCROLL REVEAL OBSERVER
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));
