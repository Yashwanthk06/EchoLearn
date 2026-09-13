import { useEffect, useRef, useCallback } from 'react';

// ── Particle type ───────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

// ── Colour palette ──────────────────────────────────────────────────
const PARTICLE_COLORS = [
  '99, 102, 241',   // indigo
  '6, 182, 212',    // cyan
  '139, 92, 246',   // violet
  '59, 130, 246',   // blue
  '14, 165, 233',   // sky
];

interface ParticlesBgProps {
  /** Number of particles (default 80, reduced on mobile) */
  particleCount?: number;
  /** Max connection distance in px (default 150) */
  connectionDistance?: number;
  /** Mouse repulsion radius in px (default 120) */
  mouseRadius?: number;
  /** className for the container */
  className?: string;
}

export function ParticlesBg({
  particleCount = 80,
  connectionDistance = 150,
  mouseRadius = 120,
  className = '',
}: ParticlesBgProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const ripplesRef = useRef<ClickRipple[]>([]);
  const rafRef = useRef<number>(0);
  const dprRef = useRef(1);
  const sizeRef = useRef({ w: 0, h: 0 });

  // ── Create particles ─────────────────────────────────────────────
  const initParticles = useCallback(
    (w: number, h: number) => {
      // Reduce count on small screens
      const isMobile = w < 640;
      const count = isMobile ? Math.round(particleCount * 0.45) : particleCount;

      const particles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const color =
          PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        const baseAlpha = 0.15 + Math.random() * 0.35;
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: 1.2 + Math.random() * 2,
          color,
          alpha: baseAlpha,
          baseAlpha,
        });
      }
      particlesRef.current = particles;
    },
    [particleCount],
  );

  // ── Main draw loop ────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = dprRef.current;
    const w = sizeRef.current.w;
    const h = sizeRef.current.h;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const particles = particlesRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // ── Update & draw particles ────────────────────────────────────
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse repulsion
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouseRadius && dist > 0) {
        const force = (1 - dist / mouseRadius) * 1.8;
        p.vx += (dx / dist) * force * 0.3;
        p.vy += (dy / dist) * force * 0.3;
        // Glow when near cursor
        p.alpha = Math.min(p.baseAlpha + (1 - dist / mouseRadius) * 0.5, 1);
      } else {
        // Fade back to base
        p.alpha += (p.baseAlpha - p.alpha) * 0.03;
      }

      // Velocity damping
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.fill();

      // Outer glow
      if (p.alpha > p.baseAlpha + 0.05) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha * 0.15})`;
        ctx.fill();
      }
    }

    // ── Connection lines ───────────────────────────────────────────
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const opacity = (1 - dist / connectionDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // ── Click ripples ──────────────────────────────────────────────
    const ripples = ripplesRef.current;
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += 2.5;
      r.opacity -= 0.01;
      if (r.opacity <= 0 || r.radius >= r.maxRadius) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6, 182, 212, ${r.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(draw);
  }, [connectionDistance, mouseRadius]);

  // ── Lifecycle ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const prevW = sizeRef.current.w;
      sizeRef.current = { w, h };

      // Re-init particles only on first load or significant resize
      if (particlesRef.current.length === 0 || Math.abs(w - prevW) > 200) {
        initParticles(w, h);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const onClick = (e: MouseEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 200,
        opacity: 0.4,
      });

      // Push nearby particles away on click
      const particles = particlesRef.current;
      for (const p of particles) {
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = (1 - dist / 150) * 4;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const onTouchEnd = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('click', onClick);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('click', onClick);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [draw, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
