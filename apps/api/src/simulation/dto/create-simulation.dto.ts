import { IsInt, IsPositive, Min, Max } from 'class-validator';

export class CreateSimulationDto {
  @IsInt()
  @IsPositive()
  @Max(50)
  rows: number;

  @IsInt()
  @IsPositive()
  @Max(50)
  cols: number;

  @IsInt()
  @Min(0)
  startX: number;

  @IsInt()
  @Min(0)
  startY: number;

  @IsInt()
  @IsPositive()
  @Max(10000)
  maxSteps: number;
}
