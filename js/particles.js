/* ============================================================
   particles.js - Animated particle background & vector network
   ============================================================ */

(function () {
  'use strict';

  /* ===== Particle Canvas (hero background) ===== */
  function initParticleCanvas(canvas, options) {
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const settings = Object.assign({
      density: 90,
      maxDist: 140,
      color: '0, 240, 255',
      accent: '139, 92, 246',
      linked: true
    }, options || {});

    let particles = [];
    let width = 0, height = 0;
    let mouseX = -9999, mouseY = -9999;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      width = rect.width;
      height = rect.height;
      seed();
    }

    function seed() {
      particles = [];
      const count = Math.floor((width * height) / (settings.density * 80)) + 40;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1 + Math.random() * 1.6,
          a: 0.4 + Math.random() * 0.6,
          color: Math.random() > 0.78 ? settings.accent : settings.color
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const md = Math.sqrt(dx * dx + dy * dy);
        if (md < 130) {
          const f = (1 - md / 130) * 0.4;
          p.x += (dx / md) * f * 5;
          p.y += (dy / md) * f * 5;
        }

        // draw point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ',' + p.a + ')';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(' + p.color + ', 0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // link
        if (settings.linked) {
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j];
            const ddx = p.x - q.x;
            const ddy = p.y - q.y;
            const dist = Math.sqrt(ddx * ddx + ddy * ddy);
            if (dist < settings.maxDist) {
              const alpha = (1 - dist / settings.maxDist) * 0.2;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = 'rgba(' + settings.color + ',' + alpha + ')';
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      requestAnimationFrame(step);
    }

    canvas.addEventListener('mousemove', function (ev) {
      const rect = canvas.getBoundingClientRect();
      mouseX = ev.clientX - rect.left;
      mouseY = ev.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', function () {
      mouseX = -9999; mouseY = -9999;
    });

    let to;
    window.addEventListener('resize', function () {
      clearTimeout(to);
      to = setTimeout(resize, 120);
    });

    resize();
    step();
  }

  /* ===== Auto-init canvases ===== */
  document.addEventListener('DOMContentLoaded', function () {
    const heroes = document.querySelectorAll('.hero-bg-canvas');
    heroes.forEach(function (c) {
      if (c.classList.contains('plain')) {
        initParticleCanvas(c, { density: 80, linked: true, color: '58, 141, 255' });
      } else {
        initParticleCanvas(c, { density: 70, maxDist: 150 });
      }
    });

    // Decorate any canvas with class .data-canvas
    document.querySelectorAll('canvas[data-viz]').forEach(function (c) {
      if (window.GZDataViz && typeof window.GZDataViz.draw === 'function') {
        window.GZDataViz.draw(c);
      }
    });
  });
})();
