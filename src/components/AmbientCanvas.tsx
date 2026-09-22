import React, { useEffect, useRef } from 'react';
import { ThemeConfig } from '../styles/themes';
import { AtmosphereConfig, DEFAULT_ATMOSPHERE } from '../types';

interface AmbientCanvasProps {
  theme: ThemeConfig;
  atmosphere?: AtmosphereConfig;
  enabled?: boolean;
  prefersReducedMotion?: boolean;
  particlesEnabled?: boolean;
  cursorGlowEnabled?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  pulseSpeed: number;
  pulseStep: number;
  rotation?: number;
  vRot?: number;
  swayStep?: number;
  swaySpeed?: number;
  swayDist?: number;
  life?: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  color: string;
  active: boolean;
}

interface ClickBurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({
  theme,
  atmosphere = DEFAULT_ATMOSPHERE,
  enabled = true,
  prefersReducedMotion = false,
  particlesEnabled = true,
  cursorGlowEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const mouseRef = useRef<{
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    targetX: number;
    targetY: number;
    vx: number;
    vy: number;
    active: boolean;
    lastMoveTime: number;
    trail: Array<{ x: number; y: number; alpha: number; radius: number; color: string }>;
  }>({
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    targetX: -1000,
    targetY: -1000,
    vx: 0,
    vy: 0,
    active: false,
    lastMoveTime: 0,
    trail: [],
  });

  const burstsRef = useRef<ClickBurstParticle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const m = mouseRef.current;
      m.targetX = e.clientX;
      m.targetY = e.clientY;
      m.active = true;
      m.lastMoveTime = now;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      if (!atmosphere.interactiveEnabled) return;
      const count = Math.floor(14 * (atmosphere.intensity || 0.6));
      const colors = theme.particleColors.length > 0 ? theme.particleColors : [theme.accentColor, '#FFFFFF'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.2;
        burstsRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.2 + 0.8,
          alpha: 0.9,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: Math.random() * 35 + 25,
        });
      }
    };

    const handleDblClick = (e: MouseEvent) => {
      if (!atmosphere.interactiveEnabled) return;
      shockwavesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: Math.min(width, height) * 0.45,
        alpha: 0.8,
        color: theme.accentColor,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);
    window.addEventListener('dblclick', handleDblClick);

    // Initialize Atmosphere Particles according to Effect and Intensity
    const intensity = Math.max(0.2, Math.min(1.0, atmosphere.intensity ?? 0.6));
    const baseCount = Math.floor((width * height) / 25000);
    const particleCount = Math.floor(baseCount * intensity * (atmosphere.effect === 'shadow' ? 0.3 : 1.2));

    const effect = atmosphere.effect || 'cosmic';
    const universe = atmosphere.universe || 'cosmic';

    // Tailored particle generator
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const p: Particle = {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35 * (prefersReducedMotion ? 0.2 : 1),
        vy: (Math.random() - 0.5) * 0.35 * (prefersReducedMotion ? 0.2 : 1),
        radius: Math.random() * 1.8 + 0.6,
        baseAlpha: Math.random() * 0.35 + 0.12,
        alpha: Math.random() * 0.35 + 0.12,
        color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)] || theme.accentColor,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseStep: Math.random() * Math.PI * 2,
        swayStep: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.03 + 0.01,
        swayDist: Math.random() * 0.6 + 0.2,
      };

      // Specific behavioral characteristics per atmosphere effect
      if (effect === 'ember') {
        p.vy = -(Math.random() * 0.8 + 0.3) * (prefersReducedMotion ? 0.3 : 1);
        p.vx = (Math.random() - 0.5) * 0.3;
        p.radius = Math.random() * 2.2 + 0.8;
        p.color = ['#FB923C', '#F97316', '#EF4444', '#FBBF24', '#FDE047'][Math.floor(Math.random() * 5)];
      } else if (effect === 'frost') {
        p.vy = (Math.random() * 0.5 + 0.2) * (prefersReducedMotion ? 0.3 : 1);
        p.radius = Math.random() * 2.0 + 0.6;
        p.color = ['#E0F2FE', '#BAE6FD', '#F0F9FF', '#FFFFFF'][Math.floor(Math.random() * 4)];
      } else if (effect === 'ocean') {
        p.vy = -(Math.random() * 0.4 + 0.1);
        p.radius = Math.random() * 2.5 + 0.8;
        p.color = ['#38BDF8', '#0284C7', '#7DD3FC', '#0EA5E9', '#A5F3FC'][Math.floor(Math.random() * 5)];
      } else if (effect === 'nature') {
        // Fireflies
        p.radius = Math.random() * 2.2 + 1.2;
        p.color = ['#FACC15', '#A3E635', '#4ADE80', '#FEF08A'][Math.floor(Math.random() * 4)];
        p.pulseSpeed = Math.random() * 0.04 + 0.02;
      } else if (effect === 'golden_hour') {
        p.vy = -(Math.random() * 0.35 + 0.1);
        p.radius = Math.random() * 3.2 + 1.0;
        p.color = ['#FDE047', '#F59E0B', '#F97316', '#FEF08A'][Math.floor(Math.random() * 4)];
      } else if (effect === 'dreamy') {
        p.vy = (Math.random() * 0.45 + 0.2);
        p.radius = Math.random() * 2.8 + 1.2;
        p.rotation = Math.random() * Math.PI * 2;
        p.vRot = (Math.random() - 0.5) * 0.02;
        p.color = ['#F472B6', '#FB7185', '#FDA4AF', '#FECDD3', '#FFFFFF'][Math.floor(Math.random() * 5)];
      } else if (effect === 'electric') {
        p.vx = (Math.random() - 0.5) * 1.2;
        p.vy = (Math.random() - 0.5) * 1.2;
        p.radius = Math.random() * 1.5 + 0.5;
        p.color = ['#67E8F9', '#38BDF8', '#818CF8', '#FFFFFF', '#A5B4FC'][Math.floor(Math.random() * 5)];
      } else if (effect === 'mystic') {
        p.radius = Math.random() * 2.5 + 0.8;
        p.color = ['#C084FC', '#E879F9', '#F43F5E', '#A855F7', '#FACC15'][Math.floor(Math.random() * 5)];
      } else if (effect === 'shadow') {
        p.radius = Math.random() * 5.0 + 2.5;
        p.baseAlpha = 0.08;
        p.color = '#0F172A';
      }

      return p;
    });

    // Shooting stars state for 'stardust' & 'cosmic'
    const shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = performance.now() + Math.random() * 3000 + 2000;

    // Electric arcs timer
    let nextLightningTime = performance.now() + Math.random() * 4000 + 3000;
    let lightningBranches: Array<Array<{ x: number; y: number }>> = [];
    let lightningAlpha = 0;

    let calmFactor = 1.0; // 1.0 = active, 0.45 = idle calm
    let lastTime = performance.now();
    let tick = 0;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      tick++;

      const m = mouseRef.current;

      // Mouse speed calculation
      if (m.active) {
        m.prevX = m.x;
        m.prevY = m.y;
        m.x += (m.targetX - m.x) * 0.22;
        m.y += (m.targetY - m.y) * 0.22;
        m.vx = m.x - m.prevX;
        m.vy = m.y - m.prevY;
      }

      const mouseActive = m.active && m.x > 0 && m.y > 0;

      // Idle Detection: if idle for > 5 seconds, smoothly transition to calm state
      const isIdle = performance.now() - m.lastMoveTime > 5000;
      const targetCalm = isIdle ? 0.45 : 1.0;
      calmFactor += (targetCalm - calmFactor) * 0.03;

      ctx.clearRect(0, 0, width, height);

      // ─── 1. ATMOSPHERE BACKGROUND SHADERS & PHENOMENA ───
      if (particlesEnabled) {
        // Moonlight soft glow
        if (effect === 'moonlight') {
        const moonRadius = Math.min(width, height) * 0.35;
        const moonGrad = ctx.createRadialGradient(
          width * 0.85,
          height * 0.15,
          10,
          width * 0.85,
          height * 0.15,
          moonRadius
        );
        moonGrad.addColorStop(0, 'rgba(241, 245, 249, 0.14)');
        moonGrad.addColorStop(0.5, 'rgba(203, 213, 225, 0.04)');
        moonGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = moonGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Ocean caustic light waves
      if (effect === 'ocean') {
        ctx.save();
        for (let wave = 0; wave < 3; wave++) {
          ctx.beginPath();
          const waveY = height * (0.65 + wave * 0.12);
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 40) {
            const y = waveY + Math.sin(x * 0.005 + time * 0.001 + wave) * 16;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fillStyle = `rgba(14, 165, 233, ${0.025 * intensity})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // Shadow Vignette
      if (effect === 'shadow') {
        const shadowGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.25,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.65
        );
        shadowGrad.addColorStop(0, 'transparent');
        shadowGrad.addColorStop(1, `rgba(0, 0, 0, ${0.45 * intensity})`);
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Universe Theme Accents
      // 🤖 Tech: Subtle coordinate crosshairs and grid lines
      if (universe === 'tech') {
        ctx.save();
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.04 * intensity})`;
        ctx.lineWidth = 1;
        const gridSize = 120;
        for (let x = gridSize; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = gridSize; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 🛡️ Shield: Subtle concentric circular orbital light
      if (universe === 'shield') {
        ctx.save();
        const centerX = width / 2;
        const centerY = height * 0.45;
        const radii = [140, 240, 360];
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.03 * intensity})`;
        ctx.lineWidth = 1;
        radii.forEach((r) => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 🔮 Mystic: Rotating sacred geometry runes/concentric rings
      if (universe === 'mystic' || effect === 'mystic') {
        ctx.save();
        const centerX = width / 2;
        const centerY = height * 0.45;
        const ringAngle = time * 0.0003;
        ctx.strokeStyle = `rgba(192, 132, 252, ${0.045 * intensity})`;
        ctx.lineWidth = 1;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(ringAngle);
        ctx.beginPath();
        ctx.arc(0, 0, 180, 0, Math.PI * 2);
        ctx.stroke();
        // 8-point star / mandala nodes
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * 180, Math.sin(a) * 180, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(250, 204, 21, ${0.08 * intensity})`;
          ctx.fill();
        }
        ctx.restore();
        ctx.restore();
      }

      // ⚡ Electric / Thunder: Occasional delicate lightning branch
      if (effect === 'electric' || universe === 'thunder') {
        if (time > nextLightningTime) {
          nextLightningTime = time + Math.random() * 5000 + 3500;
          lightningAlpha = 0.65;
          // Generate an organic branching bolt
          const startX = Math.random() * width;
          const startY = 0;
          let curX = startX;
          let curY = startY;
          const mainBranch: Array<{ x: number; y: number }> = [{ x: curX, y: curY }];
          const targetY = height * (Math.random() * 0.5 + 0.3);
          while (curY < targetY) {
            curX += (Math.random() - 0.5) * 45;
            curY += Math.random() * 25 + 10;
            mainBranch.push({ x: curX, y: curY });
          }
          lightningBranches = [mainBranch];
        }

        if (lightningAlpha > 0.01) {
          ctx.save();
          ctx.strokeStyle = `rgba(129, 140, 248, ${lightningAlpha * intensity})`;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#818CF8';
          ctx.shadowBlur = 10;
          lightningBranches.forEach((branch) => {
            if (branch.length > 1) {
              ctx.beginPath();
              ctx.moveTo(branch[0].x, branch[0].y);
              for (let i = 1; i < branch.length; i++) {
                ctx.lineTo(branch[i].x, branch[i].y);
              }
              ctx.stroke();
            }
          });
          ctx.restore();
          lightningAlpha *= 0.88;
        }
      }

      // 🌠 Stardust / Cosmic: Shooting stars
      if (effect === 'stardust' || effect === 'cosmic') {
        if (time > nextShootingStarTime) {
          nextShootingStarTime = time + Math.random() * 4000 + 2500;
          shootingStars.push({
            x: Math.random() * width * 0.9,
            y: Math.random() * height * 0.4,
            vx: Math.random() * 5 + 6,
            vy: Math.random() * 3 + 3,
            length: Math.random() * 80 + 50,
            alpha: 0.85,
            color: theme.accentColor || '#FFFFFF',
            active: true,
          });
        }

        // Draw and update shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          s.x += s.vx;
          s.y += s.vy;
          s.alpha *= 0.96;

          if (s.alpha <= 0.02 || s.x > width + 100 || s.y > height + 100) {
            shootingStars.splice(i, 1);
            continue;
          }

          const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * (s.length / 10), s.y - s.vy * (s.length / 10));
          grad.addColorStop(0, s.color);
          grad.addColorStop(1, 'transparent');

          ctx.save();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = s.alpha * intensity;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * (s.length / 10), s.y - s.vy * (s.length / 10));
          ctx.stroke();
          ctx.restore();
        }
      }

      // ─── 2. PRIMARY PARTICLES LOOP ───
      const repelDist = 120 * intensity;
      const speedMultiplier = (prefersReducedMotion ? 0.25 : 1.0) * calmFactor;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle with calm factor
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        // Oscillate lateral sway for frost, nature, dreamy
        if (p.swayStep !== undefined && p.swaySpeed && p.swayDist) {
          p.swayStep += p.swaySpeed * calmFactor;
          p.x += Math.sin(p.swayStep) * p.swayDist * speedMultiplier;
        }

        // Wrap around boundaries
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Alpha pulsing
        p.pulseStep += p.pulseSpeed * calmFactor;
        p.alpha = p.baseAlpha + Math.sin(p.pulseStep) * (p.baseAlpha * 0.5);

        // 🖱️ Interactive Environment: Mouse repel field
        if (atmosphere.interactiveEnabled && mouseActive) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < repelDist && dist > 0) {
            const force = (repelDist - dist) / repelDist;
            p.x += (dx / dist) * force * 1.6;
            p.y += (dy / dist) * force * 1.6;
          }
        }

        // Spider-Web Mesh connecting lines if universe === 'web'
        if (universe === 'web') {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const d = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (d < 75) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(239, 68, 68, ${(1 - d / 75) * 0.12 * intensity})`;
              ctx.lineWidth = 0.75;
              ctx.stroke();
            }
          }
        }

        // Render Particle Shape
        ctx.save();
        ctx.globalAlpha = Math.max(0.04, Math.min(0.85, p.alpha * intensity));
        ctx.fillStyle = p.color;

        if (effect === 'dreamy' && p.rotation !== undefined) {
          // Petal shape
          p.rotation += p.vRot || 0.01;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius * 1.5, p.radius * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === 'frost') {
          // Crisp ice mote
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard luminous spherical mote
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    } // End if (particlesEnabled)

      // ─── 3. CLICK BURSTS ───
      if (particlesEnabled && burstsRef.current.length > 0) {
        for (let i = burstsRef.current.length - 1; i >= 0; i--) {
          const b = burstsRef.current[i];
          b.x += b.vx;
          b.y += b.vy;
          b.vx *= 0.94;
          b.vy *= 0.94;
          b.life++;
          b.alpha = 1 - b.life / b.maxLife;

          if (b.life >= b.maxLife) {
            burstsRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, b.alpha * intensity);
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // ─── 4. DOUBLE CLICK SHOCKWAVES ───
      if (particlesEnabled && shockwavesRef.current.length > 0) {
        for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
          const sw = shockwavesRef.current[i];
          sw.radius += (sw.maxRadius - sw.radius) * 0.08;
          sw.alpha *= 0.94;

          if (sw.alpha <= 0.02 || sw.radius >= sw.maxRadius * 0.98) {
            shockwavesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = sw.alpha * intensity;
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // ─── 5. CURSOR EFFECTS (Glow / Particles / Trail / None) ───
      const cursorMode = atmosphere.cursor || 'glow';

      if (mouseActive && cursorMode !== 'none') {
        const mouseSpeed = Math.hypot(m.vx, m.vy);

        // A. Glow Effect: Soft radial glow follows pointer
        // Strictly respected: only if cursorGlowEnabled is true
        if (cursorGlowEnabled && (cursorMode === 'glow' || cursorMode === 'particles')) {
          const glowRadius = Math.min(320, Math.max(180, width * 0.22)) * intensity;
          const glowGrad = ctx.createRadialGradient(m.x, m.y, 8, m.x, m.y, glowRadius);
          glowGrad.addColorStop(0, theme.accentGlow || 'rgba(56, 189, 248, 0.25)');
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.fillRect(0, 0, width, height);
        }

        // B. Trail & Particles Effect: record trail points when moving
        // Strictly respected: only if particlesEnabled is true
        if (particlesEnabled && (cursorMode === 'trail' || cursorMode === 'particles')) {
          if (mouseSpeed > 1.2 && tick % 2 === 0) {
            m.trail.push({
              x: m.x,
              y: m.y,
              alpha: 0.7,
              radius: cursorMode === 'trail' ? Math.min(5, mouseSpeed * 0.4) : Math.random() * 2 + 1,
              color: theme.accentColor,
            });
          }

          // Render trail
          for (let i = m.trail.length - 1; i >= 0; i--) {
            const tr = m.trail[i];
            tr.alpha *= 0.88;
            tr.radius *= 0.95;

            if (tr.alpha <= 0.02) {
              m.trail.splice(i, 1);
              continue;
            }

            ctx.save();
            ctx.fillStyle = tr.color;
            ctx.globalAlpha = tr.alpha * intensity;
            ctx.beginPath();
            ctx.arc(tr.x, tr.y, tr.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('dblclick', handleDblClick);
    };
  }, [theme, atmosphere, enabled, prefersReducedMotion]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
    />
  );
};
