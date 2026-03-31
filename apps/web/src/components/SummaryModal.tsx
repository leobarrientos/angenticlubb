'use client';

import { Simulation } from '@/hooks/useSimulation';

interface SummaryModalProps {
  simulation: Simulation;
  onClose: () => void;
  onReset: () => void;
}

export default function SummaryModal({ simulation, onClose, onReset }: SummaryModalProps) {
  const { stepsExecuted, failedAttempts, maxSteps, visitedCells, grid, initialPosition, position } = simulation;
  const successfulSteps = stepsExecuted - failedAttempts;
  const visitedCount = Object.keys(visitedCells).length;
  const totalCells = grid.rows * grid.cols;
  const coverage = ((visitedCount / totalCells) * 100).toFixed(1);

  const mostVisited = Object.entries(visitedCells)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cell, count]) => {
      const [x, y] = cell.split(',').map(Number);
      return { x, y, count };
    });

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Resumen final de simulación"
    >
      <div className="modal-card">
        <div className="modal-header">
          <span className="modal-emoji">🎉</span>
          <h2 className="modal-title">¡Simulación Completada!</h2>
          <p className="modal-subtitle">
            La hormiga recorrió {stepsExecuted} pasos en una cuadrícula {grid.rows}×{grid.cols}
          </p>
        </div>

        {/* Main stats */}
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-stat-value">{stepsExecuted}</span>
            <span className="summary-stat-label">Pasos totales</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat-value" style={{ color: 'var(--neon-blue)' }}>{visitedCount}</span>
            <span className="summary-stat-label">Celdas únicas</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat-value" style={{ color: 'var(--neon-purple)' }}>{coverage}%</span>
            <span className="summary-stat-label">Cobertura</span>
          </div>
        </div>

        {/* Detail stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
        }}>
          {[
            { label: '✓ Pasos exitosos', value: successfulSteps, color: 'var(--neon-green)' },
            { label: '✗ Intentos fallidos', value: failedAttempts, color: 'var(--neon-red)' },
            { label: '📍 Posición inicial', value: `(${initialPosition.x}, ${initialPosition.y})`, color: 'var(--neon-blue)' },
            { label: '🏁 Posición final', value: `(${position.x}, ${position.y})`, color: 'var(--neon-purple)' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                {item.label}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: item.color,
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Most visited cells */}
        {mostVisited.length > 0 && (
          <div className="most-visited">
            <div className="most-visited-title">🔥 Celdas más visitadas</div>
            <div className="most-visited-list">
              {mostVisited.map((cell, i) => (
                <span key={i} className="visited-chip">
                  ({cell.x}, {cell.y}) × {cell.count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="modal-actions">
          <button
            id="btn-summary-reset"
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={() => { onReset(); onClose(); }}
          >
            ↺ Nueva Simulación
          </button>
          <button
            id="btn-summary-close"
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Ver Mapa
          </button>
        </div>
      </div>
    </div>
  );
}
