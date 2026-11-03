import { Component, computed, input } from '@angular/core';
import { datosClub, escudoDe } from '../../core/models/clubes';

/**
 * Escudo chiquito del club y, si se pide, su nombre. Un club guardado antes de la lista de los 30
 * (texto libre) se muestra como texto, sin escudo.
 */
@Component({
  selector: 'app-escudo-club',
  template: `
    @if (datos(); as c) {
      <span class="club" [title]="c.nombre">
        <img
          [src]="escudo(c)"
          [alt]="conNombre() ? '' : 'Escudo de ' + c.nombre"
          [width]="tamano()"
          [height]="tamano()"
        />
        @if (conNombre()) {
          <span>{{ c.nombre }}</span>
        }
      </span>
    } @else if (conNombre()) {
      <span>{{ club() || 'Sin club' }}</span>
    }
  `,
  styles: `
    .club {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      vertical-align: middle;
    }
    img {
      flex: none;
      object-fit: contain;
    }
  `,
})
export class EscudoClub {
  /** Identificador del club que guarda la API. */
  readonly club = input<string | null | undefined>(null);
  readonly conNombre = input(false);
  readonly tamano = input(18);

  protected readonly datos = computed(() => datosClub(this.club()));
  protected readonly escudo = escudoDe;
}
