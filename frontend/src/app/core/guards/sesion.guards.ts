import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Pantallas de la aplicación: solo con sesión. La primera vez en cada visita se pasa por la
 * pantalla de carga, que valida el token con la API y después vuelve a la dirección pedida.
 */
export const sesionGuard: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.haySesion()) return router.createUrlTree(['/login']);
  if (!auth.sesionConfirmada()) {
    return router.createUrlTree(['/cargando'], { queryParams: { destino: estado.url } });
  }
  return true;
};

/**
 * Dashboard: además de la sesión, perfil de administrador; si no, a publicaciones. Es para la
 * navegación: la API igual responde 403 a cualquier pedido de administración de un usuario común.
 */
export const adminGuard: CanActivateFn = (ruta, estado) => {
  const sesion = sesionGuard(ruta, estado);
  if (sesion !== true) return sesion;
  return inject(AuthService).usuario()?.perfil === 'administrador'
    ? true
    : inject(Router).createUrlTree(['/publicaciones']);
};

/** Ingresar y crear cuenta: con la sesión iniciada se va directo a publicaciones. */
export const invitadoGuard: CanActivateFn = () =>
  inject(AuthService).haySesion() ? inject(Router).createUrlTree(['/publicaciones']) : true;
