import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useGame } from '../../context/GameContext.jsx';
import { narrate, stopNarration } from '../../utils/audio.js';
import {
  simulateStation2Intro,
  simulateStation2Correct,
  simulateStation2Wrong,
} from '../../utils/narration.js';
import { uniqueNums, shuffle } from '../../utils/questionGenerator.js';

// Three rounds of increasing difficulty
function buildRounds() {
  return [
    { nums: uniqueNums(3,  1,  99), dir: 'asc'  },
    { nums: uniqueNums(3, 100, 200), dir: 'asc'  },
    { nums: uniqueNums(4,   1, 200), dir: 'desc' },
  ];
}

function SortableNumber({ id, value, checked, isCorrect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.45 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`sort-item ${checked ? (isCorrect ? 'sort-ok' : 'sort-wrong') : ''}`}
    >
      {value}
    </div>
  );
}

export default function Station2({ onComplete }) {
  const { state } = useGame();
  const [rounds]  = useState(buildRounds);
  const [round,    setRound]    = useState(0);
  const [order,    setOrder]    = useState(() => shuffle(rounds[0].nums.map(String)));
  const [checked,  setChecked]  = useState(false);
  const [isCorrect,setIsCorrect]= useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    narrate(simulateStation2Intro(), state.audioEnabled);
    return stopNarration;
  }, []);

  const rnd    = rounds[round];
  const sorted = [...rnd.nums].sort((a, b) => rnd.dir === 'asc' ? a - b : b - a).map(String);

  function handleDragEnd({ active, over }) {
    if (checked || !over || active.id === over.id) return;
    setOrder(prev => {
      const oldIdx = prev.indexOf(active.id);
      const newIdx = prev.indexOf(over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }

  function checkOrder() {
    const ok = JSON.stringify(order) === JSON.stringify(sorted);
    setIsCorrect(ok);
    setChecked(true);
    if (ok) narrate(simulateStation2Correct(), state.audioEnabled);
    else    narrate(simulateStation2Wrong(),   state.audioEnabled);
  }

  function nextRound() {
    if (round + 1 >= rounds.length) { onComplete(); return; }
    const nr = round + 1;
    setRound(nr);
    setOrder(shuffle(rounds[nr].nums.map(String)));
    setChecked(false);
    setIsCorrect(false);
  }

  return (
    <div className="card" style={{ padding: 24, maxWidth: 580, margin: '0 auto' }}>
      <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 4, color: '#fbbf24' }}>
        🏭 Station 2: Ordering Machine
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 4 }}>
        Round {round + 1}/3 — Sort{' '}
        <strong style={{ color: '#fff' }}>
          {rnd.dir === 'asc' ? 'smallest → largest' : 'largest → smallest'}
        </strong>
      </p>

      {/* Round progress */}
      <div className="progress-bar" style={{ marginBottom: 18 }}>
        <div className="progress-fill" style={{ width: `${(round / 3) * 100}%` }} />
      </div>

      {/* Conveyor belt */}
      <div style={{
        background:    'rgba(0,0,0,0.25)',
        borderRadius:  12,
        padding:       16,
        marginBottom:  12,
        minHeight:     80,
        display:       'flex',
        alignItems:    'center',
        justifyContent: 'center',
      }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={horizontalListSortingStrategy}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {order.map((id, i) => (
                <SortableNumber
                  key={id}
                  id={id}
                  value={id}
                  checked={checked}
                  isCorrect={checked && sorted[i] === id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
        Drag numbers to reorder them
      </p>

      <AnimatePresence mode="wait">
        {!checked ? (
          <motion.div key="check" style={{ textAlign: 'center' }}>
            <button className="btn btn-secondary" onClick={checkOrder}>✅ Check Order</button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}
          >
            {isCorrect ? (
              <p style={{ color: '#22c55e', fontWeight: 800, fontSize: 16, marginBottom: 12 }}>
                🎉 Perfect order! Factory bell rings!
              </p>
            ) : (
              <div style={{ marginBottom: 12 }}>
                <p style={{ color: '#f87171', fontWeight: 700, marginBottom: 6 }}>
                  Not quite! Correct order:
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {sorted.map((n, i) => (
                    <span key={i} style={{
                      background:   'rgba(34,197,94,0.18)',
                      border:       '1px solid #22c55e',
                      borderRadius: 8,
                      padding:      '5px 14px',
                      fontWeight:   800,
                      fontSize:     18,
                    }}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button className="btn btn-primary" onClick={nextRound}>
              {round + 1 < rounds.length ? 'Next Round →' : 'Complete! 🏭'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}