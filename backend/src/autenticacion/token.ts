import type { Perfil } from '../usuarios/schemas/usuario.schema';

/** El token del login y del registro vence a los 60 segundos de emitido. */
export const DURACION_TOKEN_SEGUNDOS = 60;

/** Al extender la sesión (refrescar), el token nuevo dura 60 segundos (lo mismo que al ingresar). */
export const DURACION_EXTENSION_SEGUNDOS = 60;

/** Lo que viaja dentro del token: la identidad del usuario y su rol. */
export interface DatosToken {
  sub: string;
  nombreUsuario: string;
  perfil: Perfil;
}
