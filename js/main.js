/* ============================================================
   gzpojie.com - Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     Navbar - scroll behaviour & mobile toggle
     ============================================================ */
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  function onScroll() {
    if (window.scrollY > 30) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle?.addEventListener('click', function () {
    navLinks.classList.toggle('open');
    const expanded = navLinks.classList.contains('open');
    navToggle.setAttribute('aria-expanded', expanded);
  });

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks?.classList.remove('open');
    });
  });

  /* ============================================================
     Fade-up on scroll
     ============================================================ */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ============================================================
     Animated counter
     ============================================================ */
  const counterEls = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const decimals = (el.getAttribute('data-decimals') || '0') | 0;
    const duration = parseInt(el.getAttribute('data-duration')) || 1800;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const val = target * ease;
      el.textContent = prefix + val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
    }
    requestAnimationFrame(tick);
  }
  if (counterEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     Bar-chart animation
     ============================================================ */
  const barFills = document.querySelectorAll('.bar-fill');
  if (barFills.length) {
    barFills.forEach(function (el) { el.style.width = '0'; });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const target = entry.target.getAttribute('data-w') || '80';
            entry.target.style.width = target + '%';
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      barFills.forEach(function (el) { io.observe(el); });
    }
  }

  /* ============================================================
     Heatmap - generate cells
     ============================================================ */
  const heatmap = document.querySelector('.heatmap');
  if (heatmap && !heatmap.children.length) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 168; i++) {
      const c = document.createElement('div');
      const r = Math.random();
      let level = 0;
      if (r < 0.15) level = 0;
      else if (r < 0.35) level = 1;
      else if (r < 0.55) level = 2;
      else if (r < 0.80) level = 3;
      else if (r < 0.95) level = 4;
      else level = 5;
      c.className = 'heat-cell l' + level;
      c.setAttribute('title', 'Activity: ' + (level * 20) + '%');
      frag.appendChild(c);
    }
    heatmap.appendChild(frag);
  }

  /* ============================================================
     Contact form - local submit handler
     ============================================================ */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const success = contactForm.querySelector('.form-success');
      if (success) {
        success.classList.add('show');
        success.textContent = '> Message queued successfully. Our team will respond within 24 hours.';
        setTimeout(function () {
          contactForm.reset();
          success.classList.remove('show');
        }, 5000);
      }
    });
  }

  /* ============================================================
     Smooth scroll for in-page links
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          ev.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ============================================================
     Year stamp + clock + ticker drift
     ============================================================ */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  function updateClock() {
    const now = new Date();
    const utc = now.toISOString().split('T')[1].slice(0, 8);
    document.querySelectorAll('[data-clock]').forEach(function (el) { el.textContent = utc + ' UTC'; });
  }
  updateClock();
  setInterval(updateClock, 1000);

  const tickerEls = document.querySelectorAll('[data-ticker]');
  function tickValues() {
    tickerEls.forEach(function (el) {
      const current = parseFloat(el.getAttribute('data-ticker'));
      const drift = (Math.random() - 0.45) * (current * 0.001);
      const next = Math.max(0, current + drift);
      el.setAttribute('data-ticker', next.toFixed(2));
      const decimals = el.getAttribute('data-decimals') | 0;
      const formatted = current.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      if (!el.classList.contains('counted')) el.textContent = formatted;
    });
  }
  if (tickerEls.length) setInterval(tickValues, 4000);

  console.log('%c gzpojie.com ', 'background:#00f0ff;color:#06080f;font-weight:700;padding:4px 10px;border-radius:3px;');
  console.log('%c Crafted with care. ', 'color:#8b5cf6;font-style:italic;');
})();