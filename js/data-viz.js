/* ============================================================
   data-viz.js - Lightweight Canvas charts (line, bars, area, ring)
   No external libraries.
   ============================================================ */

(function () {
  'use strict';
  window.GZDataViz = window.GZDataViz || {};

  function setup(canvas) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: rect.width, h: rect.height };
  }

  function drawSmooth(ctx, points, color) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length - 1; i++) {
      const cx = (points[i][0] + points[i + 1][0]) / 2;
      const cy = (points[i][1] + points[i + 1][1]) / 2;
      ctx.quadraticCurveTo(points[i][0], points[i][1], cx, cy);
    }
    ctx.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  /* ============================================================
     Multi-series line chart
     ============================================================ */
  function drawLineChart(canvas) {
    const c = setup(canvas);
    const { ctx, w, h } = c;
    const padding = { top: 28, right: 20, bottom: 30, left: 38 };
    const pw = w - padding.left - padding.right;
    const ph = h - padding.top - padding.bottom;

    const seriesA = [];
    const seriesB = [];
    let base = 50;
    for (let i = 0; i < 30; i++) {
      base += (Math.random() - 0.45) * 8;
      seriesA.push(base);
      seriesB.push(base * 0.7 + Math.sin(i * 0.7) * 18 + Math.random() * 6);
    }
    const max = Math.max(...seriesA, ...seriesB) * 1.15;
    const min = Math.min(...seriesA, ...seriesB) * 0.85;
    const range = max - min;

    function x(i) { return padding.left + (pw / (seriesA.length - 1)) * i; }
    function y(v) { return padding.top + ph - ((v - min) / range) * ph; }

    // grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const yp = padding.top + (ph / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, yp);
      ctx.lineTo(w - padding.right, yp);
      ctx.stroke();

      const val = max - (range / 4) * i;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(val), padding.left - 6, yp + 3);
    }

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    for (let i = 0; i < labels.length; i++) {
      const xi = padding.left + (pw / (labels.length - 1)) * i;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], xi, h - 10);
    }

    // Series B
    ctx.beginPath();
    ctx.moveTo(x(0), y(seriesB[0]));
    for (let i = 1; i < seriesB.length; i++) ctx.lineTo(x(i), y(seriesB[i]));
    ctx.lineTo(x(seriesB.length - 1), padding.top + ph);
    ctx.lineTo(x(0), padding.top + ph);
    ctx.closePath();
    const gradB = ctx.createLinearGradient(0, padding.top, 0, padding.top + ph);
    gradB.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradB.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = gradB;
    ctx.fill();
    drawSmooth(ctx, seriesB.map(function (v, i) { return [x(i), y(v)]; }), 'rgba(139, 92, 246, 1)');

    // Series A
    ctx.beginPath();
    ctx.moveTo(x(0), y(seriesA[0]));
    for (let i = 1; i < seriesA.length; i++) ctx.lineTo(x(i), y(seriesA[i]));
    ctx.lineTo(x(seriesA.length - 1), padding.top + ph);
    ctx.lineTo(x(0), padding.top + ph);
    ctx.closePath();
    const gradA = ctx.createLinearGradient(0, padding.top, 0, padding.top + ph);
    gradA.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
    gradA.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = gradA;
    ctx.fill();
    drawSmooth(ctx, seriesA.map(function (v, i) { return [x(i), y(v)]; }), 'rgba(0, 240, 255, 1)');

    const last = seriesA.length - 1;
    ctx.beginPath();
    ctx.arc(x(last), y(seriesA[last]), 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(0, 240, 255, 1)';
    ctx.textAlign = 'left';
    ctx.fillRect(padding.left, padding.top - 14, 10, 2);
    ctx.fillText('Engagement', padding.left + 16, padding.top - 10);
    ctx.fillStyle = 'rgba(139, 92, 246, 1)';
    ctx.fillRect(padding.left + 110, padding.top - 14, 10, 2);
    ctx.fillText('Retention', padding.left + 126, padding.top - 10);
  }

  /* ============================================================
     Ring chart
     ============================================================ */
  function drawRingChart(canvas) {
    const c = setup(canvas);
    const { ctx, w, h } = c;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.38;
    const lineWidth = 22;

    const data = [
      { value: 46, color: '#00f0ff', label: 'iOS' },
      { value: 32, color: '#8b5cf6', label: 'Android' },
      { value: 14, color: '#ff2d8a', label: 'macOS' },
      { value: 8, color: '#00ff9d', label: 'Web' }
    ];
    const total = data.reduce(function (s, d) { return s + d.value; }, 0);
    let start = -Math.PI / 2;
    data.forEach(function (d) {
      const slice = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, start + slice);
      ctx.strokeStyle = d.color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = d.color;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
      start += slice;
    });
  }

  function drawSparkline(canvas) {
    const c = setup(canvas);
    const { ctx, w, h } = c;
    const points = [];
    let v = h * 0.6;
    for (let i = 0; i <= w; i++) {
      v += (Math.random() - 0.5) * 6;
      v = Math.max(h * 0.2, Math.min(h * 0.8, v));
      points.push([i, v]);
    }
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#00f0ff');
    grad.addColorStop(1, '#8b5cf6');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function draw(canvas) {
    const type = canvas.getAttribute('data-viz');
    if (type === 'line') drawLineChart(canvas);
    else if (type === 'ring') drawRingChart(canvas);
    else if (type === 'spark') drawSparkline(canvas);
    else drawSparkline(canvas);
  }

  window.GZDataViz.draw = draw;

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('canvas[data-viz]').forEach(function (c) { draw(c); });
    let to;
    window.addEventListener('resize', function () {
      clearTimeout(to);
      to = setTimeout(function () {
        document.querySelectorAll('canvas[data-viz]').forEach(function (c) { draw(c); });
      }, 150);
    });
  });
})();