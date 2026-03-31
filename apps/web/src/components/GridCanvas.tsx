'use client';

import { useMemo } from 'react';
import { Simulation } from '@/hooks/useSimulation';

interface GridCanvasProps {
  simulation: Simulation;
}

const MAX_CELL_SIZE = 52;
const MIN_CELL_SIZE = 8;
const MAX_GRID_PX = 560;

function getCellColor(count: number, maxCount: number, isAnt: boolean, isStart: boolean): string {
  if (isAnt) return 'var(--neon-green)';
  if (count === 0) return 'rgba(255,255,255,0.03)';

  const ratio = count / Math.max(maxCount, 1);
  // Heatmap: cool green → warm yellow → hot red
  if (ratio > 0.6) {
    const r = Math.round(255 * ((ratio - 0.6) / 0.4));
    return `rgba(${r}, ${Math.round(120 - ratio * 60)}, 30, ${0.3 + ratio * 0.5})`;
  } else if (ratio > 0.2) {
    return `rgba(0, 210, ${Math.round(120 - ratio * 80)}, ${0.15 + ratio * 0.4})`;
  } else {
    return `rgba(0, 255, 136, ${0.08 + ratio * 0.3})`;
  }
}

function getAntStyle(isAnt: boolean, isStart: boolean): React.CSSProperties {
  if (isAnt) {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(8px, 60%, 22px)',
      filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.8))',
      animation: 'antPulse 0.8s ease infinite',
    };
  }
  return {};
}

export default function GridCanvas({ simulation }: GridCanvasProps) {
  const { grid, position, initialPosition, visitedCells } = simulation;
  const { rows, cols } = grid;

  const maxVisits = useMemo(
    () => Math.max(...Object.values(visitedCells), 1),
    [visitedCells]
  );

  const cellSize = useMemo(() => {
    const byWidth = Math.floor((MAX_GRID_PX - 24) / cols) - 2;
    const byHeight = Math.floor((MAX_GRID_PX - 24) / rows) - 2;
    return Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, byWidth, byHeight));
  }, [rows, cols]);

  return (
    <div className="grid-wrapper">
      <style>{`
        @keyframes antPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(0,255,136,0.8)); }
          50%       { transform: scale(0.85); filter: drop-shadow(0 0 10px rgba(0,255,136,1)); }
        }
        @keyframes cellAppear {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        className="grid-container"
        role="grid"
        aria-label={`Cuadrícula ${rows}×${cols}`}
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const key = `${col},${row}`;
            const count = visitedCells[key] || 0;
            const isAnt = position.x === col && position.y === row;
            const isStart = initialPosition.x === col && initialPosition.y === row;
            const color = getCellColor(count, maxVisits, isAnt, isStart);

            return (
              <div
                key={key}
                className={`grid-cell${count > 0 ? ' visited' : ''}${isAnt ? ' ant' : ''}${isStart ? ' start' : ''}`}
                role="gridcell"
                aria-label={`Celda (${col}, ${row})${isAnt ? ' — hormiga aquí' : ''}${isStart ? ' — posición inicial' : ''}`}
                title={`(${col}, ${row}) · visitas: ${count}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: color,
                  boxShadow: isAnt
                    ? '0 0 12px rgba(0,255,136,0.6), inset 0 0 0 1px rgba(0,255,136,0.5)'
                    : isStart && !isAnt
                    ? 'inset 0 0 0 2px rgba(0,191,255,0.4)'
                    : count > 0
                    ? `0 0 ${Math.min(count * 2, 8)}px rgba(0,255,136,0.1)`
                    : 'none',
                  ...getAntStyle(isAnt, isStart),
                }}
              >
                {isAnt && '🐜'}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
