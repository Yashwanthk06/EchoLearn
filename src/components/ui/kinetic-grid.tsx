import { useEffect, useRef, useCallback } from 'react';

// ── Colour palette (default / multi-colour) ────────────────────────
const NODE_COLORS = [
  'rgba(99, 102, 241, 0.6)',   // indigo
  'rgba(6, 182, 212, 0.5)',    // cyan
  'rgba(139, 92, 246, 0.5)',   // violet
  'rgba(59, 130, 246, 0.4)',   // blue
];

const LINE_COLOR = 'rgba(148, 163, 184, 0.07)';       // slate-400 @ 7 %
const LINE_WARP_COLOR = 'rgba(99, 102, 241, 0.14)';   // indigo @ 14 %
const RIPPLE_COLOR = 'rgba(99, 102, 241, 0.35)';

// ── Types ───────────────────────────────────────────────────────────
interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface KineticGridProps {
  /** Grid cell spacing in pixels (default 48) */
  cellSize?: number;
  /** Cursor warp radius in pixels (default 140) */
  warpRadius?: number;
  /** Max cursor warp offset (default 18) */
  warpStrength?: number;
  /** Node glow radius in pixels (default 2.2) */
  nodeRadius?: number;
  className?: string;
}

export function KineticGrid({
  cellSize = 48,
  warpRadius = 140,
  warpStrength = 18,
  nodeRadius = 2.2,
  className = '',
}: KineticGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const dprRef = useRef(1);

  // ── Warp helper ──────────────────────────────────────────────────
  const warp = useCallback(
    (px: number, py: number) => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const dx = px - mx;
      const dy = py - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > warpRadius || dist === 0) return { x: px, y: py };
      const factor = (1 - dist / warpRadius) * warpStrength;
      return {
        x: px + (dx / dist) * factor,
        y: py + (dy / dist) * factor,
      };
    },
    [warpRadius, warpStrength],
  );

  // ── Main animation loop ──────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = dprRef.current;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const cols = Math.ceil(w / cellSize) + 1;
    const rows = Math.ceil(h / cellSize) + 1;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    // ─── Grid lines ────────────────────────────────────────────────
    // Vertical
    for (let c = 0; c <= cols; c++) {
      const baseX = c * cellSize;
      ctx.beginPath();
      for (let r = 0; r <= rows; r++) {
        const baseY = r * cellSize;
        const { x, y } = warp(baseX, baseY);
        if (r === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // Near-cursor lines get brighter
      const dxLine = Math.abs(baseX - mx);
      ctx.strokeStyle = dxLine < warpRadius ? LINE_WARP_COLOR : LINE_COLOR;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Horizontal
    for (let r = 0; r <= rows; r++) {
      const baseY = r * cellSize;
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const baseX = c * cellSize;
        const { x, y } = warp(baseX, baseY);
        if (c === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const dyLine = Math.abs(baseY - my);
      ctx.strokeStyle = dyLine < warpRadius ? LINE_WARP_COLOR : LINE_COLOR;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ─── Nodes at intersections ────────────────────────────────────
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        const baseX = c * cellSize;
        const baseY = r * cellSize;
        const { x, y } = warp(baseX, baseY);

        const dx = x - mx;
        const dy = y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Base faint dot
        const baseBrightness = 0.12;
        // Proximity glow
        const proxGlow = dist < warpRadius ? (1 - dist / warpRadius) * 0.8 : 0;
        const totalAlpha = Math.min(baseBrightness + proxGlow, 1);

        const color = NODE_COLORS[(c + r) % NODE_COLORS.length];

        ctx.beginPath();
        ctx.arc(x, y, nodeRadius + proxGlow * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${totalAlpha})`);
        ctx.fill();

        // Extra glow halo on nearby nodes
        if (proxGlow > 0.25) {
          ctx.beginPath();
          ctx.arc(x, y, nodeRadius + proxGlow * 6, 0, Math.PI * 2);
          ctx.fillStyle = color.replace(/[\d.]+\)$/, `${proxGlow * 0.15})`);
          ctx.fill();
        }
      }
    }

    // ─── Click ripples ─────────────────────────────────────────────
    const ripples = ripplesRef.current;
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.radius += 3;
      rip.opacity -= 0.012;
      if (rip.opacity <= 0 || rip.radius >= rip.maxRadius) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = RIPPLE_COLOR.replace(/[\d.]+\)$/, `${rip.opacity})`);
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(draw);
  }, [cellSize, warp, nodeRadius]);

  // ── Lifecycle ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
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
        maxRadius: 220,
        opacity: 0.5,
      });
    };

    // Touch support (mobile)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
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
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
