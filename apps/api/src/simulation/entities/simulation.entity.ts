export interface Position {
  x: number;
  y: number;
}

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
  visitedCells: Record<string, number>; // "x,y" -> count
  log: StepLog[];
  status: 'running' | 'completed';
  createdAt: string;
}
