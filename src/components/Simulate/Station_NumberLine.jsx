import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext.jsx';
import { Mascot } from '../SharedUI.jsx';
import { narrate, stopNarration } from '../../utils/audio.js';
import {
  simulateStation1Intro,
  simulateStation1Correct,
  simulateStation1Wrong,
  simulateStation1Complete,
} from '../../utils/narration.js';
import { uniqueNums } from '../../utils/questionGenerator.js';

export default function Station1({ onComplete }) {
  const { state } = useGame();
  // Generate 4 unique nums once on mount
  const nums      = useRef(uniqueNums(4, 15, 185)).current;
  const [selected, setSelected] = useState(null);   // currently "held" number
  const [placed,   setPlaced]   = useState({});     // { num: 'correct'|'wrong' }
  const lineRef   = useRef(null);

  useEffect(() => {
    narrate(simulateStation1Intro(), state.audioEnabled);
    return stopNarration;
  }, []);

  const allCorrect = nums.every(n => placed[n] === 'correct');

  useEffect(() => {
    if (allCorrect) {
      narrate(simulateStation1Complete(), state.audioEnabled);
    }
  }, [allCorrect]);

  function handleTokenClick(n) {
    if (placed[n] === 'correct') return;
    setSelected(prev => (prev === n ? null : n));
  }

  function handleLineClick(e) {
    if (!selected) return;
    const rect = lineRef.current.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const val  = Math.round(pct * 200);
    const ok   = Math.abs(val - selected) <= 15;

    setPlaced(prev => ({ ...prev, [selected]: ok ? 'correct' : 'wrong' }));
    setSelected(null);

    if (ok) narrate(simulateStation1Correct(), state.audioEnabled);
    else    narrate(simulateStation1Wrong(),   state.audioEnabled);
  }

  const correctCount = Object.values(placed).filter(v => v === 'correct').length;

  return (
    <div className="card" style={{ padding: 24, maxWidth: 580, margin: '0 auto' }}>
      <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 4, color: '#fbbf24' }}>
        📏 Station 1: Number Line Explorer
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 18 }}>
        Click a number to pick it up, then click on the number line to place it!
      </p>

      {/* Token row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22, justifyContent: 'center' }}>
        {nums.map(n => (
          <motion.div
            key={n}
            whileHover={{ scale: placed[n] === 'correct' ? 1 : 1.07 }}
            whileTap={{   scale: 0.95 }}
            onClick={() => handleTokenClick(n)}
            className="nl-token"
            style={{
              background: placed[n] === 'correct'
                ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                : placed[n] === 'wrong'
                  ? 'linear-gradient(135deg,#ef4444,#dc2626)'
                  : selected === n
                    ? 'linear-gradient(135deg,#f59e0b,#f97316)'
                    : undefined,
              outline:   selected === n ? '3px solid #f59e0b' : 'none',
              cursor:    placed[n] === 'correct' ? 'default' : 'pointer',
            }}
          >
            {n}
          </motion.div>
        ))}
      </div>

      {/* Instruction */}
      {selected && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', color: '#f59e0b', fontSize: 13, fontWeight: 700, marginBottom: 8 }}
        >
          Now click where <strong>{selected}</strong> belongs on the number line!
        </motion.p>
      )}

      {/* Number line */}
      <div
        ref={lineRef}
        onClick={handleLineClick}
        style={{
          position:   'relative',
          padding:    '22px 0 38px',
          cursor:     selected ? 'crosshair' : 'default',
          userSelect: 'none',
        }}
      >
        <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.18)', borderRadius: 99, position: 'relative' }}>
          {/* Tick marks */}
          {[0, 25, 50, 75, 100, 125, 150, 175, 200].map(v => (
            <div key={v} style={{ position: 'absolute', left: `${(v / 200) * 100}%`, transform: 'translateX(-50%)' }}>
              <div style={{ width: 2, height: 14, background: 'rgba(255,255,255,0.35)' }} />
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', transform: 'translateX(-50%)', whiteSpace: 'nowrap', marginTop: 2 }}>
                {v}
              </div>
            </div>
          ))}

          {/* Placed markers */}
          {Object.entries(placed).map(([n, status]) => (
            <motion.div
              key={n}
              initial={{ scale: 0, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                position:   'absolute',
                left:       `${(parseInt(n) / 200) * 100}%`,
                transform:  'translateX(-50%) translateY(-28px)',
                fontSize:   13,
                fontWeight: 800,
                color:      status === 'correct' ? '#22c55e' : '#f87171',
                textShadow: '0 0 6px rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap',
              }}
            >
              ▼ {n}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress & complete */}
      <div style={{ textAlign: 'center' }}>
        {!allCorrect && (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 10 }}>
            {correctCount} / {nums.length} placed correctly
          </p>
        )}
        {allCorrect && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p style={{ color: '#22c55e', fontWeight: 800, fontSize: 17, marginBottom: 12 }}>
              🎉 You mapped all the numbers!
            </p>
            <button className="btn btn-primary" onClick={onComplete}>
              Next Station →
            </button>
          </motion.div>
        )}
        {!allCorrect && Object.keys(placed).length > 0 && !allCorrect && (
          <Mascot msg={correctCount > 0 ? `${correctCount} down, ${nums.length - correctCount} to go!` : 'Pick a number and place it!'} size="sm" />
        )}
      </div>
    </div>
  );
}