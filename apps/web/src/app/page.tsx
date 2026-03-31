'use client';

import { useSimulation } from '@/hooks/useSimulation';
import SetupForm from '@/components/SetupForm';
import GridCanvas from '@/components/GridCanvas';
import ControlPanel from '@/components/ControlPanel';
import StepLogPanel from '@/components/StepLogPanel';
import SummaryModal from '@/components/SummaryModal';

export default function Home() {
  const {
    simulation,
    status,
    speed,
    lastDir,
    showSummary,
    hydrated,
    progressPercent,
    directionArrow,
    configure,
    start,
    pause,
    reset,
    setSpeed,
    closeSummary,
  } = useSimulation();

  if (!hydrated) {
    return (
      <div className="app-wrapper" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
          Cargando simulador…
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <span className="app-header-logo">🐜</span>
        <h1 className="app-header-title">
          La <span>Hormiga Borracha</span>
        </h1>
        <div style={{ marginLeft: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {simulation && (
            <span
              className={`status-badge ${
                status === 'running' ? 'running'
                : status === 'paused' ? 'paused'
                : status === 'completed' ? 'completed'
                : 'idle'
              }`}
            >
              {status === 'running' ? 'Corriendo'
                : status === 'paused' ? 'Pausado'
                : status === 'completed' ? 'Completado'
                : 'Listo'}
            </span>
          )}
        </div>
        <span className="app-header-badge">Random Walk Simulator</span>
      </header>

      {/* Main layout */}
      <main className="app-main">
        {/* Column 1: Setup form */}
        <SetupForm
          onConfigure={configure}
          disabled={status === 'running'}
        />

        {/* Column 2: Grid + Controls */}
        <div className="center-panel card">
          <div className="center-panel-grid">
            {simulation ? (
              <GridCanvas simulation={simulation} />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 'var(--space-4)',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: 'var(--space-8)',
              }}>
                <span style={{ fontSize: 64 }}>🐜</span>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Cuadrícula vacía
                </p>
                <p style={{ fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>
                  Configura el escenario en el panel izquierdo para comenzar la simulación
                </p>
              </div>
            )}
          </div>

          <ControlPanel
            status={status}
            speed={speed}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSpeedChange={setSpeed}
            stepsExecuted={simulation?.stepsExecuted ?? 0}
            maxSteps={simulation?.maxSteps ?? 0}
            failedAttempts={simulation?.failedAttempts ?? 0}
            progressPercent={progressPercent}
            directionArrow={directionArrow}
            lastDirection={lastDir}
          />
        </div>

        {/* Column 3: Step log */}
        <StepLogPanel log={simulation?.log ?? []} />
      </main>

      {/* Summary modal (CU-04) */}
      {showSummary && simulation && (
        <SummaryModal
          simulation={simulation}
          onClose={closeSummary}
          onReset={reset}
        />
      )}
    </div>
  );
}
