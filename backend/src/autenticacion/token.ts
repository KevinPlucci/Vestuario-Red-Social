import type { Perfil } from '../usuarios/schemas/usuario.schema';

/** El token del login y del registro vence a los 10 segundos de emitido. */
export const DURACION_TOKEN_SEGUNDOS = 10;

/** Al extender la sesión (refrescar), el token nuevo dura 20 segundos. */
export const DURACION_EXTENSION_SEGUNDOS = 20;

/** Lo que viaja dentro del token: la identidad del usuario y su rol. */
export interface DatosToken {
  sub: string;
  nombreUsuario: string;
  perfil: Perfil;
}
