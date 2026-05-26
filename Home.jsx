import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import { Mascot } from './SharedUI.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { introNarration } from '../utils/narration.js';

const FEATURES = [
  { icon: '🎯', label: '100 Challenges' },
  { icon: '📏', label: 'Number Lines' },
  { icon: '🏅', label: 'Badges & XP' },
];

const JOURNEY = [
  { icon: '🔍', name: 'Wonder',   desc: 'A number mystery!' },
  { icon: '📖', name: 'Story',    desc: 'See ordering in action' },
  { icon: '🎮', name: 'Simulate', desc: 'Build number skills' },
  { icon: '🎯', name: 'Play',     desc: '100 challenges' },
  { icon: '🪞', name: 'Reflect',  desc: 'What did you learn?' },
];

export default function Home() {
  const { state, goPhase } = useGame();

  useEffect(() => {
    narrate(introNarration(), state.audioEnabled);
    return stopNarration;
  }, [state.audioEnabled]);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 18px', position: 'relative', zIndex: 1 }}>

      {/* Badge */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
          ✦ Grade 1 Maths · Singapore Curriculum
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ textAlign: 'center', fontSize: 'clamp(34px, 6vw, 58px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 6 }}
      >
        <span style={{ color: '#f97316' }}>Ordering </span>
        <span style={{ color: '#fbbf24' }}>Numbers</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)', marginBottom: 24, fontSize: 14 }}
      >
        Lesson 3.1 · Compare and order numbers up to 200
      </motion.p>

      {/* Mascot */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <Mascot msg="Let's find the biggest and smallest numbers! 🔢" size="lg" />
      </motion.div>

      {/* Intro blurb */}
      <motion.div className="card animate-fadeUp" style={{ padding: '18px 22px', marginBottom: 20, textAlign: 'center', animationDelay: '0.1s' }}>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: 'rgba(255,255,255,0.88)' }}>
          Learn to use{' '}
          <span style={{ color: '#fbbf24', fontWeight: 800 }}>number lines</span>
          {' '}to{' '}
          <span style={{ color: '#f97316', fontWeight: 800 }}>order numbers</span>
          , find bigger and smaller ones, and solve ordering challenges up to 200!
        </p>
      </motion.div>

      {/* Learning Journey map */}
      <motion.div className="card animate-fadeUp" style={{ padding: '18px 22px', marginBottom: 24, animationDelay: '0.15s' }}>
        <p style={{ textAlign: 'center', color: '#f59e0b', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 14 }}>
          YOUR LEARNING JOURNEY
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          {JOURNEY.map(({ icon, name, desc }, i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 11, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 17 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{desc}</div>
                </div>
              </div>
              {i < 4 && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>→</span>}
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          className="btn btn-primary animate-glowPulse"
          onClick={() => goPhase('wonder')}
        >
          🚀 Begin Your Journey!
        </button>
      </motion.div>

      {/* Features tray */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {FEATURES.map(({ icon, label }) => (
          <motion.div
            key={label}
            className="card"
            whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.12)' }}
            style={{ padding: '16px 10px', textAlign: 'center', cursor: 'default' }}
          >
            <div style={{ fontSize: 26, marginBottom: 5 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}