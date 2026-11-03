import { Directive, ElementRef, inject, input } from '@angular/core';

/** Silueta genérica: la imagen que se muestra si una foto de perfil no carga. */
export const AVATAR_POR_DEFECTO = '/fondos/avatar.svg';

/**
 * En un <img>: si la imagen no carga (el servidor está dormido, la imagen se borró, etc.), muestra la
 * indicada en appImagenRespaldo o, si no se indica, la silueta genérica.
 */
@Directive({ selector: 'img[appImagenRespaldo]', host: { '(error)': 'usarRespaldo()' } })
export class ImagenRespaldoDirective {
  readonly appImagenRespaldo = input('');
  private readonly imagen: HTMLImageElement = inject(ElementRef).nativeElement;

  protected usarRespaldo(): void {
    const respaldo = this.appImagenRespaldo() || AVATAR_POR_DEFECTO;
    // Si el respaldo tampoco carga, no se vuelve a intentar (evita un bucle de errores).
    if (this.imagen.src.endsWith(respaldo)) return;
    this.imagen.src = respaldo;
  }
}
