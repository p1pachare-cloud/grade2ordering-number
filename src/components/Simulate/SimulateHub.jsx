import { useMemo } from 'react';
import { PhaseNav, Mascot, ProgressBar } from '../SharedUI.jsx';
import { useGame } from '../../context/GameContext.jsx';
import Station1 from './Station_NumberLine.jsx';
import Station2 from './Station_OrderingMachine.jsx';
import Station3 from './Station_Duel.jsx';

const STATIONS = [
  { title: 'Number Line Explorer', subtitle: 'Place numbers correctly on the number line.', component: Station1 },
  { title: 'Ordering Machine', subtitle: 'Sort the numbers in the correct order.', component: Station2 },
  { title: 'Number Duel', subtitle: 'Choose the correct comparison symbol.', component: Station3 },
];

export default function SimulateHub() {
  const { state, dispatch, goPhase } = useGame();
  const current = Math.min(Math.max(state.simStation ?? 0, 0), STATIONS.length - 1);
  const station = STATIONS[current];
  const Station = station.component;
  const completedCount = state.simDone.filter(Boolean).length;
  const allComplete = completedCount >= STATIONS.length;

  const progressLabel = useMemo(() => {
    if (allComplete) return 'All stations completed!';
    return `Station ${current + 1} of ${STATIONS.length}`;
  }, [allComplete, current]);

  function handleStationComplete() {
    dispatch({ type: 'COMPLETE_SIM_STATION', payload: current });

    if (current < STATIONS.length - 1) {
      dispatch({ type: 'SET_SIM_STATION', payload: current + 1 });
    } else {
      goPhase('play');
    }
  }

  if (allComplete) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '10px 18px', position: 'relative', zIndex: 1 }}>
        <PhaseNav current="simulate" />
        <div className="card" style={{ padding: 28, textAlign: 'center', marginTop: 20 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Simulation Complete!</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 22 }}>
            You finished all three simulation stations. Great work! Now move on to the play challenge.
          </p>
          <button className="btn btn-primary" onClick={() => goPhase('play')}>
            Continue to Play →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '10px 18px', position: 'relative', zIndex: 1 }}>
      <PhaseNav current="simulate" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, margin: '18px 0' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.6, color: '#fbbf24', marginBottom: 6 }}>SIMULATION JOURNEY</div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, margin: 0 }}>Build your ordering skills.</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: 8 }}>{station.subtitle}</p>
        </div>
        <Mascot msg="Let's level up! 🚀" size="sm" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div className="card" style={{ flex: '1 1 220px', padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#fbbf24', marginBottom: 8 }}>Current station</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{station.title}</div>
        </div>
        <div className="card" style={{ flex: '1 1 220px', padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#7c3aed', marginBottom: 8 }}>Progress</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{progressLabel}</div>
          <div style={{ marginTop: 12 }}>
            <ProgressBar value={completedCount} max={STATIONS.length} />
          </div>
        </div>
      </div>

      <Station onComplete={handleStationComplete} />
    </div>
  );
}
