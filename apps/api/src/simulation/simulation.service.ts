import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { Simulation, Direction, Position, StepLog } from './entities/simulation.entity';

const DIRECTIONS: Direction[] = ['NORTE', 'SUR', 'ESTE', 'OESTE'];

const DIRECTION_DELTAS: Record<Direction, Position> = {
  NORTE: { x: 0, y: -1 },
  SUR: { x: 0, y: 1 },
  ESTE: { x: 1, y: 0 },
  OESTE: { x: -1, y: 0 },
};

@Injectable()
export class SimulationService {
  private simulations = new Map<string, Simulation>();

  /** CU-01: Crear y configurar escenario */
  create(dto: CreateSimulationDto): Simulation {
    const { rows, cols, startX, startY, maxSteps } = dto;

    if (startX < 0 || startX >= cols) {
      throw new BadRequestException(
        `startX debe estar entre 0 y ${cols - 1}`,
      );
    }
    if (startY < 0 || startY >= rows) {
      throw new BadRequestException(
        `startY debe estar entre 0 y ${rows - 1}`,
      );
    }

    const initialPosition: Position = { x: startX, y: startY };

    const simulation: Simulation = {
      id: uuidv4(),
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

    this.simulations.set(simulation.id, simulation);
    return simulation;
  }

  /** CU-02: Ejecutar N pasos aleatorios */
  step(id: string, count: number = 1): Simulation {
    const sim = this.getOrThrow(id);

    if (sim.status === 'completed') {
      return sim;
    }

    const steps = Math.min(count, sim.maxSteps - sim.stepsExecuted);

    for (let i = 0; i < steps; i++) {
      this.executeOneStep(sim);
      if (sim.status === 'completed') break;
    }

    this.simulations.set(id, sim);
    return sim;
  }

  private executeOneStep(sim: Simulation): void {
    if (sim.stepsExecuted >= sim.maxSteps) {
      sim.status = 'completed';
      return;
    }

    const direction = DIRECTIONS[Math.floor(Math.random() * 4)];
    const delta = DIRECTION_DELTAS[direction];
    const from: Position = { ...sim.position };
    const newX = from.x + delta.x;
    const newY = from.y + delta.y;
    const stepNumber = sim.stepsExecuted + 1;

    // Comprobar límites (CU-02 extensión: borde)
    const outOfBounds =
      newX < 0 || newX >= sim.grid.cols || newY < 0 || newY >= sim.grid.rows;

    const log: StepLog = {
      step: stepNumber,
      direction,
      from,
      to: outOfBounds ? { ...from } : { x: newX, y: newY },
      success: !outOfBounds,
      reason: outOfBounds ? 'Límite de cuadrícula alcanzado' : undefined,
    };

    sim.log.push(log);
    sim.stepsExecuted++;

    if (!outOfBounds) {
      sim.position = { x: newX, y: newY };
      const key = `${newX},${newY}`;
      sim.visitedCells[key] = (sim.visitedCells[key] || 0) + 1;
    } else {
      sim.failedAttempts++;
    }

    if (sim.stepsExecuted >= sim.maxSteps) {
      sim.status = 'completed';
    }
  }

  /** CU-03: Obtener estado actual */
  findOne(id: string): Simulation {
    return this.getOrThrow(id);
  }

  /** CU-04: Resumen final */
  getSummary(id: string) {
    const sim = this.getOrThrow(id);
    const visitedCount = Object.keys(sim.visitedCells).length;
    const totalCells = sim.grid.rows * sim.grid.cols;
    const coverage = ((visitedCount / totalCells) * 100).toFixed(1);
    const mostVisited = Object.entries(sim.visitedCells)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cell, count]) => {
        const [x, y] = cell.split(',').map(Number);
        return { x, y, count };
      });

    return {
      id: sim.id,
      status: sim.status,
      grid: sim.grid,
      initialPosition: sim.initialPosition,
      finalPosition: sim.position,
      maxSteps: sim.maxSteps,
      stepsExecuted: sim.stepsExecuted,
      failedAttempts: sim.failedAttempts,
      successfulSteps: sim.stepsExecuted - sim.failedAttempts,
      visitedCells: visitedCount,
      totalCells,
      coveragePercent: parseFloat(coverage),
      mostVisitedCells: mostVisited,
      log: sim.log,
    };
  }

  /** Resetear simulación */
  reset(id: string): Simulation {
    const sim = this.getOrThrow(id);
    const fresh = this.create({
      rows: sim.grid.rows,
      cols: sim.grid.cols,
      startX: sim.initialPosition.x,
      startY: sim.initialPosition.y,
      maxSteps: sim.maxSteps,
    });
    // Remove old simulation
    this.simulations.delete(id);
    return fresh;
  }

  findAll(): Simulation[] {
    return Array.from(this.simulations.values());
  }

  private getOrThrow(id: string): Simulation {
    const sim = this.simulations.get(id);
    if (!sim) throw new NotFoundException(`Simulación ${id} no encontrada`);
    return sim;
  }
}
