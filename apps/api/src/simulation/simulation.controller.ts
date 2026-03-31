import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { CreateSimulationDto } from './dto/create-simulation.dto';

@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  /** CU-01: Configurar escenario */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSimulationDto: CreateSimulationDto) {
    return this.simulationService.create(createSimulationDto);
  }

  /** CU-02: Ejecutar N pasos aleatorios */
  @Post(':id/step')
  step(
    @Param('id') id: string,
    @Query('count') count: string = '1',
  ) {
    return this.simulationService.step(id, parseInt(count, 10) || 1);
  }

  /** CU-03: Obtener estado actual (mapa + posición) */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.simulationService.findOne(id);
  }

  /** CU-04: Resumen final */
  @Get(':id/summary')
  getSummary(@Param('id') id: string) {
    return this.simulationService.getSummary(id);
  }

  /** Listar todas las simulaciones */
  @Get()
  findAll() {
    return this.simulationService.findAll();
  }

  /** Eliminar / resetear */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.simulationService.reset(id);
  }
}
