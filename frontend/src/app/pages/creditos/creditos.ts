import { Component } from '@angular/core';
import { CLUBES, escudoDe } from '../../core/models/clubes';

/** Autor y licencia de cada foto de estadio y de cada escudo, como piden las licencias Creative Commons. */
@Component({
  selector: 'app-creditos',
  template: `
    <div class="ancho-mediano">
      <div class="cabecera-pagina">
        <h1>Créditos de las imágenes</h1>
        <p class="texto-suave">
          Las fotos de los estadios y los escudos de los clubes salen de Wikimedia Commons y
          Wikipedia. Se usan en este trabajo práctico, sin fines comerciales, con la licencia de
          cada una. Los escudos son marcas de sus clubes.
        </p>
      </div>
      <section class="tarjeta">
        <ul class="clubes">
          @for (club of clubes; track club.id) {
            <li>
              <img [src]="escudo(club)" alt="" width="32" height="32" />
              <div>
                <strong>{{ club.nombre }}</strong>
                <p>
                  <span class="texto-suave">{{ club.estadio }}:</span>
                  @if (club.foto; as foto) {
                    foto de {{ foto.autor }} · {{ foto.licencia }} ·
                    <a [href]="foto.fuente" target="_blank" rel="noopener">original</a>
                  } @else {
                    sin foto con licencia libre; se usa la cancha dibujada.
                  }
                </p>
                <p>
                  <span class="texto-suave">Escudo:</span> {{ club.escudo.autor }} ·
                  {{ club.escudo.licencia }} ·
                  <a [href]="club.escudo.fuente" target="_blank" rel="noopener">original</a>
                </p>
              </div>
            </li>
          }
        </ul>
      </section>
    </div>
  `,
  styles: `
    .clubes {
      display: grid;
      gap: 14px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--color-borde);
    }
    li:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }
    img {
      flex: none;
      object-fit: contain;
    }
    p {
      margin: 2px 0 0;
      font-size: 0.88rem;
      overflow-wrap: anywhere;
    }
  `,
})
export class Creditos {
  protected readonly clubes = CLUBES;
  protected readonly escudo = escudoDe;
}
