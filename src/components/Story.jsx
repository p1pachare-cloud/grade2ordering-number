import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import { Mascot, PhaseNav, ProgressBar } from './SharedUI.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { getStoryNarration } from '../utils/narration.js';

import Slide0Image from '../../images 1.png';
import Slide1Image from '../../images 2.png';
import Slide2Image from '../../images 3.png';
import Slide3Image from '../../images 4.png';

const SLIDES = [
  {
    title:   "Alex's Stamps",
    emoji:   '📮',
    color:   '#f97316',
    body:    'Alex has 134 stamps. He collects 28 more. His cousin Mei has 165 stamps. Alex wonders...',
    question: '"Who has more stamps?"',
    mascot:  "Let's help Alex! 🗂️",
    nums:    [134, 165],
    image:   Slide0Image,
  },
  {
    title:   'The Number Line Map',
    emoji:   '📏',
    color:   '#7c3aed',
    body:    'Their teacher draws a number line from 100 to 200. She places 134 and 165 on it. The number 165 is further to the right — so Mei has more!',
    question: '"Which number is further to the right?"',
    mascot:  'Look at the number line! 👀',
    nums:    [134, 165],
    showLine: true,
    image:   Slide1Image,
  },
  {
    title:   'Ascending Order',
    emoji:   '⬆️',
    color:   '#ec4899',
    body:    'Alex, Mei, and Priya count their stamps: 98, 134, and 165. They want to line up from least to most — that\'s ascending order!',
    question: '"What is the correct order?"',
    mascot:  'Smallest first! ⬆️',
    nums:    [98, 134, 165],
    image:   Slide2Image,
  },
  {
    title:   'The Winner!',
    emoji:   '🏆',
    color:   '#22c55e',
    body:    'Using the number line: 98 < 134 < 165. Mei wins — she has the most stamps! The number line made it easy to compare.',
    question: '"What helped them compare numbers?"',
    mascot:  'The number line wins! 🏆',
    nums:    [98, 134, 165],
    showLT:  true,
    image:   Slide3Image,
  },
];

function NumberLineIllustration() {
  return (
    <div style={{ width: '100%', maxWidth: 300, margin: '10px auto 0', position: 'relative', height: 48 }}>
      <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99, position: 'relative', marginTop: 20 }}>
        <span style={{ position: 'absolute', left: 0,    top: -18, fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>100</span>
        <span style={{ position: 'absolute', right: 0,   top: -18, fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>200</span>
        {/* 134 marker */}
        <div style={{ position: 'absolute', left: '34%', top: -26, fontSize: 12, fontWeight: 800, color: '#f97316' }}>134</div>
        <div style={{ position: 'absolute', left: '34%', top: 3,   width: 3, height: 14, background: '#f97316', borderRadius: 2 }} />
        {/* 165 marker */}
        <div style={{ position: 'absolute', left: '65%', top: -26, fontSize: 12, fontWeight: 800, color: '#a78bfa' }}>165</div>
        <div style={{ position: 'absolute', left: '65%', top: 3,   width: 3, height: 14, background: '#a78bfa', borderRadius: 2 }} />
      </div>
    </div>
  );
}

function SlideScene({ slide }) {
  const s = SLIDES[slide];
  return (
    <div style={{
      background:    `${s.color}1a`,
      border:        `1px solid ${s.color}44`,
      borderRadius:  14,
      padding:       18,
      marginBottom:  16,
      minHeight:     130,
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      justifyContent: 'center',
      gap:           12,
      textAlign:     'center',
    }}>
      <div style={{ fontSize: 40 }}>{s.emoji}</div>
      {s.image && (
        <img
          src={s.image}
          alt={s.title}
          style={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 16,
            border: `1px solid ${s.color}55`,
            background: '#ffffff',
            boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
          }}
        />
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {s.nums.map((n, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              background:   `${s.color}33`,
              border:       `2px solid ${s.color}`,
              borderRadius: 11,
              padding:      '7px 14px',
              fontSize:     22,
              fontWeight:   800,
            }}>
              {n}
            </div>
            {s.showLT && i < s.nums.length - 1 && (
              <span style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}> &lt; </span>
            )}
          </div>
        ))}
      </div>
      {s.showLine && <NumberLineIllustration />}
    </div>
  );
}

export default function Story() {
  const { state, dispatch, goPhase } = useGame();
  const slide = state.storySlide;
  const s     = SLIDES[slide];

  useEffect(() => {
    narrate(getStoryNarration(slide), state.audioEnabled);
    return stopNarration;
  }, [slide]);

  function handleNext() {
    if (slide < 3) {
      dispatch({ type: 'NEXT_STORY' });
    } else {
      dispatch({ type: 'ADD_XP', payload: 30 });
      goPhase('simulate');
    }
  }

  return (
    <div style={{ maxWidth: 660, margin: '0 auto', padding: '10px 18px', position: 'relative', zIndex: 1 }}>
      <PhaseNav current="story" />

      <ProgressBar value={slide + 1} max={4} style={{ margin: '6px 0 10px' }} />
      <div style={{ textAlign: 'right', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>
        {slide + 1} / 4
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          className="card"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{   opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
          style={{ padding: 22 }}
        >
          <SlideScene slide={slide} />

          <h3 style={{ fontSize: 18, fontWeight: 800, color: s.color, marginBottom: 10 }}>{s.title}</h3>
          <p style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 14, color: 'rgba(255,255,255,0.88)' }}>
            {s.body}
          </p>

          {/* Question banner */}
          <div style={{
            background:  'rgba(0,0,0,0.2)',
            border:      `1px solid rgba(255,255,255,0.1)`,
            borderLeft:  `4px solid ${s.color}`,
            borderRadius: 11,
            padding:     '11px 14px',
            marginBottom: 14,
            fontSize:    16,
            fontWeight:  700,
            textAlign:   'center',
          }}>
            ✨ {s.question} ✨
          </div>

          <Mascot msg={s.mascot} size="sm" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
        <button
          className="btn btn-ghost"
          onClick={() => dispatch({ type: 'PREV_STORY' })}
          disabled={slide === 0}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width:        9,
              height:       9,
              borderRadius: '50%',
              background:   i === slide ? '#f59e0b' : 'rgba(255,255,255,0.2)',
              transition:   'all 0.3s',
            }} />
          ))}
        </div>

        <button className={slide < 3 ? 'btn btn-secondary' : 'btn btn-primary'} onClick={handleNext}>
          {slide < 3 ? 'Next →' : 'Simulate! 🎮'}
        </button>
      </div>
    </div>
  );
}