import { effect, inject, Injectable } from '@angular/core';
import { textoDuracion } from '../utils/duracion';
import { mensajesDeError } from '../utils/errores';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';

/** El aviso aparece cuando queda un tercio de la sesión: con un token de 10 segundos, cuando quedan unos 3. */
const avisoAntesDe = (duracion: number) => duracion / 3;

/**
 * Vigila el vencimiento del token: avisa cuando queda un tercio de la sesión y ofrece extenderla
 * (refrescar el token). Si no se extiende, al vencer se consulta a la API con el token ya vencido:
 * responde 401 y sesionInterceptor cierra la sesión y vuelve al login.
 */
@Injectable({ providedIn: 'root' })
export class VencimientoSesion {
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);

  constructor() {
    // Cada token nuevo (login, registro o refresco) reprograma los dos temporizadores.
    effect((onCleanup) => {
      const vence = this.auth.vencimiento();
      const duracion = this.auth.duracion();
      if (!vence || !duracion) return;
      const faltan = vence - Date.now();
      const aviso = setTimeout(
        () => void this.avisar(vence, duracion),
        faltan - avisoAntesDe(duracion),
      );
      let fin = setTimeout(() => comprobar(), faltan);
      // Si el reloj de este equipo va adelantado y la API todavía acepta el token, se reintenta.
      const comprobar = () =>
        this.auth.autorizar().subscribe({
          next: () => (fin = setTimeout(() => comprobar(), 1000)),
          error: () => undefined,
        });
      onCleanup(() => {
        clearTimeout(aviso);
        clearTimeout(fin);
      });
    });
  }

  private async avisar(vence: number, duracion: number): Promise<void> {
    const extender = await this.modal.confirmar({
      titulo: 'Tu sesión está por vencer',
      mensaje: `Quedan ${textoDuracion(vence - Date.now())} de sesión. ¿Querés extenderla?`,
      textoAceptar: 'Extender sesión',
      textoCancelar: 'Ahora no',
    });
    // Si mientras tanto se cerró la sesión o ya cambió el token, no hay nada que extender.
    if (!extender || this.auth.vencimiento() !== vence) return;

    this.auth.refrescar().subscribe({
      next: () =>
        void this.modal.abrir({
          tipo: 'exito',
          titulo: 'Sesión extendida',
          mensaje: `Tenés ${textoDuracion(this.auth.duracion() ?? duracion)} más.`,
        }),
      error: (error: unknown) =>
        void this.modal.abrir({
          tipo: 'error',
          titulo: 'No se pudo extender la sesión',
          mensaje: mensajesDeError(error),
        }),
    });
  }
}
