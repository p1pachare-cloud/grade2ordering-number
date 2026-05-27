import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import { Mascot, PhaseNav } from './SharedUI.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { wonderNarration } from '../utils/narration.js';

export default function Wonder() {
  const { state, dispatch, goPhase } = useGame();

  useEffect(() => {
    narrate(wonderNarration(), state.audioEnabled);
    return stopNarration;
  }, []);

  function handleDiscover() {
    dispatch({ type: 'ADD_XP', payload: 20 });
    goPhase('story');
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '10px 18px', position: 'relative', zIndex: 1 }}>
      <PhaseNav current="wonder" />

      {/* Big question mark */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14 }}
        style={{ textAlign: 'center', marginTop: 24, marginBottom: 20 }}
      >
        <div
          className="animate-bob"
          style={{
            width:          134,
            height:         134,
            borderRadius:   '50%',
            background:     'linear-gradient(135deg, #5b21b6, #7c3aed)',
            margin:         '0 auto 20px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       60,
            boxShadow:      '0 0 40px rgba(124,58,237,0.55)',
          }}
        >
          ❓
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Mascot msg="Hmm… I wonder… 🤔" size="sm" />
        </div>
      </motion.div>

      {/* Wonder card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          padding:    '30px 26px',
          textAlign:  'center',
          marginBottom: 24,
          border:     '1px solid rgba(124,58,237,0.4)',
        }}
      >
        <div style={{ fontSize: 34, marginBottom: 10 }}>🗺️</div>
        <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
          If you had{' '}
          <span style={{ color: '#fbbf24' }}>150 crayons</span>
          {' '}and your friend had{' '}
          <span style={{ color: '#f97316' }}>175 crayons</span>
          , who has more? How do you know?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', fontSize: 14 }}>
          Numbers are like secret maps — they help us compare things!
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        style={{ textAlign: 'center' }}
      >
        <button className="btn btn-primary" onClick={handleDiscover}>
          ✨ Let's Discover! ✨
        </button>
      </motion.div>
    </div>
  );
}