import { createContext, useContext, useReducer, useCallback } from 'react';
import { generateAllQuestions } from '../utils/questionGenerator.js';

// ── Initial state ─────────────────────────────────────────────────────────────
const initialState = {
  phase:            'home',        // home | wonder | story | simulate | play | reflect
  storySlide:       0,             // 0–3
  simStation:       0,             // 0–2
  simDone:          [false, false, false],
  questions:        [],            // generated on entering play
  qIndex:           0,
  correct:          0,
  streak:           0,
  maxStreak:        0,
  xp:               0,
  badge:            null,          // null | bronze | silver | gold | perfect
  audioEnabled:     true,
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'SET_PHASE':
      return { ...state, phase: action.payload };

    case 'NEXT_STORY':
      return { ...state, storySlide: Math.min(state.storySlide + 1, 3) };

    case 'PREV_STORY':
      return { ...state, storySlide: Math.max(state.storySlide - 1, 0) };

    case 'SET_SIM_STATION':
      return { ...state, simStation: action.payload };

    case 'COMPLETE_SIM_STATION': {
      const simDone = [...state.simDone];
      simDone[action.payload] = true;
      return { ...state, simDone, xp: state.xp + 50 };
    }

    case 'START_PLAY':
      return {
        ...state,
        questions: generateAllQuestions(),
        qIndex:    0,
        correct:   0,
        streak:    0,
        maxStreak: 0,
        badge:     null,
      };

    case 'ANSWER_CORRECT': {
      const streak    = state.streak + 1;
      const maxStreak = Math.max(streak, state.maxStreak);
      const streakXP  = streak % 5 === 0 ? 5 : 0;
      const timeXP    = action.timeBonusEarned ? 2 : 0;
      const newCorrect = state.correct + 1;
      const newIndex   = state.qIndex + 1;
      const done       = newIndex >= state.questions.length;
      const badge      = done ? computeBadge(newCorrect) : state.badge;
      return {
        ...state,
        qIndex:    newIndex,
        correct:   newCorrect,
        streak,
        maxStreak,
        xp:        state.xp + 10 + streakXP + timeXP,
        badge,
      };
    }

    case 'ANSWER_WRONG': {
      const newIndex = state.qIndex + 1;
      const done     = newIndex >= state.questions.length;
      const badge    = done ? computeBadge(state.correct) : state.badge;
      return { ...state, qIndex: newIndex, streak: 0, badge };
    }

    case 'ADD_XP':
      return { ...state, xp: state.xp + action.payload };

    case 'TOGGLE_AUDIO':
      return { ...state, audioEnabled: !state.audioEnabled };

    default:
      return state;
  }
}

// ── Badge helper ──────────────────────────────────────────────────────────────
export function computeBadge(correct) {
  if (correct === 100) return 'perfect';
  if (correct >= 85)   return 'gold';
  if (correct >= 65)   return 'silver';
  if (correct >= 40)   return 'bronze';
  return null;
}

// ── Context ───────────────────────────────────────────────────────────────────
export const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const goPhase = useCallback((phase) => {
    dispatch({ type: 'SET_PHASE', payload: phase });
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, goPhase }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}