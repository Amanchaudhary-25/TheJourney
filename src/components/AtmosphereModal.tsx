import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Sliders,
  Check,
  RotateCcw,
  MousePointer,
  Radio,
  Flame,
  Snowflake,
  Waves,
  TreePine,
  Moon,
  Zap,
  Shield,
  Cpu,
  Eye,
  Flower2,
  Sunset as SunsetIcon,
  Compass,
} from 'lucide-react';
import { AtmosphereConfig, AtmosphereType, UniverseTheme, CursorEffect, DEFAULT_ATMOSPHERE, JourneyTheme } from '../types';
import { THEMES, ThemeConfig } from '../styles/themes';

interface AtmosphereModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: AtmosphereConfig;
  currentTheme: ThemeConfig;
  onApply: (config: AtmosphereConfig, syncThemeWithUniverse?: boolean) => void;
}

const UNIVERSE_THEMES: Array<{
  id: UniverseTheme;
  name: string;
  badge: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}> = [
  { id: 'cosmic', name: 'Cosmic', badge: '🪐 Galactic', tagline: 'Galaxies, planetary dust & celestial orbits', icon: Compass, accent: '#38BDF8' },
  { id: 'web', name: 'Web-Inspired', badge: '🕷️ Heroic', tagline: 'Crimson & spider-blue contrast with web laser mesh', icon: Radio, accent: '#EF4444' },
  { id: 'thunder', name: 'Thunder-Inspired', badge: '⚡ Arc Fury', tagline: 'Electric celestial violet with lightning sparks', icon: Zap, accent: '#818CF8' },
  { id: 'shield', name: 'Shield-Inspired', badge: '🛡️ Vanguard', tagline: 'Vibranium silver, starlight & orbital rings', icon: Shield, accent: '#E2E8F0' },
  { id: 'tech', name: 'Tech-Inspired', badge: '🤖 Cyber HUD', tagline: 'Holographic coordinates, neon grid & data nodes', icon: Cpu, accent: '#22D3EE' },
  { id: 'gamma', name: 'Gamma-Inspired', badge: '🟢 Bio-Kinetic', tagline: 'Radiant emerald bio-energy motes & pulses', icon: Radio, accent: '#4ADE80' },
  { id: 'mystic', name: 'Mystic-Inspired', badge: '🔮 Sanctum', tagline: 'Arcane portals, rotating mandalas & purple glow', icon: Wand2, accent: '#C084FC' },
  { id: 'aurora', name: 'Aurora', badge: '🌿 Borealis', tagline: 'Ethereal northern luminescence & emerald waves', icon: TreePine, accent: '#34D399' },
  { id: 'sunset', name: 'Sunset', badge: '🌅 Cinematic', tagline: 'Warm dusk light, rose magenta & burning embers', icon: SunsetIcon, accent: '#FB923C' },
  { id: 'minimal', name: 'Minimal', badge: '⚪ Pure', tagline: 'Crisp negative space & serene monochrome stars', icon: Eye, accent: '#FFFFFF' },
];

