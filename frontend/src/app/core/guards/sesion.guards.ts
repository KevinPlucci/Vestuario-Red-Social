import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isObservable, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Pantallas de la aplicación: solo con sesión. La primera vez en cada visita se pasa por la
 * pantalla de carga, que valida el token con la API y después vuelve a la dirección pedida.
 * Si el token ya venció, antes de cambiar de pantalla se consulta a la API con ese token: responde
 * 401 (se ve en la pestaña Red y en la consola) y sesionInterceptor lleva al login con el aviso.
 */
export const sesionGuard: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.haySesion()) return router.createUrlTree(['/login']);
  if (auth.tokenVencido()) {
    // Si la API todavía lo acepta (el reloj de este equipo va adelantado), se deja pasar.
    return auth.autorizar().pipe(map(() => true));
  }
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
  const auth = inject(AuthService);
  const router = inject(Router);
  const esAdmin = () =>
    auth.usuario()?.perfil === 'administrador' ? true : router.createUrlTree(['/publicaciones']);
  const sesion = sesionGuard(ruta, estado);
  if (isObservable(sesion)) return sesion.pipe(map(esAdmin));
  if (sesion !== true) return sesion;
  return esAdmin();
};

/** Ingresar y crear cuenta: con la sesión iniciada se va directo a publicaciones. */
export const invitadoGuard: CanActivateFn = () =>
  inject(AuthService).haySesion() ? inject(Router).createUrlTree(['/publicaciones']) : true;
