import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

/** ?desde=&hasta= de las estadísticas (fechas ISO). Sin ellas, los últimos 30 días. */
export class RangoFechasDto {
  @IsDate({ message: 'desde tiene que ser una fecha válida.' })
  @Type(() => Date)
  @IsOptional()
  desde?: Date;

  @IsDate({ message: 'hasta tiene que ser una fecha válida.' })
  @Type(() => Date)
  @IsOptional()
  hasta?: Date;
}