const ATMOSPHERE_EFFECTS: Array<{
  id: AtmosphereType;
  name: string;
  icon: string;
  desc: string;
  glow: string;
}> = [
  { id: 'cosmic', name: 'Cosmic', icon: '🌌', desc: 'Stars + moving dust + nebula glow', glow: 'rgba(56, 189, 248, 0.3)' },
  { id: 'electric', name: 'Electric', icon: '⚡', desc: 'Subtle lightning arcs + electric sparks', glow: 'rgba(129, 140, 248, 0.3)' },
  { id: 'ember', name: 'Ember', icon: '🔥', desc: 'Floating glowing embers rising warm', glow: 'rgba(249, 115, 22, 0.3)' },
  { id: 'frost', name: 'Frost', icon: '❄️', desc: 'Drifting ice snow particles + cool shimmer', glow: 'rgba(186, 230, 253, 0.3)' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', desc: 'Slow blue light waves + aquatic bubbles', glow: 'rgba(14, 165, 233, 0.3)' },
  { id: 'nature', name: 'Nature', icon: '🌿', desc: 'Breathing fireflies + floating spores', glow: 'rgba(163, 230, 53, 0.3)' },
  { id: 'moonlight', name: 'Moonlight', icon: '🌙', desc: 'Soft lunar glow + tiny midnight stars', glow: 'rgba(241, 245, 249, 0.25)' },
  { id: 'stardust', name: 'Stardust', icon: '🌠', desc: 'Shooting stars + cosmic particle trails', glow: 'rgba(192, 132, 252, 0.3)' },
  { id: 'mystic', name: 'Mystic', icon: '💜', desc: 'Floating magical rings + purple ether', glow: 'rgba(168, 85, 247, 0.3)' },
  { id: 'shadow', name: 'Shadow', icon: '🖤', desc: 'Dark vignette + subtle smoky movement', glow: 'rgba(15, 23, 42, 0.4)' },
  { id: 'golden_hour', name: 'Golden Hour', icon: '☀️', desc: 'Warm floating light particles + amber bokeh', glow: 'rgba(251, 191, 36, 0.3)' },
  { id: 'dreamy', name: 'Dreamy', icon: '🌸', desc: 'Soft drifting petals + romantic bokeh', glow: 'rgba(244, 114, 182, 0.3)' },
];

const CURSOR_MODES: Array<{
  id: CursorEffect;
  label: string;
  desc: string;
}> = [
  { id: 'none', label: 'None', desc: 'Default system cursor' },
  { id: 'glow', label: 'Glow', desc: 'Soft radial aura following pointer' },
  { id: 'particles', label: 'Particles', desc: 'Luminous particle wake & bursts' },
  { id: 'trail', label: 'Trail', desc: 'Subtle light streak behind fast movements' },
];

const PRESETS: Array<{
  name: string;
  config: AtmosphereConfig;
  syncTheme: boolean;
}> = [
  {
    name: '🕷️ Web-Slinger',
    syncTheme: true,
    config: { universe: 'web', effect: 'electric', cursor: 'particles', intensity: 0.7, interactiveEnabled: true },
  },
  {
    name: '🪐 Deep Cosmos',
    syncTheme: true,
    config: { universe: 'cosmic', effect: 'stardust', cursor: 'glow', intensity: 0.65, interactiveEnabled: true },
  },
  {
    name: '🤖 Neon Cyber HUD',
    syncTheme: true,
    config: { universe: 'tech', effect: 'electric', cursor: 'trail', intensity: 0.75, interactiveEnabled: true },
  },
  {
    name: '🔮 Sorcerer Sanctum',
    syncTheme: true,
    config: { universe: 'mystic', effect: 'mystic', cursor: 'particles', intensity: 0.7, interactiveEnabled: true },
  },
  {
    name: '🌿 Firefly Glade',
    syncTheme: true,
    config: { universe: 'aurora', effect: 'nature', cursor: 'glow', intensity: 0.6, interactiveEnabled: true },
  },
  {
    name: '🔥 Twilight Embers',
    syncTheme: true,
    config: { universe: 'sunset', effect: 'ember', cursor: 'particles', intensity: 0.65, interactiveEnabled: true },
  },
];

export const AtmosphereModal: React.FC<AtmosphereModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  currentTheme,
  onApply,
}) => {
  const [universe, setUniverse] = useState<UniverseTheme>(currentConfig.universe || 'cosmic');
  const [effect, setEffect] = useState<AtmosphereType>(currentConfig.effect || 'cosmic');
  const [cursor, setCursor] = useState<CursorEffect>(currentConfig.cursor || 'glow');
  const [intensity, setIntensity] = useState<number>(currentConfig.intensity ?? 0.6);
  const [interactiveEnabled, setInteractiveEnabled] = useState<boolean>(
    currentConfig.interactiveEnabled ?? true
  );
  const [syncTheme, setSyncTheme] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'create' | 'presets'>('create');
  const [appliedToast, setAppliedToast] = useState(false);

  const themeKey = (universe === 'cosmic' ? 'midnight' : universe) as JourneyTheme;

  useEffect(() => {
    if (isOpen) {
      setUniverse(currentConfig.universe || 'cosmic');
      setEffect(currentConfig.effect || 'cosmic');
      setCursor(currentConfig.cursor || 'glow');
      setIntensity(currentConfig.intensity ?? 0.6);
      setInteractiveEnabled(currentConfig.interactiveEnabled ?? true);
      setAppliedToast(false);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleApply = () => {
    const config: AtmosphereConfig = {
      universe,
      effect,
      cursor,
      intensity,
      interactiveEnabled,
    };
    onApply(config, syncTheme);
    setAppliedToast(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  const handleReset = () => {
    setUniverse(DEFAULT_ATMOSPHERE.universe);
    setEffect(DEFAULT_ATMOSPHERE.effect);
    setCursor(DEFAULT_ATMOSPHERE.cursor);
    setIntensity(DEFAULT_ATMOSPHERE.intensity);
    setInteractiveEnabled(DEFAULT_ATMOSPHERE.interactiveEnabled);
  };

  const getIntensityLabel = (val: number) => {
    if (val <= 0.3) return 'Subtle & Peaceful';
    if (val <= 0.55) return 'Gentle Ambient';
    if (val <= 0.8) return 'Balanced & Immersive';
    return 'Cinematic & Radiant';
  };

  return (
    <div
      id="atmosphere-world-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-white/20 bg-[#090A12]/95 shadow-2xl shadow-indigo-950/40 text-slate-100 overflow-hidden"
        style={{
          boxShadow: `0 0 45px -10px ${THEMES[themeKey]?.accentGlow || 'rgba(56, 189, 248, 0.2)'}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20"
              style={{ backgroundColor: THEMES[themeKey]?.accentGlow || 'rgba(56, 189, 248, 0.2)' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-manrope">
                Create Your World
              </h2>
              <p className="text-[11px] text-white/50 font-normal">
                Customize atmospheric phenomena, universe aesthetics, and interactive elements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center p-0.5 rounded-lg bg-black/40 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`px-3 py-1 rounded-md transition-all text-[11px] font-medium ${
                  activeTab === 'create'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                Custom World
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-3 py-1 rounded-md transition-all text-[11px] font-medium ${
                  activeTab === 'presets'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                Presets
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 no-scrollbar">
          {activeTab === 'presets' ? (
            /* PRESET CARDS */
            <div className="space-y-4">
              <div className="text-xs text-white/60 pb-1">
                Choose a handcrafted combination of Universe theme, atmospheric motion, and cursor dynamics:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESETS.map((p) => {
                  const isCur =
                    universe === p.config.universe &&
                    effect === p.config.effect &&
                    cursor === p.config.cursor;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setUniverse(p.config.universe);
                        setEffect(p.config.effect);
                        setCursor(p.config.cursor);
                        setIntensity(p.config.intensity);
                        setInteractiveEnabled(p.config.interactiveEnabled);
                        setSyncTheme(p.syncTheme);
                      }}
                      className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-2 ${
                        isCur
                          ? 'border-cyan-400/60 bg-cyan-950/30 ring-1 ring-cyan-400/40'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-white tracking-wide">
                          {p.name}
                        </span>
                        {isCur && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div className="text-[11px] text-white/50">
                        Universe: <span className="text-white/80 capitalize">{p.config.universe}</span> • Atmosphere:{' '}
                        <span className="text-white/80 capitalize">{p.config.effect}</span> • Cursor:{' '}
                        <span className="text-white/80 capitalize">{p.config.cursor}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CUSTOM CREATION ACCORDION / SECTIONS */
            <>
              {/* 1. UNIVERSE THEME */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wider uppercase text-white/80 font-manrope">
                    1. Universe & Atmosphere Theme
                  </label>
                  <span className="text-[11px] text-white/45">Changes site styling & background</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {UNIVERSE_THEMES.map((u) => {
                    const isSelected = universe === u.id;
                    const Icon = u.icon;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setUniverse(u.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                          isSelected
                            ? 'border-white/50 bg-white/15 shadow-sm ring-1 ring-white/30'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span style={{ color: u.accent }}><Icon className="w-3.5 h-3.5" /></span>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="text-xs font-medium text-white truncate">{u.name}</div>
                        <div className="text-[10px] text-white/45 truncate">{u.badge}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. ATMOSPHERIC PHENOMENON */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wider uppercase text-white/80 font-manrope">
                    2. Atmospheric Phenomenon
                  </label>
                  <span className="text-[11px] text-white/45">Visual motion & particle aesthetics</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ATMOSPHERE_EFFECTS.map((eff) => {
                    const isSelected = effect === eff.id;
                    return (
                      <button
                        key={eff.id}
                        type="button"
                        onClick={() => setEffect(eff.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-white/50 bg-white/15 shadow-sm ring-1 ring-white/30'
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <span className="text-base">{eff.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white">{eff.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <p className="text-[10px] text-white/50 truncate mt-0.5">{eff.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. CURSOR DYNAMICS */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wider uppercase text-white/80 font-manrope">
                    3. Cursor Dynamics
                  </label>
                  <span className="text-[11px] text-white/45">Desktop pointer reaction</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CURSOR_MODES.map((cm) => {
                    const isSelected = cursor === cm.id;
                    return (
                      <button
                        key={cm.id}
                        type="button"
                        onClick={() => setCursor(cm.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-white/50 bg-white/15 shadow-sm ring-1 ring-white/30'
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white">{cm.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <p className="text-[10px] text-white/45 mt-1 leading-snug">{cm.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. INTENSITY SLIDER */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold tracking-wider uppercase text-white/80 font-manrope">
                    4. Atmosphere Intensity
                  </label>
                  <span className="text-[11px] text-cyan-300 font-medium font-mono">
                    {getIntensityLabel(intensity)} ({Math.round(intensity * 100)}%)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={intensity}
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex items-center justify-between text-[10px] text-white/40 px-1 font-mono">
                    <span>Subtle (Minimal)</span>
                    <span>Balanced</span>
                    <span>Cinematic (Rich)</span>
                  </div>
                </div>
              </div>

              {/* 5. INTERACTIVE ENVIRONMENT TOGGLES */}
              <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-medium text-white flex items-center gap-1.5">
                    <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mouse Interaction Suite</span>
                  </div>
                  <p className="text-[11px] text-white/45">
                    Move pushes particles • Click emits burst • Double-click shockwave • 5s idle settles to calm drift
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setInteractiveEnabled(!interactiveEnabled)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    interactiveEnabled
                      ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200'
                      : 'bg-white/5 border-white/15 text-white/40 hover:text-white/70'
                  }`}
                >
                  {interactiveEnabled ? 'Interactive Active' : 'Static Float'}
                </button>
              </div>

              {/* Theme Sync Checkbox */}
              <div className="pt-2 flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  id="sync-theme-checkbox"
                  checked={syncTheme}
                  onChange={(e) => setSyncTheme(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-cyan-400 w-3.5 h-3.5 cursor-pointer"
                />
                <label htmlFor="sync-theme-checkbox" className="cursor-pointer text-[11px] select-none">
                  Synchronize website countdown theme & cards with selected universe
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/40">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              id="apply-atmosphere-btn"
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold tracking-wide bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all active:scale-[0.98]"
            >
              {appliedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Applied!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Apply Atmosphere</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
