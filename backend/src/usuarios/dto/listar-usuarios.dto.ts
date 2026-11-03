import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginacionDto } from '../../comun/paginacion.dto';
import { textoOpcional } from '../../comun/transformaciones';

/** GET /usuarios?buscar=&offset=&limit= */
export class ListarUsuariosDto extends PaginacionDto {
  /** Texto a buscar en el nombre, el apellido, el nombre de usuario o el correo. */
  @MaxLength(50, { message: 'buscar no puede superar los 50 caracteres.' })
  @IsString({ message: 'buscar tiene que ser un texto.' })
  @IsOptional()
  @Transform(textoOpcional)
  buscar?: string;
}
