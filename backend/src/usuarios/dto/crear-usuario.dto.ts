import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty } from 'class-validator';
import { RegistroDto } from '../../autenticacion/dto/registro.dto';
import { recortarYMinusculas } from '../../comun/transformaciones';
import { PERFILES, type Perfil } from '../schemas/usuario.schema';

/** Alta de una cuenta desde el dashboard: los mismos datos del registro más el perfil elegido. */
export class CrearUsuarioDto extends RegistroDto {
  @IsIn(PERFILES, {
    message: 'El perfil tiene que ser "usuario" o "administrador".',
  })
  @IsNotEmpty({ message: 'Elegí el perfil de la cuenta.' })
  @Transform(recortarYMinusculas)
  perfil: Perfil;
}
