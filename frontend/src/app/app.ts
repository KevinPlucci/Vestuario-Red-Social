import { Component, effect, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FondoService } from './core/services/fondo.service';
import { VencimientoSesion } from './core/services/vencimiento-sesion.service';
import { Header } from './shared/components/header';
import { Modal } from './shared/components/modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Header, Modal],
  template: `
    <app-header />
    <main class="contenedor principal">
      <router-outlet />
    </main>
    <footer class="contenedor pie sobre-fondo">
      @if (fondo.club(); as club) {
        <span>
          De fondo: {{ club.estadio }}
          @if (club.foto; as foto) {
            · Foto: {{ foto.autor }} ({{ foto.licencia }})
          }
        </span>
      }
      <a routerLink="/creditos">Créditos de las imágenes</a>
    </footer>
    <app-modal />
  `,
  styles: `
    .pie {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 4px 16px;
      padding-block: 0 24px;
      font-size: 0.8rem;
      color: rgb(255 255 255 / 78%);
    }
    .pie a {
      color: #fff;
    }
  `,
})
export class App {
  protected readonly fondo = inject(FondoService);

  constructor() {
    // Se crea al arrancar para que vigile el vencimiento del token durante toda la visita.
    inject(VencimientoSesion);
    // La cancha de fondo cambia con el club del jugador (o el elegido en el registro).
    effect(() =>
      document.documentElement.style.setProperty('--fondo-imagen', `url("${this.fondo.imagen()}")`),
    );
  }
}
