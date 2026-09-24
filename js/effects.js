/* ============================================================
   effects.js - Orbit rotations, skeleton effects, and decor SVGs
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     Generate orbit-ring SVG with nodes
     ============================================================ */
  function buildOrbit() {
    const orbit = document.getElementById('heroOrbit');
    if (!orbit) return;

    const circles = [
      { r: 90, color: 'rgba(0, 240, 255, 0.18)', reverse: false },
      { r: 150, color: 'rgba(139, 92, 246, 0.18)', reverse: true },
      { r: 210, color: 'rgba(255, 45, 138, 0.14)', reverse: false }
    ];

    let svg = '<g transform="translate(250 250)">';

    circles.forEach(function (c) {
      svg += '<circle class="orbit-ring' + (c.reverse ? ' reverse' : '') + '" r="' + c.r + '" stroke="' + c.color + '" />';
    });

    const nodes = [
      { r: 90, a: 30, cls: '' },
      { r: 90, a: 200, cls: 'purple' },
      { r: 150, a: 90, cls: 'blue' },
      { r: 150, a: 270, cls: 'pink' },
      { r: 210, a: 0, cls: '' },
      { r: 210, a: 180, cls: 'purple' }
    ];

    nodes.forEach(function (n) {
      const rad = (n.a * Math.PI) / 180;
      const x = Math.cos(rad) * n.r;
      const y = Math.sin(rad) * n.r;
      svg += '<circle class="orbit-node ' + n.cls + '" r="5" cx="' + x + '" cy="' + y + '" />';
      svg += '<circle class="data-pulse" r="2" cx="' + (x * 1.03) + '" cy="' + (y * 1.03) + '" />';
    });

    // Connecting lines
    for (let i = 0; i < 12; i++) {
      const a1 = (i / 12) * Math.PI * 2;
      const a2 = ((i + 4) / 12) * Math.PI * 2;
      const x1 = Math.cos(a1) * 90, y1 = Math.sin(a1) * 90;
      const x2 = Math.cos(a2) * 210, y2 = Math.sin(a2) * 210;
      svg += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
             '" stroke="rgba(0, 240, 255, 0.06)" stroke-width="0.5" stroke-dasharray="2 4" />';
    }

    svg += '</g>';
    orbit.innerHTML = svg;
  }

  /* ============================================================
     Generate decorative SVG visuals for bento cards / hero
     ============================================================ */
  function buildBentoVisuals() {
    const nodes = document.querySelectorAll('.bento-visual');
    nodes.forEach(function (el) {
      const type = el.getAttribute('data-bv') || 'wave';
      const W = el.clientWidth || 400;
      const H = el.clientHeight || 200;
      let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">';
      // grid
      for (let i = 0; i < 12; i++) {
        svg += '<line x1="0" y1="' + (i + 1) * (H / 12) + '" x2="' + W + '" y2="' + (i + 1) * (H / 12) +
               '" stroke="rgba(0, 240, 255, 0.05)" stroke-width="0.5" />';
      }
      for (let i = 0; i < 18; i++) {
        svg += '<line x1="' + (i + 1) * (W / 18) + '" y1="0" x2="' + (i + 1) * (W / 18) + '" y2="' + H +
               '" stroke="rgba(0, 240, 255, 0.05)" stroke-width="0.5" />';
      }

      if (type === 'wave') {
        // ascending wave
        let path = 'M0,' + H;
        for (let x = 0; x <= W; x += 5) {
          const t = x / W;
          const y = H - 30 - Math.sin(t * Math.PI * 3) * 25 - t * 80;
          path += ' L' + x + ',' + y;
        }
        svg += '<path d="' + path + ' L' + W + ',' + H + ' Z" fill="url(#g1)" stroke="rgba(0,240,255,0.6)" stroke-width="1.5" />';
        svg += '<defs><linearGradient id="g1" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="rgba(0,240,255,0.4)" /><stop offset="100%" stop-color="rgba(0,240,255,0)" /></linearGradient></defs>';
      } else if (type === 'bars') {
        // bars
        for (let i = 0; i < 24; i++) {
          const h = 20 + Math.random() * (H - 60);
          const x = (i + 0.5) * (W / 24);
          svg += '<rect x="' + (x - 4) + '" y="' + (H - h - 20) + '" width="8" height="' + h +
                 '" fill="rgba(0, 240, 255, 0.5)" rx="1" />';
        }
      } else if (type === 'network') {
        // nodes & edges
        const N = 18;
        const pts = [];
        for (let i = 0; i < N; i++) {
          pts.push([Math.random() * W, Math.random() * H]);
        }
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
            if (d < 110) {
              svg += '<line x1="' + pts[i][0] + '" y1="' + pts[i][1] +
                     '" x2="' + pts[j][0] + '" y2="' + pts[j][1] +
                     '" stroke="rgba(0,240,255,' + (1 - d / 110) * 0.5 + ')" stroke-width="0.6" />';
            }
          }
        }
        pts.forEach(function (p) {
          svg += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="rgba(0,240,255,0.7)" />';
        });
      }
      svg += '</svg>';
      el.innerHTML = svg;
    });
  }

  /* ============================================================
     Boot
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    buildOrbit();
    buildBentoVisuals();

    let to;
    window.addEventListener('resize', function () {
      clearTimeout(to);
      to = setTimeout(buildBentoVisuals, 200);
    });
  });
})();
