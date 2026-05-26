import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext.jsx';
import { narrate, stopNarration } from '../../utils/audio.js';
import {
  simulateStation3Intro,
  simulateStation3Correct,
  simulateStation3Wrong,
} from '../../utils/narration.js';
import { randInt } from '../../utils/questionGenerator.js';

function buildPairs(n = 5) {
  return Array.from({ length: n }, () => {
    const a = randInt(1, 200);
    const b = randInt(1, 200);
    return { a, b, answer: a > b ? '>' : a < b ? '<' : '=' };
  });
}

export default function Station3({ onComplete }) {
  const { state, dispatch } = useGame();
  const [pairs]     = useState(buildPairs);
  const [idx,        setIdx]       = useState(0);
  const [selected,   setSelected]  = useState(null);
  const [checked,    setChecked]   = useState(false);
  const [timer,      setTimer]     = useState(10);
  const [scores,     setScores]    = useState(0);
  const [done,       setDone]      = useState(false);
  const timerRef    = useRef(null);

  useEffect(() => {
    narrate(simulateStation3Intro(), state.audioEnabled);
    return stopNarration;
  }, []);

  // Reset timer on each new question
  useEffect(() => {
    setTimer(10);
    setSelected(null);
    setChecked(false);

    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [idx]);

  function handleTimeout() {
    if (checked) return;
    setChecked(true);
    narrate([{ text: `Time's up! The answer was ${pairs[idx].answer}.`, style: 'statement' }], state.audioEnabled);
    setTimeout(() => advance(), 1600);
  }

  function handleAnswer(sym) {
    if (checked) return;
    clearInterval(timerRef.current);
    setSelected(sym);
    setChecked(true);

    const ok = sym === pairs[idx].answer;
    if (ok) {
      setScores(s => s + 1);
      dispatch({ type: 'ADD_XP', payload: 10 });
      narrate(simulateStation3Correct(), state.audioEnabled);
    } else {
      narrate(simulateStation3Wrong(pairs[idx].answer), state.audioEnabled);
    }
    setTimeout(() => advance(), 1500);
  }

  function advance() {
    if (idx + 1 >= pairs.length) { setDone(true); return; }
    setIdx(i => i + 1);
  }

  if (done) {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ padding: 28, maxWidth: 500, margin: '0 auto', textAlign: 'center' }}
      >
        <div style={{ fontSize: 52, marginBottom: 10 }}>⚔️</div>
        <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8, color: '#fbbf24' }}>Duel Complete!</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
          You got{' '}
          <span style={{ color: '#f59e0b', fontWeight: 800 }}>{scores}/5</span> correct!
        </p>
        <div className="xp-chip" style={{ marginBottom: 20 }}>+{scores * 10} XP earned</div>
        <button className="btn btn-primary" onClick={onComplete}>Finish Simulate! 🎉</button>
      </motion.div>
    );
  }

  const pair = pairs[idx];

  return (
    <div className="card" style={{ padding: 24, maxWidth: 520, margin: '0 auto' }}>
      <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 4, color: '#fbbf24' }}>
        ⚔️ Station 3: Number Duel
      </h3>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          Question {idx + 1}/5 · Score: {scores}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 70, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              style={{
                height:     '100%',
                background: timer > 5 ? '#f59e0b' : '#ef4444',
                borderRadius: 99,
              }}
              animate={{ width: `${(timer / 10) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: timer > 5 ? '#f59e0b' : '#ef4444' }}>
            {timer}s
          </span>
        </div>
      </div>

      {/* Duel cards + symbols */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{   opacity: 0, scale: 0.85 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, margin: '24px 0', flexWrap: 'wrap' }}
        >
          {/* Left number */}
          <div style={{
            background:   'linear-gradient(135deg, #7c3aed, #4f46e5)',
            borderRadius: 16,
            padding:      '18px 26px',
            fontSize:     46,
            fontWeight:   900,
            boxShadow:    '0 6px 20px rgba(0,0,0,0.3)',
          }}>
            {pair.a}
          </div>

          {/* Symbol buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {['>', '<', '='].map(sym => (
              <button
                key={sym}
                className={`btn-symbol ${
                  checked && selected === sym
                    ? sym === pair.answer ? 'correct' : 'wrong'
                    : ''
                } ${
                  checked && sym === pair.answer && selected !== sym ? 'correct' : ''
                }`}
                onClick={() => handleAnswer(sym)}
                disabled={checked}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Right number */}
          <div style={{
            background:   'linear-gradient(135deg, #f97316, #fb923c)',
            borderRadius: 16,
            padding:      '18px 26px',
            fontSize:     46,
            fontWeight:   900,
            boxShadow:    '0 6px 20px rgba(0,0,0,0.3)',
          }}>
            {pair.b}
          </div>
        </motion.div>
      </AnimatePresence>

      {checked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign:  'center',
            fontWeight: 800,
            fontSize:   16,
            color:      selected === pair.answer ? '#22c55e' : '#f87171',
          }}
        >
          {selected === pair.answer ? '✅ Correct!' : `❌ Answer: ${pair.answer}`}
        </motion.p>
      )}
    </div>
  );
}