import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/**
 * Directiva estructural: *appSoloAdmin muestra el bloque solo si quien inició sesión es administrador
 * (y lo saca si deja de serlo). Es para la pantalla: la API igual controla cada permiso.
 */
@Directive({ selector: '[appSoloAdmin]' })
export class SoloAdminDirective {
  private readonly plantilla = inject(TemplateRef<unknown>);
  private readonly contenedor = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);
  private visible = false;

  constructor() {
    effect(() => {
      const mostrar = this.auth.usuario()?.perfil === 'administrador';
      if (mostrar === this.visible) return;
      this.visible = mostrar;
      if (mostrar) this.contenedor.createEmbeddedView(this.plantilla);
      else this.contenedor.clear();
    });
  }
}
