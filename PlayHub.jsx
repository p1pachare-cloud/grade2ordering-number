import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, computeBadge } from '../../context/GameContext.jsx';
import { PhaseNav, Mascot, Confetti, ProgressBar } from '../SharedUI.jsx';
import { narrate, stopNarration } from '../../utils/audio.js';
import {
  playQuestionNarration,
  playStreakNarration,
  playMilestoneNarration,
} from '../../utils/narration.js';
import QuestionRenderer from './QuestionRenderer.jsx';

const BADGE_META = {
  perfect: { emoji: '💎', color: '#a78bfa', label: 'Perfect' },
  gold:    { emoji: '🥇', color: '#fbbf24', label: 'Gold'    },
  silver:  { emoji: '🥈', color: '#94a3b8', label: 'Silver'  },
  bronze:  { emoji: '🥉', color: '#cd7f32', label: 'Bronze'  },
};

// ── Play Done screen ──────────────────────────────────────────────────────────
function PlayDone() {
  const { state, goPhase } = useGame();
  const badge = state.badge;
  const meta  = badge ? BADGE_META[badge] : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ maxWidth: 560, margin: '0 auto', padding: '20px 18px', textAlign: 'center', position: 'relative', zIndex: 1 }}
    >
      <Confetti active />

      <div style={{ fontSize: 72, marginBottom: 12 }}>{meta ? meta.emoji : '⭐'}</div>
      <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 7 }}>Amazing Work!</h2>
      <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 20, fontSize: 17 }}>
        You answered{' '}
        <span style={{ color: '#fbbf24', fontWeight: 800 }}>{state.correct} / 100</span>
        {' '}correctly!
      </p>

      {meta && (
        <motion.div
          className="animate-badge"
          style={{
            display:      'inline-block',
            background:   `linear-gradient(135deg, ${meta.color}, ${meta.color}99)`,
            borderRadius: 14,
            padding:      '11px 26px',
            fontSize:     18,
            fontWeight:   800,
            marginBottom: 18,
            color:        '#000',
          }}
        >
          {meta.emoji} {meta.label} Badge!
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        {[
          ['✅', state.correct,   'Correct'  ],
          ['⭐', state.xp,        'Total XP' ],
          ['🔥', state.maxStreak, 'Best Streak'],
        ].map(([icon, val, label]) => (
          <div key={label} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>{val}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{label}</div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={() => goPhase('reflect')}>
        Reflect & Finish 🪞
      </button>
    </motion.div>
  );
}

// ── Main Play hub ─────────────────────────────────────────────────────────────
export default function PlayHub() {
  const { state, dispatch, goPhase } = useGame();
  const [confetti,     setConfetti]     = useState(false);
  const [showMilestone,setShowMilestone]= useState(false);
  const [milestoneNum, setMilestoneNum] = useState(0);
  const questionKey = useRef(0);

  // Ensure questions exist
  useEffect(() => {
    if (!state.questions.length) dispatch({ type: 'START_PLAY' });
  }, []);

  const q      = state.questions[state.qIndex];
  const total  = state.questions.length;
  const pct    = total > 0 ? (state.qIndex / total) * 100 : 0;
  const isDone = state.qIndex >= total && total > 0;

  // Narrate each new question
  useEffect(() => {
    if (q) narrate(playQuestionNarration(q.text), state.audioEnabled);
    return stopNarration;
  }, [state.qIndex]);

  if (isDone) return <PlayDone />;
  if (!q)     return <div style={{ padding: 40, textAlign: 'center' }}>Loading questions…</div>;

  function handleAnswer(correct) {
    const newIndex = state.qIndex + 1;

    if (correct) {
      dispatch({ type: 'ANSWER_CORRECT', timeBonusEarned: false });
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1600);

      // Streak milestone
      if ((state.streak + 1) % 5 === 0) {
        narrate(playStreakNarration(), state.audioEnabled);
      }
      // 10-question milestone
      if (newIndex % 10 === 0 && newIndex > 0) {
        narrate(playMilestoneNarration(newIndex), state.audioEnabled);
        setMilestoneNum(newIndex);
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 2600);
      }
    } else {
      dispatch({ type: 'ANSWER_WRONG' });
    }
    questionKey.current += 1;
  }

  const typeLabel = {
    compare_two:      'Compare',
    order_three:      'Order 3',
    order_four:       'Order 4',
    number_line:      'Number Line',
    one_more_less:    '1 More / Less',
    ten_more_less:    '10 More / Less',
    missing_sequence: 'Missing Number',
  }[q.type] || q.type;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '10px 18px', position: 'relative', zIndex: 1 }}>
      <PhaseNav current="play" />
      <Confetti active={confetti} />

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
          Q {state.qIndex + 1} / {total}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {state.streak >= 2 && (
            <div className="animate-streak" style={{
              background:   'linear-gradient(90deg, #f59e0b, #f97316)',
              borderRadius: 99,
              padding:      '4px 11px',
              fontSize:     12,
              fontWeight:   800,
            }}>
              🔥 {state.streak} streak
            </div>
          )}
          <motion.div key={state.xp} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="xp-chip">
            ⭐ {state.xp}
          </motion.div>
        </div>
      </div>

      <ProgressBar value={state.qIndex} max={total} style={{ marginBottom: 18 }} />

      {/* Milestone pop */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,   scale: 1 }}
            exit={{   opacity: 0, scale: 0.9 }}
            style={{
              background:   'linear-gradient(135deg, #7c3aed, #4f46e5)',
              borderRadius: 14,
              padding:      '13px 18px',
              textAlign:    'center',
              marginBottom: 14,
              border:       '1px solid rgba(255,255,255,0.15)',
              fontWeight:   800,
            }}
          >
            🎉 {milestoneNum} questions done! Keep it up!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionKey.current}
          className="card"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{   opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          style={{ padding: 22 }}
        >
          {/* Type label + mascot */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <span style={{
              background:    'rgba(255,255,255,0.08)',
              borderRadius:  99,
              padding:       '4px 11px',
              fontSize:      11,
              fontWeight:    700,
              color:         'rgba(255,255,255,0.55)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              {typeLabel}
            </span>
            {state.qIndex % 10 === 0 && (
              <Mascot size="sm" msg="Keep going! 🌟" />
            )}
          </div>

          <h3 style={{ fontSize: 'clamp(16px, 2.4vw, 21px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.45 }}>
            {q.text}
          </h3>

          <QuestionRenderer
            key={`q-${state.qIndex}`}
            question={q}
            onAnswer={handleAnswer}
          />
        </motion.div>
      </AnimatePresence>

      {/* Mini score bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14, color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
        <span>✅ {state.correct} correct</span>
        <span>❌ {state.qIndex - state.correct} wrong</span>
        <span>📊 {state.qIndex > 0 ? Math.round((state.correct / state.qIndex) * 100) : 0}% accuracy</span>
      </div>
    </div>
  );
}