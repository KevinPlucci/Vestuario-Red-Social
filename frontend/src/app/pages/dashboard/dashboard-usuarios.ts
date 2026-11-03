import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Usuario } from '../../core/models/usuario';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { ListadoUsuarios, UsuariosService } from '../../core/services/usuarios.service';
import { campoDelError, mensajesDeError } from '../../core/utils/errores';
import { EscudoClub } from '../../shared/components/escudo-club';
import { FormularioCuenta } from '../../shared/components/formulario-cuenta';
import { Paginacion } from '../../shared/components/paginacion';
import { ImagenRespaldoDirective } from '../../shared/directives/imagen-respaldo.directive';
import { NombrePosicionPipe } from '../../shared/pipes/nombre-posicion.pipe';

const POR_PAGINA = 10;

/** Dashboard de usuarios (solo administradores): listado, alta con perfil y baja o alta lógica. */
@Component({
  selector: 'app-dashboard-usuarios',
  imports: [FormularioCuenta, Paginacion, EscudoClub, ImagenRespaldoDirective, NombrePosicionPipe],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.css',
})
export class DashboardUsuarios {
  private readonly servicio = inject(UsuariosService);
  private readonly modal = inject(ModalService);
  protected readonly auth = inject(AuthService);
  private readonly formulario = viewChild(FormularioCuenta);
  private readonly recargar$ = new BehaviorSubject<void>(undefined);

  protected readonly pagina = signal(1);
  protected readonly buscar = signal('');
  protected readonly listado = signal<ListadoUsuarios | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string[] | null>(null);
  protected readonly mostrarAlta = signal(false);
  protected readonly creando = signal(false);
  /** Id de la cuenta que se está habilitando o deshabilitando. */
  protected readonly ocupado = signal<string | null>(null);
  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil((this.listado()?.total ?? 0) / POR_PAGINA)),
  );

  constructor() {
    // La búsqueda espera a que se deje de escribir para no pedir el listado en cada tecla.
    const buscar$ = toObservable(this.buscar).pipe(debounceTime(300), distinctUntilChanged());
    combineLatest([buscar$, toObservable(this.pagina), this.recargar$])
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap(([buscar, pagina]) =>
          this.servicio
            .listar({ buscar, offset: (pagina - 1) * POR_PAGINA, limit: POR_PAGINA })
            .pipe(
              catchError((error: unknown) => {
                this.error.set(mensajesDeError(error));
                return of(null);
              }),
            ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((listado) => {
        this.cargando.set(false);
        if (listado) this.listado.set(listado);
      });
  }

  protected recargar(): void {
    this.recargar$.next();
  }

  protected buscarCuenta(evento: Event): void {
    this.buscar.set((evento.target as HTMLInputElement).value.trim());
    this.pagina.set(1);
  }

  protected crear(datos: FormData): void {
    this.creando.set(true);
    this.servicio
      .crear(datos)
      .pipe(finalize(() => this.creando.set(false)))
      .subscribe({
        next: async (usuario) => {
          this.formulario()?.reiniciar();
          this.mostrarAlta.set(false);
          this.pagina.set(1);
          this.recargar();
          await this.modal.abrir({
            tipo: 'exito',
            titulo: 'Cuenta creada',
            mensaje: `@${usuario.nombreUsuario} ya puede ingresar como ${
              usuario.perfil === 'administrador' ? 'administrador' : 'usuario'
            }.`,
          });
        },
        error: (error: unknown) => {
          const mensajes = mensajesDeError(error);
          this.formulario()?.marcarError(campoDelError(error), mensajes[0]);
          void this.modal.abrir({
            tipo: 'error',
            titulo: 'No se pudo crear la cuenta',
            mensaje: mensajes,
          });
        },
      });
  }

  /** Baja o alta lógica, con confirmación. La fila se actualiza con la respuesta de la API. */
  protected async cambiarEstado(usuario: Usuario): Promise<void> {
    const deshabilitar = usuario.activo !== false;
    const confirmado = await this.modal.confirmar({
      titulo: deshabilitar ? 'Deshabilitar cuenta' : 'Habilitar cuenta',
      mensaje: deshabilitar
        ? `@${usuario.nombreUsuario} no va a poder ingresar ni usar la aplicación hasta que la vuelvas a habilitar. Si tiene la sesión abierta, se le cierra en su próximo pedido.`
        : `@${usuario.nombreUsuario} va a poder volver a ingresar.`,
      textoAceptar: deshabilitar ? 'Deshabilitar' : 'Habilitar',
    });
    if (!confirmado) return;

    const pedido = deshabilitar
      ? this.servicio.deshabilitar(usuario.id)
      : this.servicio.habilitar(usuario.id);
    this.ocupado.set(usuario.id);
    pedido.pipe(finalize(() => this.ocupado.set(null))).subscribe({
      next: (actualizado) =>
        this.listado.update(
          (listado) =>
            listado && {
              ...listado,
              usuarios: listado.usuarios.map((u) => (u.id === actualizado.id ? actualizado : u)),
            },
        ),
      error: (error: unknown) =>
        void this.modal.abrir({
          tipo: 'error',
          titulo: 'No se pudo cambiar el estado de la cuenta',
          mensaje: mensajesDeError(error),
        }),
    });
  }
}
