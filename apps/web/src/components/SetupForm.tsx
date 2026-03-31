'use client';

import { useState } from 'react';
import { SimulationConfig } from '@/hooks/useSimulation';

interface SetupFormProps {
  onConfigure: (cfg: SimulationConfig) => void;
  disabled?: boolean;
}

const DEFAULT: SimulationConfig = {
  rows: 12,
  cols: 12,
  startX: 5,
  startY: 5,
  maxSteps: 200,
};

export default function SetupForm({ onConfigure, disabled }: SetupFormProps) {
  const [cfg, setCfg] = useState<SimulationConfig>(DEFAULT);
  const [errors, setErrors] = useState<Partial<Record<keyof SimulationConfig, string>>>({});

  const set = (key: keyof SimulationConfig, value: string) => {
    const num = parseInt(value, 10) || 0;
    setCfg((prev) => ({ ...prev, [key]: num }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof SimulationConfig, string>> = {};
    if (cfg.rows < 2 || cfg.rows > 50) e.rows = '2 – 50';
    if (cfg.cols < 2 || cfg.cols > 50) e.cols = '2 – 50';
    if (cfg.startX < 0 || cfg.startX >= cfg.cols) e.startX = `0 – ${cfg.cols - 1}`;
    if (cfg.startY < 0 || cfg.startY >= cfg.rows) e.startY = `0 – ${cfg.rows - 1}`;
    if (cfg.maxSteps < 1 || cfg.maxSteps > 10000) e.maxSteps = '1 – 10000';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onConfigure(cfg);
  };

  return (
    <form onSubmit={handleSubmit} className="setup-panel card">
      <div className="card-header">
        <span className="card-icon">⚙️</span>
        <span className="card-title">CU-01 · Configurar Escenario</span>
      </div>

      <div className="card-body">
        {/* Grid size */}
        <div className="form-group">
          <label className="form-label">🗺️ Tamaño de Cuadrícula</label>
          <div className="form-row">
            <div>
              <input
                id="input-rows"
                type="number"
                className="form-input"
                value={cfg.rows}
                onChange={(e) => set('rows', e.target.value)}
                min={2}
                max={50}
                placeholder="Filas (N)"
                disabled={disabled}
              />
              {errors.rows && <div className="form-hint" style={{ color: 'var(--neon-red)', marginTop: 4 }}>Rango: {errors.rows}</div>}
              <div className="form-hint" style={{ marginTop: 4 }}>Filas (N)</div>
            </div>
            <div>
              <input
                id="input-cols"
                type="number"
                className="form-input"
                value={cfg.cols}
                onChange={(e) => set('cols', e.target.value)}
                min={2}
                max={50}
                placeholder="Columnas (M)"
                disabled={disabled}
              />
              {errors.cols && <div className="form-hint" style={{ color: 'var(--neon-red)', marginTop: 4 }}>Rango: {errors.cols}</div>}
              <div className="form-hint" style={{ marginTop: 4 }}>Columnas (M)</div>
            </div>
          </div>
          <div className="form-hint">Cuadrícula {cfg.rows} × {cfg.cols} = {cfg.rows * cfg.cols} celdas</div>
        </div>

        <div className="separator" />

        {/* Start position */}
        <div className="form-group">
          <label className="form-label">📍 Posición Inicial (x, y)</label>
          <div className="form-row">
            <div>
              <input
                id="input-startx"
                type="number"
                className="form-input"
                value={cfg.startX}
                onChange={(e) => set('startX', e.target.value)}
                min={0}
                max={cfg.cols - 1}
                disabled={disabled}
              />
              {errors.startX && <div className="form-hint" style={{ color: 'var(--neon-red)', marginTop: 4 }}>0 – {cfg.cols - 1}</div>}
              <div className="form-hint" style={{ marginTop: 4 }}>X (columna)</div>
            </div>
            <div>
              <input
                id="input-starty"
                type="number"
                className="form-input"
                value={cfg.startY}
                onChange={(e) => set('startY', e.target.value)}
                min={0}
                max={cfg.rows - 1}
                disabled={disabled}
              />
              {errors.startY && <div className="form-hint" style={{ color: 'var(--neon-red)', marginTop: 4 }}>0 – {cfg.rows - 1}</div>}
              <div className="form-hint" style={{ marginTop: 4 }}>Y (fila)</div>
            </div>
          </div>
        </div>

        <div className="separator" />

        {/* Max steps */}
        <div className="form-group">
          <label className="form-label">🔢 Máximo de Pasos</label>
          <input
            id="input-maxsteps"
            type="number"
            className="form-input"
            value={cfg.maxSteps}
            onChange={(e) => set('maxSteps', e.target.value)}
            min={1}
            max={10000}
            disabled={disabled}
          />
          {errors.maxSteps && <div className="form-hint" style={{ color: 'var(--neon-red)' }}>Rango: {errors.maxSteps}</div>}
          <div className="form-hint">1 – 10,000 pasos</div>
        </div>

        {/* Quick presets */}
        <div className="form-group">
          <label className="form-label">⚡ Presets</label>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: 12 }}
              onClick={() => setCfg({ rows: 8, cols: 8, startX: 4, startY: 4, maxSteps: 100 })}
              disabled={disabled}
            >
              Pequeño
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: 12 }}
              onClick={() => setCfg({ rows: 15, cols: 15, startX: 7, startY: 7, maxSteps: 500 })}
              disabled={disabled}
            >
              Mediano
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: 12 }}
              onClick={() => setCfg({ rows: 25, cols: 25, startX: 12, startY: 12, maxSteps: 2000 })}
              disabled={disabled}
            >
              Grande
            </button>
          </div>
        </div>

        <div className="separator" />

        <button
          id="btn-configure"
          type="submit"
          className="btn btn-primary btn-full"
          disabled={disabled}
        >
          ✦ Crear Simulación
        </button>
      </div>
    </form>
  );
}
