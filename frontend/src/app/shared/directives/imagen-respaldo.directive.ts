import { computed, Directive, input, linkedSignal } from '@angular/core';

/** Silueta genérica: la imagen que se muestra si una foto de perfil no carga. */
export const AVATAR_POR_DEFECTO = '/fondos/avatar.svg';

/**
 * En un <img>: si no hay imagen (una cuenta sin foto de perfil) o no carga (el servidor está dormido,
 * la imagen se borró, etc.), muestra la indicada en appImagenRespaldo o, si no se indica, la silueta
 * genérica. Recibe el [src] del <img> y es la que lo pone en el elemento.
 */
@Directive({
  selector: 'img[appImagenRespaldo]',
  host: { '[src]': 'origen()', '(error)': 'usarRespaldo()' },
})
export class ImagenRespaldoDirective {
  readonly src = input<string | null | undefined>();
  readonly appImagenRespaldo = input('');
  /** Si la imagen falló; vuelve a false cuando cambia el src. */
  private readonly fallo = linkedSignal({ source: this.src, computation: () => false });

  protected readonly origen = computed(() => {
    const respaldo = this.appImagenRespaldo() || AVATAR_POR_DEFECTO;
    return this.fallo() || !this.src() ? respaldo : this.src();
  });

  // Si el respaldo tampoco carga, origen ya es el respaldo y no cambia: no hay bucle de errores.
  protected usarRespaldo(): void {
    this.fallo.set(true);
  }
}
