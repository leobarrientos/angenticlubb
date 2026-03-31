import { IsInt, IsPositive, Max } from 'class-validator';

export class StepDto {
  @IsInt()
  @IsPositive()
  @Max(100)
  count: number = 1;
}
