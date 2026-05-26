import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import { PhaseNav, Mascot, Confetti } from './SharedUI.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { reflectNarration } from '../utils/narration.js';

const BADGE_META = {
  perfect: { emoji: '💎', color: '#a78bfa', label: 'Perfect'  },
  gold:    { emoji: '🥇', color: '#fbbf24', label: 'Gold'     },
  silver:  { emoji: '🥈', color: '#94a3b8', label: 'Silver'   },
  bronze:  { emoji: '🥉', color: '#cd7f32', label: 'Bronze'   },
};

const REFLECT_QUESTIONS = [
  'What does ascending order mean?',
  'How does a number line help you order numbers?',
];

export default function Reflect() {
  const { state, dispatch, goPhase } = useGame();
  const [answers, setAnswers] = useState(['', '']);

  const badge = state.badge;
  const meta  = badge ? BADGE_META[badge] : null;

  useEffect(() => {
    narrate(reflectNarration(), state.audioEnabled);
    return stopNarration;
  }, []);

  function setAnswer(i, val) {
    setAnswers(prev => { const a = [...prev]; a[i] = val; return a; });
  }

  function tryAgain() {
    dispatch({ type: 'START_PLAY' });
    goPhase('play');
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '10px 18px', position: 'relative', zIndex: 1 }}>
      <PhaseNav current="reflect" />
      <Confetti active />

      {/* Mascot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}
      >
        <Mascot msg="Brilliant work today! 🌟" size="lg" celebrate />
      </motion.div>

      {/* Summary card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          padding:     24,
          marginBottom: 18,
          textAlign:   'center',
          border:      meta ? `1px solid ${meta.color}44` : undefined,
        }}
      >
        <div style={{ fontSize: 54, marginBottom: 8 }}>{meta ? meta.emoji : '⭐'}</div>

        {meta && (
          <motion.div
            className="animate-badge"
            style={{
              display:      'inline-block',
              background:   `linear-gradient(135deg, ${meta.color}, ${meta.color}88)`,
              borderRadius: 12,
              padding:      '8px 22px',
              fontWeight:   800,
              fontSize:     17,
              marginBottom: 16,
              color:        '#000',
            }}
          >
            {meta.emoji} {meta.label} Badge!
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            ['✅', `${state.correct}/100`, 'Correct'    ],
            ['⭐', state.xp,               'XP Earned'  ],
            ['🔥', `${state.maxStreak}x`,  'Best Streak'],
          ].map(([icon, val, label]) => (
            <div key={label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 11, padding: 12 }}>
              <div style={{ fontSize: 22 }}>{icon}</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#fbbf24' }}>{val}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Consolidation questions */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ padding: 22, marginBottom: 20 }}
      >
        <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 14, color: '#fbbf24' }}>
          🪞 Think About It
        </h3>
        {REFLECT_QUESTIONS.map((qs, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <p style={{ fontWeight: 700, marginBottom: 7, fontSize: 14 }}>
              {i + 1}. {qs}
            </p>
            <textarea
              value={answers[i]}
              onChange={e => setAnswer(i, e.target.value)}
              placeholder="Write your answer here…"
            />
          </div>
        ))}
      </motion.div>

      {/* What you learned */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ padding: 22, marginBottom: 24 }}
      >
        <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: '#fbbf24' }}>
          📚 What You Learned Today
        </h3>
        {[
          'Compare numbers using >, < and = symbols',
          'Arrange numbers in ascending order (smallest → largest)',
          'Arrange numbers in descending order (largest → smallest)',
          'Place numbers correctly on a number line',
          'Find 1 more, 1 less, 10 more, 10 less than any number',
          'Find missing numbers in counting sequences',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
            <span style={{ color: '#22c55e', fontWeight: 800, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </motion.div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost"      onClick={() => goPhase('home')}>🏠 Home</button>
        <button className="btn btn-secondary"  onClick={tryAgain}>🔄 Try Again</button>
        <button className="btn btn-primary"    onClick={() => window.open('https://intelliasg.com/courses/grade-1-math/', '_blank')}>
          Next Lesson →
        </button>
      </div>
    </div>
  );
}