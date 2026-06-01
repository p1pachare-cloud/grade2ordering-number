import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import { stopNarration } from '../utils/audio.js';

// ── Floating background numbers ───────────────────────────────────────────────
const BG_NUMS = [71, 18, 134, 47, 165, 98, 200, 152, 43, 187, 76, 30];

export function BgNumbers() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {BG_NUMS.map((n, i) => (
        <div
          key={i}
          className="number-bg"
          style={{
            left:              `${(i * 8.7) % 100}%`,
            top:               `${(i * 12 + 15) % 85}%`,
            animationDelay:    `${i * 0.65}s`,
            animationDuration: `${5 + (i % 4)}s`,
          }}
        >
          {n}
        </div>
      ))}
    </div>
  );
}

// ── Confetti burst ────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#f97316', '#fbbf24', '#7c3aed', '#ec4899', '#22c55e', '#3b82f6', '#f43f5e'];

export function Confetti({ active }) {
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999 }}>
      {Array.from({ length: 32 }, (_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left:              `${5 + Math.random() * 90}%`,
            top:               `${-5 + Math.random() * 8}%`,
            background:        CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay:    `${i * 0.045}s`,
            animationDuration: `${1.1 + Math.random() * 0.7}s`,
            borderRadius:      i % 3 === 0 ? '50%' : '2px',
            transform:         `rotate(${Math.floor(Math.random() * 360)}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ── Mascot ────────────────────────────────────────────────────────────────────
export function Mascot({ msg, size = 'md', celebrate = false }) {
  const px = size === 'lg' ? 76 : size === 'sm' ? 46 : 62;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
      <div
        className={celebrate ? 'animate-pop' : 'animate-bob'}
        style={{
          width:      px,
          height:     px,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #fb923c)',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize:   px * 0.44,
          flexShrink: 0,
          boxShadow:  '0 4px 18px rgba(249,115,22,0.4)',
        }}
      >
        🤖
      </div>
      {msg && (
        <div className="mascot-bubble animate-pop">{msg}</div>
      )}
    </div>
  );
}

// ── Phase navigation bar ──────────────────────────────────────────────────────
const PHASE_LIST = [
  { key: 'wonder',   label: 'Wonder',   num: '01' },
  { key: 'story',    label: 'Story',    num: '02' },
  { key: 'simulate', label: 'Simulate', num: '03' },
  { key: 'play',     label: 'Play',     num: '04' },
  { key: 'reflect',  label: 'Reflect',  num: '05' },
];

export function PhaseNav({ current }) {
  const idx = PHASE_LIST.findIndex(p => p.key === current);
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      gap:            6,
      flexWrap:       'wrap',
      justifyContent: 'center',
      padding:        '10px 16px',
    }}>
      {PHASE_LIST.map((p, i) => (
        <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            display:   'flex',
            alignItems: 'center',
            gap:        5,
            opacity:    i === idx ? 1 : i < idx ? 0.7 : 0.35,
            transition: 'opacity 0.3s',
          }}>
            <div className={`phase-dot ${i === idx ? 'active' : i < idx ? 'done' : ''}`}>
              {i < idx ? '✓' : p.num}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{p.label}</span>
          </div>
          {i < 4 && (
            <div style={{
              width:      18,
              height:     2,
              background: i < idx ? '#7c3aed' : 'rgba(255,255,255,0.2)',
              flexShrink: 0,
              transition: 'background 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Audio toggle ──────────────────────────────────────────────────────────────
export function AudioToggle() {
  const { state, dispatch } = useGame();
  return (
    <button
      onClick={() => {
        dispatch({ type: 'TOGGLE_AUDIO' });
        if (state.audioEnabled) stopNarration();
      }}
      title={state.audioEnabled ? 'Mute audio' : 'Enable audio'}
      style={{
        position:       'fixed',
        top:            14,
        right:          14,
        zIndex:         100,
        background:     'rgba(255,255,255,0.1)',
        border:         '1px solid rgba(255,255,255,0.2)',
        borderRadius:   '50%',
        width:          42,
        height:         42,
        cursor:         'pointer',
        fontSize:       18,
        color:          '#fff',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        transition:     'all 0.2s',
      }}
    >
      {state.audioEnabled ? '🔊' : '🔇'}
    </button>
  );
}

// ── XP display ────────────────────────────────────────────────────────────────
export function XPBar() {
  const { state } = useGame();
  return (
    <div style={{ position: 'fixed', top: 14, left: 14, zIndex: 100 }}>
      <motion.div
        key={state.xp}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="xp-chip"
      >
        ⭐ {state.xp} XP
      </motion.div>
    </div>
  );
}

// ── Home button (shown when inside journey) ───────────────────────────────────
export function HomeButton() {
  const { goPhase } = useGame();
  return (
    <div style={{ position: 'fixed', top: 68, left: 14, zIndex: 100 }}>
      <button
        className="btn btn-ghost"
        style={{ fontSize: 12, padding: '7px 13px' }}
        onClick={() => { stopNarration(); goPhase('home'); }}
      >
        🏠 Home
      </button>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, style: extraStyle }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="progress-bar" style={extraStyle}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Feedback toast ────────────────────────────────────────────────────────────
export function FeedbackToast({ correct, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{   opacity: 0, y: -6, scale: 0.95 }}
          style={{
            textAlign:    'center',
            padding:      '10px 16px',
            borderRadius: 12,
            marginTop:    10,
            background:   correct
              ? 'rgba(34,197,94,0.15)'
              : 'rgba(239,68,68,0.15)',
            border:       `1px solid ${correct ? '#22c55e' : '#ef4444'}`,
            fontWeight:   800,
            fontSize:     16,
            color:        correct ? '#86efac' : '#fca5a5',
          }}
        >
          {correct ? '✅ Correct! +10 XP' : '❌ Not quite — keep going!'}
        </motion.div>
      )}
    </AnimatePresence>
  );
}