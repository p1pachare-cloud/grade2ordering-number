/**
 * Play question type components.
 * Each accepts: { question, onAnswer(correct: boolean) }
 */
import { useState, useRef } from 'react';
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

// ── Utility ───────────────────────────────────────────────────────────────────
function ResultBanner({ correct, correctAnswer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        textAlign:    'center',
        padding:      '10px 14px',
        borderRadius: 12,
        marginTop:    10,
        background:   correct ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        border:       `1px solid ${correct ? '#22c55e' : '#ef4444'}`,
        fontWeight:   800,
        fontSize:     16,
        color:        correct ? '#86efac' : '#fca5a5',
      }}
    >
      {correct ? '✅ Correct!' : `❌ Answer: ${Array.isArray(correctAnswer) ? correctAnswer.join(' → ') : correctAnswer}`}
    </motion.div>
  );
}

// ── Q1: Compare Two ───────────────────────────────────────────────────────────
export function CompareTwo({ question, onAnswer }) {
  const [sel,     setSel]     = useState(null);
  const [checked, setChecked] = useState(false);

  function pick(sym) {
    if (checked) return;
    setSel(sym);
    setChecked(true);
    setTimeout(() => onAnswer(sym === question.answer), 1200);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, margin: '22px 0', flexWrap: 'wrap' }}>
        <div style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: 16, padding: '16px 24px', fontSize: 44, fontWeight: 900, boxShadow: '0 4px 18px rgba(0,0,0,0.3)' }}>
          {question.a}
        </div>
        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          {['>', '<', '='].map(sym => (
            <button
              key={sym}
              className={`btn-symbol ${checked && sel === sym ? (sym === question.answer ? 'correct' : 'wrong') : ''} ${checked && sym === question.answer ? 'correct' : ''}`}
              onClick={() => pick(sym)}
              disabled={checked}
            >
              {sym}
            </button>
          ))}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: 16, padding: '16px 24px', fontSize: 44, fontWeight: 900, boxShadow: '0 4px 18px rgba(0,0,0,0.3)' }}>
          {question.b}
        </div>
      </div>
      {checked && <ResultBanner correct={sel === question.answer} correctAnswer={question.answer} />}
    </div>
  );
}

// ── Q2 & Q3: Order Three / Four ───────────────────────────────────────────────
function SortableItem({ id, checked, isCorrect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
      {...listeners}
      className={`sort-item ${checked ? (isCorrect ? 'sort-ok' : 'sort-wrong') : ''}`}
    >
      {id}
    </div>
  );
}

