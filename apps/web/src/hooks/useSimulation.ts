'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface Position { x: number; y: number; }
export type Direction = 'NORTE' | 'SUR' | 'ESTE' | 'OESTE';

export interface StepLog {
  step: number;
  direction: Direction;
  from: Position;
  to: Position;
  success: boolean;
  reason?: string;
}

export interface Simulation {
  id: string;
  grid: { rows: number; cols: number };
  position: Position;
  initialPosition: Position;
  maxSteps: number;
  stepsExecuted: number;
  failedAttempts: number;
  visitedCells: Record<string, number>;
  log: StepLog[];
  status: 'running' | 'completed';
  createdAt: string;
}

export interface SimulationConfig {
  rows: number;
  cols: number;
  startX: number;
  startY: number;
  maxSteps: number;
}

type SimStatus = 'idle' | 'running' | 'paused' | 'completed';

const STORAGE_KEY = 'hormiga_borracha_state';
const API_BASE = '/api/simulation';

const DIRECTION_ARROWS: Record<Direction, string> = {
  NORTE: '↑', SUR: '↓', ESTE: '→', OESTE: '←',
};

// ─────────────────────────────────────────────────────────────
//  localStorage helpers
// ─────────────────────────────────────────────────────────────
function loadFromStorage(): { sim: Simulation | null; speed: number } {
  if (typeof window === 'undefined') return { sim: null, speed: 300 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sim: null, speed: 300 };
    return JSON.parse(raw);
  } catch {
    return { sim: null, speed: 300 };
  }
}

function saveToStorage(sim: Simulation | null, speed: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sim, speed }));
  } catch { /* quota exceeded */ }
}

// ─────────────────────────────────────────────────────────────
//  Pure client-side simulation engine (no API needed)
// ─────────────────────────────────────────────────────────────
const DIRECTIONS: Direction[] = ['NORTE', 'SUR', 'ESTE', 'OESTE'];
const DELTAS: Record<Direction, Position> = {
  NORTE: { x: 0, y: -1 }, SUR: { x: 0, y: 1 },
  ESTE: { x: 1, y: 0 }, OESTE: { x: -1, y: 0 },
};

function createSimulation(cfg: SimulationConfig): Simulation {
  const { rows, cols, startX, startY, maxSteps } = cfg;
  const initialPosition: Position = { x: startX, y: startY };
  return {
    id: `sim_${Date.now()}`,
    grid: { rows, cols },
    position: { ...initialPosition },
    initialPosition,
    maxSteps,
    stepsExecuted: 0,
    failedAttempts: 0,
    visitedCells: { [`${startX},${startY}`]: 1 },
    log: [],
    status: 'running',
    createdAt: new Date().toISOString(),
  };
}

function executeStep(sim: Simulation): Simulation {
  if (sim.stepsExecuted >= sim.maxSteps) {
    return { ...sim, status: 'completed' };
  }

  const direction = DIRECTIONS[Math.floor(Math.random() * 4)];
  const delta = DELTAS[direction];
  const from: Position = { ...sim.position };
  const newX = from.x + delta.x;
  const newY = from.y + delta.y;
  const stepNumber = sim.stepsExecuted + 1;

  const outOfBounds =
    newX < 0 || newX >= sim.grid.cols || newY < 0 || newY >= sim.grid.rows;

  const log: StepLog = {
    step: stepNumber,
    direction,
    from,
    to: outOfBounds ? { ...from } : { x: newX, y: newY },
    success: !outOfBounds,
    reason: outOfBounds ? 'Límite alcanzado' : undefined,
  };

  const newVisited = { ...sim.visitedCells };
  let newPosition = { ...from };

  if (!outOfBounds) {
    newPosition = { x: newX, y: newY };
    const key = `${newX},${newY}`;
    newVisited[key] = (newVisited[key] || 0) + 1;
  }

  const newStepsExecuted = stepNumber;
  const newStatus: 'running' | 'completed' =
    newStepsExecuted >= sim.maxSteps ? 'completed' : 'running';

  return {
    ...sim,
    position: newPosition,
    stepsExecuted: newStepsExecuted,
    failedAttempts: sim.failedAttempts + (outOfBounds ? 1 : 0),
    visitedCells: newVisited,
    log: [...sim.log, log],
    status: newStatus,
  };
}

// ─────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────
export function useSimulation() {
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [status, setStatus] = useState<SimStatus>('idle');
  const [speed, setSpeedState] = useState<number>(300); // ms per step
  const [lastDir, setLastDir] = useState<Direction | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simRef = useRef<Simulation | null>(null);

  // Sync ref
  useEffect(() => { simRef.current = simulation; }, [simulation]);

  // Load from localStorage on mount
  useEffect(() => {
    const { sim, speed: savedSpeed } = loadFromStorage();
    if (sim) {
      setSimulation(sim);
      setStatus(sim.status === 'completed' ? 'completed' : 'paused');
    }
    setSpeedState(savedSpeed);
    setHydrated(true);
  }, []);

  // Save to localStorage whenever sim changes
  useEffect(() => {
    if (hydrated) {
      saveToStorage(simulation, speed);
    }
  }, [simulation, speed, hydrated]);

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── Step engine ──────────────────────────────────────────
  const tick = useCallback(() => {
    setSimulation((prev) => {
      if (!prev || prev.status === 'completed') {
        clearInterval_();
        setStatus('completed');
        setShowSummary(true);
        return prev;
      }
      const next = executeStep(prev);
      const lastLog = next.log[next.log.length - 1];
      if (lastLog) setLastDir(lastLog.direction);
      if (next.status === 'completed') {
        clearInterval_();
        setStatus('completed');
        setTimeout(() => setShowSummary(true), 600);
      }
      return next;
    });
  }, [clearInterval_]);

  // ── Public actions ───────────────────────────────────────
  const configure = useCallback((cfg: SimulationConfig) => {
    clearInterval_();
    const sim = createSimulation(cfg);
    setSimulation(sim);
    setStatus('paused');
    setLastDir(null);
    setShowSummary(false);
  }, [clearInterval_]);

  const start = useCallback(() => {
    if (!simRef.current || simRef.current.status === 'completed') return;
    clearInterval_();
    setStatus('running');
    intervalRef.current = setInterval(tick, speed);
  }, [tick, speed, clearInterval_]);

  const pause = useCallback(() => {
    clearInterval_();
    setStatus('paused');
  }, [clearInterval_]);

  const reset = useCallback(() => {
    clearInterval_();
    if (!simRef.current) return;
    const init = simRef.current.initialPosition;
    const cfg: SimulationConfig = {
      rows: simRef.current.grid.rows,
      cols: simRef.current.grid.cols,
      startX: init.x,
      startY: init.y,
      maxSteps: simRef.current.maxSteps,
    };
    configure(cfg);
  }, [configure]);

  const setSpeed = useCallback((ms: number) => {
    setSpeedState(ms);
    if (intervalRef.current) {
      clearInterval_();
      intervalRef.current = setInterval(tick, ms);
    }
  }, [tick, clearInterval_]);

  const closeSummary = useCallback(() => setShowSummary(false), []);

  // Cleanup on unmount
  useEffect(() => () => clearInterval_(), [clearInterval_]);

  const progressPercent = simulation
    ? Math.round((simulation.stepsExecuted / simulation.maxSteps) * 100)
    : 0;

  return {
    simulation,
    status,
    speed,
    lastDir,
    showSummary,
    hydrated,
    progressPercent,
    directionArrow: lastDir ? DIRECTION_ARROWS[lastDir] : null,
    configure,
    start,
    pause,
    reset,
    setSpeed,
    closeSummary,
  };
}
