import { effect, inject, Injectable } from '@angular/core';
import { textoDuracion } from '../utils/duracion';
import { mensajesDeError } from '../utils/errores';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';

/** El aviso aparece cuando queda un tercio de la sesión: con tokens de 15 minutos, a los 10 (quedan 5). */
const avisoAntesDe = (duracion: number) => duracion / 3;

/**
 * Vigila el vencimiento del token: avisa cuando queda un tercio de la sesión y ofrece extenderla
 * (refrescar el token). Si no se extiende, al vencer cierra la sesión y vuelve al login.
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
      const fin = setTimeout(() => void this.auth.expulsar(), faltan);
      onCleanup(() => {
        clearTimeout(aviso);
        clearTimeout(fin);
      });
    });
  }

  private async avisar(vence: number, duracion: number): Promise<void> {
    const extender = await this.modal.confirmar({
      titulo: 'Tu sesión está por vencer',
      mensaje: `Quedan ${textoDuracion(vence - Date.now())} de sesión. ¿Querés extenderla ${textoDuracion(duracion)} más?`,
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
          mensaje: `Tenés ${textoDuracion(duracion)} más.`,
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