export function OrderChoice({ question, onAnswer }) {
  const [order,   setOrder]   = useState(() => question.options.map(String));
  const [checked, setChecked] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));
  const ans     = question.answer.map(String);

  function handleDragEnd({ active, over }) {
    if (checked || !over || active.id === over.id) return;
    setOrder(prev => {
      const oi = prev.indexOf(active.id);
      const ni = prev.indexOf(over.id);
      return arrayMove(prev, oi, ni);
    });
  }

  function confirm() {
    setChecked(true);
    const ok = JSON.stringify(order) === JSON.stringify(ans);
    setTimeout(() => onAnswer(ok), 1400);
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={horizontalListSortingStrategy}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', margin: '18px 0' }}>
            {order.map((id, i) => (
              <SortableItem key={id} id={id} checked={checked} isCorrect={checked && ans[i] === id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
        Drag to reorder
      </p>
      {!checked
        ? <div style={{ textAlign: 'center' }}><button className="btn btn-secondary" onClick={confirm}>✅ Confirm Order</button></div>
        : <ResultBanner correct={JSON.stringify(order) === JSON.stringify(ans)} correctAnswer={question.answer} />
      }
    </div>
  );
}

// ── Q4: Number Line Placement ─────────────────────────────────────────────────
export function NumberLinePlacement({ question, onAnswer }) {
  const [clicked, setClicked] = useState(null);
  const [checked, setChecked] = useState(false);
  const lineRef = useRef(null);
  const range   = question.lineEnd - question.lineStart;

  function handleClick(e) {
    if (checked) return;
    const rect = lineRef.current.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const val  = Math.round(question.lineStart + range * pct);
    setClicked(val);
    setChecked(true);
    const ok = Math.abs(val - question.target) <= 2;
    setTimeout(() => onAnswer(ok), 1300);
  }

  const ok = clicked !== null && Math.abs(clicked - question.target) <= 2;

  return (
    <div>
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.65)', marginBottom: 14, fontSize: 14 }}>
        Click where <strong style={{ color: '#fbbf24' }}>{question.target}</strong> belongs
      </p>
      <div
        ref={lineRef}
        onClick={handleClick}
        style={{ cursor: checked ? 'default' : 'crosshair', padding: '20px 10px 38px', userSelect: 'none', position: 'relative' }}
      >
        <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.18)', borderRadius: 99, position: 'relative' }}>
          {Array.from({ length: 5 }, (_, i) => {
            const v = question.lineStart + Math.round(range * i / 4);
            return (
              <div key={v} style={{ position: 'absolute', left: `${i * 25}%`, transform: 'translateX(-50%)' }}>
                <div style={{ width: 2, height: 14, background: 'rgba(255,255,255,0.35)' }} />
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', transform: 'translateX(-50%)', marginTop: 2 }}>{v}</div>
              </div>
            );
          })}
          {/* Correct position */}
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ position: 'absolute', left: `${((question.target - question.lineStart) / range) * 100}%`, transform: 'translateX(-50%) translateY(-28px)', fontSize: 13, fontWeight: 800, color: '#22c55e', whiteSpace: 'nowrap' }}
            >
              ✓ {question.target}
            </motion.div>
          )}
          {/* Clicked position */}
          {clicked !== null && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ position: 'absolute', left: `${((clicked - question.lineStart) / range) * 100}%`, transform: 'translateX(-50%) translateY(10px)', fontSize: 11, color: ok ? '#22c55e' : '#f87171' }}
            >
              ▲ {clicked}
            </motion.div>
          )}
        </div>
      </div>
      {checked && <ResultBanner correct={ok} correctAnswer={question.target} />}
    </div>
  );
}

// ── Q5 & Q6: MCQ (1 more/less, 10 more/less, missing sequence) ───────────────
export function MultipleChoice({ question, onAnswer }) {
  const [sel,     setSel]     = useState(null);
  const [checked, setChecked] = useState(false);

  function pick(opt) {
    if (checked) return;
    setSel(opt);
    setChecked(true);
    setTimeout(() => onAnswer(opt === question.answer), 1200);
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '18px 0' }}>
        {question.options.map(opt => (
          <button
            key={opt}
            className={`option-btn ${
              checked && opt === question.answer ? 'correct' :
              checked && opt === sel ? 'wrong' :
              opt === sel ? 'selected' : ''
            }`}
            onClick={() => pick(opt)}
            disabled={checked}
          >
            {opt}
          </button>
        ))}
      </div>
      {checked && <ResultBanner correct={sel === question.answer} correctAnswer={question.answer} />}
    </div>
  );
}

// ── Router: pick correct component by type ────────────────────────────────────
export default function QuestionRenderer({ question, onAnswer }) {
  switch (question.type) {
    case 'compare_two':
      return <CompareTwo question={question} onAnswer={onAnswer} />;
    case 'order_three':
    case 'order_four':
      return <OrderChoice question={question} onAnswer={onAnswer} />;
    case 'number_line':
      return <NumberLinePlacement question={question} onAnswer={onAnswer} />;
    case 'one_more_less':
    case 'ten_more_less':
    case 'missing_sequence':
    default:
      return <MultipleChoice question={question} onAnswer={onAnswer} />;
  }
}