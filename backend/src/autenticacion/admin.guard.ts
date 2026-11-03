import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { PedidoConUsuario } from './sesion.guard';

/**
 * Solo deja pasar a los administradores. Va después de SesionGuard, que ya cargó al usuario
 * (con el perfil leído de la base, no del token): @UseGuards(SesionGuard, AdminGuard).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(contexto: ExecutionContext): boolean {
    const usuario = contexto
      .switchToHttp()
      .getRequest<PedidoConUsuario>().usuario;
    if (usuario?.perfil !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede hacer esto.');
    }
    return true;
  }
}
