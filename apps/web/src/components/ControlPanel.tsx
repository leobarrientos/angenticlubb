'use client';

interface ControlPanelProps {
  status: 'idle' | 'running' | 'paused' | 'completed';
  speed: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (ms: number) => void;
  stepsExecuted: number;
  maxSteps: number;
  failedAttempts: number;
  progressPercent: number;
  directionArrow: string | null;
  lastDirection: string | null;
}

// Speed: slider left = fast (50ms), right = slow (1500ms) — inverted for UX
const SPEED_MIN = 50;
const SPEED_MAX = 1500;

function speedToLabel(ms: number): string {
  if (ms <= 100) return '⚡ Muy rápido';
  if (ms <= 300) return '🐌 Rápido';
  if (ms <= 700) return '🚶 Normal';
  if (ms <= 1200) return '🐢 Lento';
  return '🦥 Muy lento';
}

export default function ControlPanel({
  status, speed, onStart, onPause, onReset,
  onSpeedChange, stepsExecuted, maxSteps, failedAttempts,
  progressPercent, directionArrow, lastDirection,
}: ControlPanelProps) {

  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const hasSimulation = status !== 'idle';

  // Invert slider: left = fast, right = slow
  const sliderValue = SPEED_MAX + SPEED_MIN - speed;

  return (
    <div className="center-controls">
      {/* Direction indicator */}
      {lastDirection && (
        <div className="dir-indicator" style={{ marginBottom: 'var(--space-3)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Último movimiento:</span>
          <span className="dir-arrow">{directionArrow}</span>
          <span style={{ color: 'var(--neon-green)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600 }}>
            {lastDirection}
          </span>
        </div>
      )}

      {/* Progress bar */}
      {hasSimulation && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              Progreso
            </span>
            <span style={{ fontSize: 12, color: 'var(--neon-green)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
              {stepsExecuted} / {maxSteps}
            </span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {/* Stats row */}
      {hasSimulation && (
        <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="stat-card">
            <div className="stat-label">Pasos</div>
            <div className="stat-value">{stepsExecuted}</div>
            <div className="stat-sub">ejecutados</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Restantes</div>
            <div className="stat-value info">{maxSteps - stepsExecuted}</div>
            <div className="stat-sub">disponibles</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Fallidos</div>
            <div className="stat-value warn">{failedAttempts}</div>
            <div className="stat-sub">en borde</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Éxito</div>
            <div className="stat-value">{stepsExecuted - failedAttempts}</div>
            <div className="stat-sub">movimientos</div>
          </div>
        </div>
      )}

      {/* Speed slider */}
      <div className="slider-container" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
            🎮 Velocidad
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--neon-green)', fontWeight: 600 }}>
            {speedToLabel(speed)}
          </span>
        </div>
        <input
          id="slider-speed"
          type="range"
          className="form-slider"
          min={SPEED_MIN}
          max={SPEED_MAX}
          step={50}
          value={sliderValue}
          onChange={(e) => {
            const raw = parseInt(e.target.value, 10);
            onSpeedChange(SPEED_MAX + SPEED_MIN - raw);
          }}
        />
        <div className="slider-labels">
          <span>⚡ Rápido</span>
          <span>🐢 Lento</span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="btn-group">
        {!isRunning && !isCompleted && (
          <button
            id="btn-start"
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={onStart}
            disabled={!hasSimulation}
          >
            ▶ {stepsExecuted > 0 ? 'Continuar' : 'Iniciar'}
          </button>
        )}
        {isRunning && (
          <button
            id="btn-pause"
            className="btn btn-secondary"
            style={{ flex: 2 }}
            onClick={onPause}
          >
            ⏸ Pausar
          </button>
        )}
        <button
          id="btn-reset"
          className="btn btn-danger"
          style={{ flex: 1 }}
          onClick={onReset}
          disabled={!hasSimulation}
        >
          ↺ Reset
        </button>
      </div>

      {/* Legend */}
      <div style={{ paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--neon-green)' }} />
            <span>Hormiga</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ boxShadow: 'inset 0 0 0 2px rgba(0,191,255,0.4)', background: 'transparent', border: '2px solid rgba(0,191,255,0.4)' }} />
            <span>Inicio</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'rgba(255,100,30,0.6)' }} />
            <span>+ visitas</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'rgba(0,255,136,0.15)' }} />
            <span>Visitado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
