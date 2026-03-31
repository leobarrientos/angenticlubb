'use client';

import { useEffect, useRef } from 'react';
import { StepLog, Direction } from '@/hooks/useSimulation';

const DIR_ICONS: Record<Direction, string> = {
  NORTE: '↑', SUR: '↓', ESTE: '→', OESTE: '←',
};

interface StepLogPanelProps {
  log: StepLog[];
}

export default function StepLogPanel({ log }: StepLogPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  if (log.length === 0) {
    return (
      <div className="log-panel card">
        <div className="card-header">
          <span className="card-icon">📋</span>
          <span className="card-title">CU-03 · Log de Movimientos</span>
        </div>
        <div className="card-body" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="log-empty">
            <span className="log-empty-icon">🐜</span>
            <span>Inicia la simulación<br />para ver los movimientos</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="log-panel card">
      <div className="card-header">
        <span className="card-icon">📋</span>
        <span className="card-title">CU-03 · Log de Movimientos</span>
        <span style={{
          marginLeft: 'auto',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--neon-green)',
          fontWeight: 600,
        }}>
          {log.length}
        </span>
      </div>

      <div className="card-body" style={{ padding: 'var(--space-3)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="log-list">
          {/* Show last 200 entries for performance */}
          {log.slice(-200).map((entry) => (
            <div
              key={entry.step}
              className={`log-item${entry.success ? '' : ' failed'}`}
              role="listitem"
            >
              <span className="log-step">#{entry.step}</span>
              <span className="log-dir">
                {DIR_ICONS[entry.direction]} {entry.direction}
              </span>
              <span className="log-coords">
                ({entry.from.x},{entry.from.y})→({entry.to.x},{entry.to.y})
              </span>
              <span className="log-status" title={entry.reason}>
                {entry.success ? '✓' : '✗'}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
