import { computed, inject, Injectable, signal } from '@angular/core';
import { datosClub, fondoDe } from '../models/clubes';
import { AuthService } from './auth.service';

/**
 * Fondo de la aplicación: la cancha del club del jugador que inició sesión o, sin club, una cancha
 * dibujada. Mientras se elige el club en el registro, se muestra la cancha del elegido.
 */
@Injectable({ providedIn: 'root' })
export class FondoService {
  private readonly auth = inject(AuthService);
  /** undefined: no hay vista previa y manda el club del usuario. */
  private readonly vistaPrevia = signal<string | null | undefined>(undefined);

  readonly club = computed(() => {
    const previa = this.vistaPrevia();
    return datosClub(previa !== undefined ? previa : this.auth.usuario()?.club);
  });
  readonly imagen = computed(() => fondoDe(this.club()));

  /** Muestra la cancha de un club (o la dibujada, con null) sin cambiar el del usuario. */
  mostrar(club: string | null): void {
    this.vistaPrevia.set(club);
  }

  /** Vuelve al fondo del usuario que inició sesión. */
  restablecer(): void {
    this.vistaPrevia.set(undefined);
  }
}
