import { Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { FondoService } from '../../core/services/fondo.service';
import { ModalService } from '../../core/services/modal.service';
import { campoDelError, mensajesDeError } from '../../core/utils/errores';
import { FormularioCuenta } from '../../shared/components/formulario-cuenta';

@Component({
  selector: 'app-registro',
  imports: [RouterLink, FormularioCuenta],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);
  protected readonly fondo = inject(FondoService);
  private readonly formulario = viewChild.required(FormularioCuenta);

  protected readonly enviando = signal(false);

  constructor() {
    // El fondo muestra la cancha del club elegido solo mientras se completa el registro.
    inject(DestroyRef).onDestroy(() => this.fondo.restablecer());
  }

  protected registrar(datos: FormData): void {
    this.enviando.set(true);
    this.auth
      .registrar(datos)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: async (usuario) => {
          await this.modal.abrir({
            tipo: 'exito',
            titulo: `¡Te damos la bienvenida, ${usuario.nombre}!`,
            mensaje: `Tu cuenta @${usuario.nombreUsuario} se creó correctamente.`,
            textoAceptar: 'Ver publicaciones',
          });
          await this.router.navigateByUrl('/publicaciones');
        },
        error: (error: unknown) => {
          const mensajes = mensajesDeError(error);
          // Correo o nombre de usuario repetido: además del modal, se marca el campo.
          this.formulario().marcarError(campoDelError(error), mensajes[0]);
          void this.modal.abrir({
            tipo: 'error',
            titulo: 'No pudimos crear tu cuenta',
            mensaje: mensajes,
          });
        },
      });
  }
}
