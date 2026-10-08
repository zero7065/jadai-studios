import React, { useRef, useState, useEffect, useMemo } from 'react';
import { StudioAudio } from '../../lib/watermark';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
  Radio,
  Eye,
  Compass,
} from 'lucide-react';

export type SigilAura = 'divine_gold' | 'celestial_opal' | 'highland_amber' | 'astral_prism';
export type SigilDimension = '3D' | '4D' | '5D';
export type SnowFlowSpeed = 'calm' | 'swirl' | 'blizzard';

export interface SacredGeometryProps {
  size?: number;
  opacity?: number;
  interactive?: boolean;
  className?: string;
  accentColor?: string;
  onClick?: () => void;
  showCustomizer?: boolean;
  showNotificationPopup?: boolean;
}

interface SnowParticle {
  id: number;
  cx: number;
  cy: number;
  r: number;
  speed: number;
  baseOpacity: number;
  phase: number;
  driftX: number;
  driftY: number;
}

interface GoldenRipple {
  id: number;
  createdAt: number;
}

const TRANSMISSIONS = [
  {
    tag: '5D RELIC TRANSMISSION',
    title: 'Hypnotic Snow Bulb Active',
    detail: 'Harmonized 432Hz Metatron matrix. 60 suspended cosmic stardust motes in divine optical refraction.',
    time: 'Live Harmonic',
  },
  {
    tag: 'PARABLE 070 • CANONICAL CODEX',
    title: 'The Bedrock Under the Quarry',
    detail: '“Build the floor first. The sky does not owe your vanity a pillar.”',
    time: 'Uncut Transmission',
  },
  {
    tag: 'ORACLE ARCHITECTURE',
    title: 'Load-Bearing Foundations',
    detail: '“Never sell scaffolding disguised as a skyscraper. Deliver complete, runnable foundations or deliver nothing.”',
    time: 'First Principles',
  },
  {
    tag: 'STUDIO TELEMETRY',
    title: '70 Canonical Chronicles Active',
    detail: 'Autonomous Grimoire matrix, 5D lens projection, and PWA offline synthesis synchronised.',
    time: 'Perimeter Verified',
  },
];

/**
 * 5D HYPNOTIC SNOW BULB & ANCIENT-FUTURISTIC SACRED SIGIL
 * Enhanced with:
 * - 5D lens effect: radial glass refraction caustics and chromatic edge dispersion
 * - Soft inner pulsing glow on 13 gold sacred nodes
 * - Framer Motion event listener with golden expanding concentric ripples on click
 * - Interactive customization dock (Aura, Dimension, Particles, Sound)
 * - Holographic notification transmission HUD popup
 */
export const SacredGeometry: React.FC<SacredGeometryProps> = ({
  size = 320,
  opacity = 0.95,
  interactive = true,
  className = '',
  accentColor,
  onClick,
  showCustomizer = true,
  showNotificationPopup = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Customization state
  const [aura, setAura] = useState<SigilAura>('divine_gold');
  const [dimension, setDimension] = useState<SigilDimension>('5D');
  const [snowSpeed, setSnowSpeed] = useState<SnowFlowSpeed>('swirl');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Notification popup state
  const [popupVisible, setPopupVisible] = useState(true);
  const [transmissionIdx, setTransmissionIdx] = useState(0);

  // Interactive parallax & golden ripple state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<GoldenRipple[]>([]);
  const [snowParticles, setSnowParticles] = useState<SnowParticle[]>([]);

  // Cycle transmissions automatically every 7.5 seconds
  useEffect(() => {
    if (!showNotificationPopup || !popupVisible) return;
    const interval = setInterval(() => {
      setTransmissionIdx((prev) => (prev + 1) % TRANSMISSIONS.length);
    }, 7500);
    return () => clearInterval(interval);
  }, [showNotificationPopup, popupVisible]);

  const center = size / 2;
  const radius = size * 0.46;
  const rInner = size * 0.22;
  const rOuter = size * 0.38;

  // Initialize floating golden stardust particles inside the snow bulb
  useEffect(() => {
    const list: SnowParticle[] = [];
    const particleCount = snowSpeed === 'calm' ? 40 : snowSpeed === 'swirl' ? 60 : 85;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * (radius * 0.9);
      list.push({
        id: i,
        cx: center + Math.cos(angle) * dist,
        cy: center + Math.sin(angle) * dist,
        r: 0.8 + Math.random() * 1.6,
        speed:
          snowSpeed === 'calm'
            ? 3.8 + Math.random() * 3.5
            : snowSpeed === 'swirl'
            ? 2.2 + Math.random() * 2.5
            : 1.2 + Math.random() * 1.6,
        baseOpacity: 0.25 + Math.random() * 0.65,
        phase: Math.random() * 4,
        driftX: (Math.random() - 0.5) * 8,
        driftY: (Math.random() - 0.5) * 8,
      });
    }
    setSnowParticles(list);
  }, [size, center, radius, snowSpeed]);

  // Spherical lens parallax tilt (clamped to max 8px shift)
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const detectRange = 400;

      if (dist < detectRange) {
        const pull = (detectRange - dist) / detectRange;
        const multiplier = dimension === '5D' ? 1.0 : dimension === '4D' ? 0.75 : 0.5;
        const rawX = ((e.clientX - cx) / 20) * pull * multiplier;
        const rawY = ((e.clientY - cy) / 20) * pull * multiplier;
        const maxShift = dimension === '5D' ? 8 : 5;
        const clampedX = Math.max(-maxShift, Math.min(maxShift, rawX));
        const clampedY = Math.max(-maxShift, Math.min(maxShift, rawY));
        setOffset({ x: clampedX, y: clampedY });
      } else {
        setOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, dimension]);

  // Golden ripple trigger on click / touch using Framer Motion state
  const handleSigilClick = (e: React.MouseEvent) => {
    if (soundEnabled) {
      try {
        StudioAudio.playSuccessArpeggio();
      } catch {}
    }

    const newId = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id: newId, createdAt: Date.now() }]);

    // Auto cleanup ripple after animation finishes (1.4s)
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newId));
    }, 1450);

    // Also advance the notification transmission on tap
    setTransmissionIdx((prev) => (prev + 1) % TRANSMISSIONS.length);

    if (onClick) onClick();
  };

  // Aura palette configurations
  const auraGradients = useMemo(() => {
    switch (aura) {
      case 'celestial_opal':
        return {
          primary: '#e0f2fe',
          secondary: '#7dd3fc',
          accent: '#ffffff',
          radialCore: '#ffffff',
          bloomColor: 'rgba(186, 230, 253, 0.65)',
          glassGlow: 'rgba(125, 211, 252, 0.28)',
          nodeGlow: 'rgba(186, 230, 253, 0.8)',
        };
      case 'highland_amber':
        return {
          primary: '#fcd34d',
          secondary: '#d97706',
          accent: '#fffbeb',
          radialCore: '#ffffff',
          bloomColor: 'rgba(251, 191, 36, 0.65)',
          glassGlow: 'rgba(245, 158, 11, 0.28)',
          nodeGlow: 'rgba(251, 191, 36, 0.85)',
        };
      case 'astral_prism':
        return {
          primary: '#f472b6',
          secondary: '#a855f7',
          accent: '#ffffff',
          radialCore: '#faf5ff',
          bloomColor: 'rgba(216, 180, 254, 0.65)',
          glassGlow: 'rgba(168, 85, 247, 0.28)',
          nodeGlow: 'rgba(216, 180, 254, 0.85)',
        };
      case 'divine_gold':
      default:
        return {
          primary: '#fde08b',
          secondary: '#C9A84C',
          accent: '#ffffff',
          radialCore: '#ffffff',
          bloomColor: 'rgba(201, 168, 76, 0.65)',
          glassGlow: 'rgba(201, 168, 76, 0.3)',
          nodeGlow: 'rgba(253, 224, 139, 0.9)',
        };
    }
  }, [aura]);

  // 13 Sacred Metatron Harmonic Points (Center + 6 inner hexagon + 6 outer hexagon)
  const points: Array<{ x: number; y: number; id: number }> = [{ x: center, y: center, id: 0 }];

  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180;
    points.push({
      x: center + rInner * Math.cos(angle),
      y: center + rInner * Math.sin(angle),
      id: i + 1,
    });
  }

  for (let i = 0; i < 6; i++) {
    const angle = ((i * 60 + 30) * Math.PI) / 180;
    points.push({
      x: center + rOuter * Math.cos(angle),
      y: center + rOuter * Math.sin(angle),
      id: i + 7,
    });
  }

  const currentTransmission = TRANSMISSIONS[transmissionIdx];

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* -------------------------------------------------------------------
          TOP / OVERLAY: FLOATING FUTURISTIC NOTIFICATION POPUP ON 5D SIGIL
         ------------------------------------------------------------------- */}
      {showNotificationPopup && popupVisible && (
        <AnimatePresence mode="wait">
          <motion.div
            key={transmissionIdx}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute -top-14 sm:-top-16 z-30 w-72 sm:w-84 max-w-[92vw] px-3.5 py-2 rounded-2xl bg-[rgba(15,13,10,0.88)] border border-[rgba(201,168,76,0.35)] backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] text-left group"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-ping" />
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#e8c96a] font-bold">
                  {currentTransmission.tag}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTransmissionIdx((prev) => (prev - 1 + TRANSMISSIONS.length) % TRANSMISSIONS.length);
                    StudioAudio.playClick();
                  }}
                  className="p-1 text-[#8a857e] hover:text-[#e8c96a] transition-colors cursor-pointer"
                  title="Previous transmission"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[9px] font-mono text-[#8a857e]">
                  {transmissionIdx + 1}/{TRANSMISSIONS.length}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTransmissionIdx((prev) => (prev + 1) % TRANSMISSIONS.length);
                    StudioAudio.playClick();
                  }}
                  className="p-1 text-[#8a857e] hover:text-[#e8c96a] transition-colors cursor-pointer"
                  title="Next transmission"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopupVisible(false);
                    StudioAudio.playClick();
                  }}
                  className="p-1 text-[#8a857e] hover:text-white transition-colors cursor-pointer ml-1"
                  title="Dismiss HUD"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="text-xs font-serif text-[#f5f3f0] font-semibold truncate">
              {currentTransmission.title}
            </div>
            <div className="text-[11px] font-sans text-[#a8a29e] line-clamp-2 leading-relaxed">
              {currentTransmission.detail}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* -------------------------------------------------------------------
          MAIN 5D SNOW BULB SVG RELIC WITH RADIAL REFRACTION & NODAL PULSE
         ------------------------------------------------------------------- */}
      <div className="relative cursor-pointer" onClick={handleSigilClick}>
        {/* Soft Ambient Radial Halo behind the glass */}
        <div
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none transition-all duration-700 opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${auraGradients.bloomColor}, transparent 70%)`,
          }}
        />

        {/* Framer Motion Golden Ripples on Click */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
          <AnimatePresence>
            {ripples.map((rip) => (
              <motion.div
                key={rip.id}
                initial={{ scale: 0.1, opacity: 0.95, borderWidth: '2.5px' }}
                animate={{
                  scale: 2.4,
                  opacity: 0,
                  borderWidth: '0.5px',
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.4,
                  ease: [0.12, 0.8, 0.3, 1],
                }}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: `${size * 0.45}px`,
                  height: `${size * 0.45}px`,
                  borderColor: '#fde08b',
                  boxShadow: '0 0 25px rgba(253, 224, 139, 0.55), inset 0 0 15px rgba(201, 168, 76, 0.3)',
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="select-none transition-transform duration-300 ease-out overflow-visible filter drop-shadow-[0_18px_45px_rgba(0,0,0,0.85)]"
          style={{
            opacity,
            transform: `perspective(1000px) translate3d(${offset.x}px, ${offset.y}px, 0) rotateX(${
              -offset.y * 1.1
            }deg) rotateY(${offset.x * 1.1}deg)`,
          }}
        >
          <defs>
            {/* 5D Radial Glass Refraction (Snow Bulb Spherical Lens) */}
            <radialGradient id="snowBulbRefraction5D" cx="42%" cy="36%" r="68%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="28%" stopColor={auraGradients.primary} stopOpacity="0.18" />
              <stop offset="60%" stopColor="#1c160b" stopOpacity="0.45" />
              <stop offset="85%" stopColor="#0a0805" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#040302" stopOpacity="0.95" />
            </radialGradient>

            {/* Subtle Caustic Glass Refraction Overlay */}
            <radialGradient id="causticRefractionArc" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="transparent" stopOpacity="0" />
              <stop offset="65%" stopColor={auraGradients.glassGlow} stopOpacity="0.15" />
              <stop offset="90%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Inner Pulsing Nodal Glow Gradient */}
            <radialGradient id="nodePulsingInnerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor={auraGradients.primary} stopOpacity="0.9" />
              <stop offset="70%" stopColor={auraGradients.secondary} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Golden Ambient Glow */}
            <radialGradient id="sunGlowCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="25%" stopColor={auraGradients.primary} stopOpacity="0.85" />
              <stop offset="60%" stopColor={auraGradients.secondary} stopOpacity="0.35" />
              <stop offset="100%" stopColor={auraGradients.secondary} stopOpacity="0" />
            </radialGradient>

            {/* Warm Divine Vector Gradient */}
            <linearGradient id="warmDivineGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffdfa" />
              <stop offset="30%" stopColor={auraGradients.primary} />
              <stop offset="70%" stopColor={auraGradients.secondary} />
              <stop offset="100%" stopColor="#8a6e2a" />
            </linearGradient>

            {/* Glass Rim Specular Arc Gradient */}
            <linearGradient id="specularRimHighlight" x1="0%" y1="0%" x2="70%" y2="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#fff4d4" stopOpacity="0.5" />
              <stop offset="70%" stopColor={auraGradients.primary} stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Clip path ensuring particles stay inside the glass sphere */}
            <clipPath id="snowBulbClip">
              <circle cx={center} cy={center} r={radius - 2} />
            </clipPath>

            {/* Soft Bloom Filter */}
            <filter id="etherealBloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* -------------------------------------------------------------------
              LAYER 1: 5D RADIAL GLASS REFRACTION & SPHERICAL LENS
             ------------------------------------------------------------------- */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#snowBulbRefraction5D)"
            stroke="url(#warmDivineGold)"
            strokeWidth="1.8"
            strokeOpacity="0.8"
          />

          {/* Radial Glass Refraction Ring Effect */}
          <circle
            cx={center}
            cy={center}
            r={radius * 0.94}
            fill="url(#causticRefractionArc)"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="0.75"
          />

          {/* -------------------------------------------------------------------
              LAYER 2: SUSPENDED FLOATING STARDUST (SNOW BULB PARTICLES)
             ------------------------------------------------------------------- */}
          <g clipPath="url(#snowBulbClip)">
            {snowParticles.map((p) => (
              <circle
                key={p.id}
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                fill="#fffdf5"
                opacity={p.baseOpacity}
                style={{
                  animation: `stardustFloat ${p.speed}s ease-in-out infinite alternate`,
                  animationDelay: `${p.phase}s`,
                  transformOrigin: `${p.cx}px ${p.cy}px`,
                }}
              />
            ))}
          </g>

          {/* -------------------------------------------------------------------
              LAYER 3: SACRED METATRON GOLDEN MATRIX & PULSING NODES
             ------------------------------------------------------------------- */}
          <g style={{ transform: `translate(${offset.x * 0.45}px, ${offset.y * 0.45}px)` }}>
            {/* Flower of Life Harmonic Concentric Rings */}
            <circle
              cx={center}
              cy={center}
              r={radius * 0.72}
              fill="none"
              stroke="url(#warmDivineGold)"
              strokeWidth="0.8"
              strokeOpacity="0.5"
              strokeDasharray="5 3"
            />
            <circle
              cx={center}
              cy={center}
              r={rOuter}
              fill="none"
              stroke="url(#warmDivineGold)"
              strokeWidth="0.85"
              strokeOpacity="0.65"
            />
            <circle
              cx={center}
              cy={center}
              r={rInner}
              fill="none"
              stroke="url(#warmDivineGold)"
              strokeWidth="0.95"
              strokeOpacity="0.8"
            />

            {/* Interconnecting Golden Vectors between 13 points */}
            {points.map((p1, i) =>
              points.slice(i + 1).map((p2, j) => (
                <line
                  key={`line-${i}-${j}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="url(#warmDivineGold)"
                  strokeWidth="0.8"
                  strokeOpacity="0.45"
                />
              ))
            )}

            {/* 13 Luminous Sacred Gold Nodes with Soft Inner Pulsing Glow */}
            {points.map((p, pIdx) => (
              <g key={`node-halo-${p.id}`} className="sigil-gold-node-pulse">
                {/* Expanding Soft Pulsing Nodal Glow */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={size * 0.048}
                  fill="url(#nodePulsingInnerGlow)"
                  className="sigil-node-inner-glow"
                  style={{
                    animationDelay: `${(pIdx * 0.18).toFixed(2)}s`,
                  }}
                />

                {/* Outer Delicate Gold Ring */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={size * 0.038}
                  fill="none"
                  stroke="url(#warmDivineGold)"
                  strokeWidth="0.9"
                  strokeOpacity="0.9"
                />

                {/* Sparkling Inner Center Pearl */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={size * 0.016}
                  fill="#ffffff"
                  opacity="0.98"
                  filter="url(#etherealBloom)"
                />
              </g>
            ))}
          </g>

          {/* -------------------------------------------------------------------
              LAYER 4: INNER ORBITAL CELESTIAL RING (Rotating CCW at 90s/rev)
             ------------------------------------------------------------------- */}
          <g
            style={{
              transformOrigin: `${center}px ${center}px`,
              animation: 'snowBulbCCW 90s linear infinite',
            }}
          >
            <circle
              cx={center}
              cy={center}
              r={rInner}
              fill="none"
              stroke={auraGradients.primary}
              strokeWidth="1.2"
              strokeDasharray="6 4 2 4"
              strokeOpacity="0.85"
            />
            {/* Orbital Satellite Dots */}
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const a = (deg * Math.PI) / 180;
              return (
                <circle
                  key={`sat-${deg}`}
                  cx={center + rInner * Math.cos(a)}
                  cy={center + rInner * Math.sin(a)}
                  r={2.4}
                  fill="#ffffff"
                  filter="url(#etherealBloom)"
                />
              );
            })}
          </g>

          {/* -------------------------------------------------------------------
              LAYER 5: OUTER CELESTIAL RING (Rotating CW at 60s/rev)
             ------------------------------------------------------------------- */}
          <g
            style={{
              transformOrigin: `${center}px ${center}px`,
              animation: 'snowBulbCW 60s linear infinite',
            }}
          >
            <circle
              cx={center}
              cy={center}
              r={rOuter}
              fill="none"
              stroke={auraGradients.secondary}
              strokeWidth="1.3"
              strokeDasharray="9 4 3 4"
              strokeOpacity="0.85"
            />
            {/* 12 Radiant Celestial Notches */}
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              const x1 = center + (rOuter - 3.5) * Math.cos(a);
              const y1 = center + (rOuter - 3.5) * Math.sin(a);
              const x2 = center + (rOuter + 4.5) * Math.cos(a);
              const y2 = center + (rOuter + 4.5) * Math.sin(a);
              return (
                <line
                  key={`notch-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#fffdf0"
                  strokeWidth="1.2"
                  strokeOpacity="0.85"
                />
              );
            })}
          </g>

          {/* -------------------------------------------------------------------
              LAYER 6: CENTER HYPNOTIC PULSING CELESTIAL STAR RELIC
             ------------------------------------------------------------------- */}
          <g
            className="snow-bulb-core-star"
            style={{
              transformOrigin: `${center}px ${center}px`,
              transform: `translate(${offset.x * 0.75}px, ${offset.y * 0.75}px)`,
            }}
          >
            {/* Ethereal Aura Bloom */}
            <circle cx={center} cy={center} r={size * 0.12} fill="url(#sunGlowCore)" />

            {/* Sacred Golden 8-Point Star Diamond */}
            <g filter="url(#etherealBloom)">
              <polygon
                points={`${center},${center - size * 0.075} ${center + size * 0.055},${center} ${center},${
                  center + size * 0.075
                } ${center - size * 0.055},${center}`}
                fill="url(#warmDivineGold)"
                stroke="#ffffff"
                strokeWidth="1.2"
              />
              <polygon
                points={`${center},${center - size * 0.055} ${center + size * 0.075},${center} ${center},${
                  center + size * 0.055
                } ${center - size * 0.075},${center}`}
                fill="url(#warmDivineGold)"
                stroke="#ffffff"
                strokeWidth="0.8"
                opacity="0.85"
              />
              <circle cx={center} cy={center} r={size * 0.02} fill="#ffffff" />
            </g>
          </g>

          {/* -------------------------------------------------------------------
              LAYER 7: SPHERICAL GLASS LENS CAUSTICS & SPECULAR HIGHLIGHT
             ------------------------------------------------------------------- */}
          <path
            d={`M ${center - radius * 0.65} ${center - radius * 0.65} A ${radius} ${radius} 0 0 1 ${
              center + radius * 0.65
            } ${center - radius * 0.65}`}
            fill="none"
            stroke="url(#specularRimHighlight)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.88"
          />

          <path
            d={`M ${center - radius * 0.45} ${center + radius * 0.78} A ${radius} ${radius} 0 0 0 ${
              center + radius * 0.45
            } ${center + radius * 0.78}`}
            fill="none"
            stroke="url(#specularRimHighlight)"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.45"
          />

          <circle
            cx={center}
            cy={center}
            r={radius + 1}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="0.85"
          />

          <style>{`
            @keyframes snowBulbCW {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes snowBulbCCW {
              from { transform: rotate(0deg); }
              to { transform: rotate(-360deg); }
            }
            @keyframes stardustFloat {
              0% { transform: translate(0px, 0px) scale(0.9); opacity: 0.3; }
              50% { transform: translate(5px, -6px) scale(1.15); opacity: 0.9; }
              100% { transform: translate(-4px, 5px) scale(0.95); opacity: 0.4; }
            }
            .sigil-node-inner-glow {
              animation: nodeGlowBreathe 2.8s ease-in-out infinite;
              transform-origin: center;
            }
            @keyframes nodeGlowBreathe {
              0%, 100% {
                opacity: 0.35;
                transform: scale(0.85);
              }
              50% {
                opacity: 0.9;
                transform: scale(1.18);
              }
            }
            .snow-bulb-core-star {
              animation: hypnoticCoreBreathe 3.6s ease-in-out infinite;
            }
            @keyframes hypnoticCoreBreathe {
              0%, 100% {
                transform: scale(0.96);
                filter: drop-shadow(0 0 8px rgba(253, 224, 139, 0.7));
              }
              50% {
                transform: scale(1.08);
                filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.98));
              }
            }
          `}</style>
        </svg>
      </div>

      {/* -------------------------------------------------------------------
          BOTTOM: SIGIL CUSTOMIZATION DOCK (LENS, AURA, PARTICLES, SOUND)
         ------------------------------------------------------------------- */}
      {showCustomizer && (
        <div className="relative mt-3 z-30 flex flex-col items-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(15,13,10,0.88)] border border-[rgba(201,168,76,0.35)] backdrop-blur-xl shadow-md text-xs font-mono text-[#c4c0bb]">
            <button
              onClick={() => {
                setCustomizerOpen(!customizerOpen);
                StudioAudio.playClick();
              }}
              className="flex items-center gap-1 text-[#e8c96a] hover:text-[#fff] transition-colors cursor-pointer text-[11px]"
            >
              <Sliders className="w-3 h-3 text-[#C9A84C]" />
              <span>Customize Sigil</span>
            </button>

            <span className="text-[#8a857e]">•</span>

            {/* Quick Aura Switcher */}
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'divine_gold', label: 'Gold', color: '#C9A84C' },
                  { id: 'celestial_opal', label: 'Opal', color: '#7dd3fc' },
                  { id: 'highland_amber', label: 'Amber', color: '#f59e0b' },
                  { id: 'astral_prism', label: 'Prism', color: '#c084fc' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setAura(opt.id);
                    StudioAudio.playClick();
                  }}
                  title={`Set ${opt.label} Aura`}
                  className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                    aura === opt.id
                      ? 'scale-125 border-white shadow-xs'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: opt.color }}
                />
              ))}
            </div>

            <span className="text-[#8a857e]">•</span>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                StudioAudio.playClick();
              }}
              className="text-[#8a857e] hover:text-[#e8c96a] transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute Harmonic Bell' : 'Enable Harmonic Bell'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#C9A84C]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Expanded Drawer for In-depth 5D Customization */}
          <AnimatePresence>
            {customizerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                className="mt-2 p-3 rounded-2xl bg-[rgba(10,9,8,0.95)] border border-[rgba(201,168,76,0.35)] backdrop-blur-2xl shadow-xl w-72 text-left space-y-2.5 overflow-hidden"
              >
                {/* Dimension Setting */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8a857e] mb-1">
                    <span>Optical Dimension</span>
                    <span className="text-[#C9A84C]">{dimension} Snow Bulb Lens</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-[#050404] p-1 rounded-lg border border-white/10">
                    {(['3D', '4D', '5D'] as SigilDimension[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          setDimension(d);
                          StudioAudio.playClick();
                        }}
                        className={`py-1 text-[10px] font-mono rounded font-bold transition-all cursor-pointer ${
                          dimension === d
                            ? 'bg-[#C9A84C] text-[#050404]'
                            : 'text-[#8a857e] hover:text-[#f5f3f0]'
                        }`}
                      >
                        {d} Lens
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stardust Snow Motion */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8a857e] mb-1">
                    <span>Stardust Flow</span>
                    <span className="text-[#C9A84C]">{snowSpeed}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-[#050404] p-1 rounded-lg border border-white/10">
                    {(
                      [
                        { id: 'calm', label: 'Calm Drift' },
                        { id: 'swirl', label: 'Hypnotic' },
                        { id: 'blizzard', label: 'Radiant' },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSnowSpeed(s.id);
                          StudioAudio.playClick();
                        }}
                        className={`py-1 text-[9px] font-mono rounded font-bold transition-all cursor-pointer ${
                          snowSpeed === s.id
                            ? 'bg-[rgba(201,168,76,0.25)] text-[#e8c96a] border border-[#C9A84C]'
                            : 'text-[#8a857e] hover:text-[#f5f3f0]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reopen HUD if closed */}
                {!popupVisible && (
                  <button
                    onClick={() => {
                      setPopupVisible(true);
                      StudioAudio.playClick();
                    }}
                    className="w-full py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-[#e8c96a] border border-white/10 cursor-pointer"
                  >
                    Restore Transmission HUD
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SacredGeometry;
