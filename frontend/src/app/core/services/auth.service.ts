import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sesion, Usuario } from '../models/usuario';
import { textoDuracion } from '../utils/duracion';
import { ModalService } from './modal.service';

const CLAVE_SESION = 'vestuario.sesion';
/** Motivo con el que la API acompaña los errores de una cuenta deshabilitada. */
export const CUENTA_DESHABILITADA = 'cuenta-deshabilitada';

function leerSesionGuardada(): Sesion | null {
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE_SESION) ?? 'null') as Sesion | null;
    return guardada?.token && guardada.usuario ? guardada : null;
  } catch {
    return null;
  }
}

/** Emisión y vencimiento del token (en ms), leídos del "iat" y el "exp" de su payload. */
function tiemposDe(token: string): { emitido: number; vence: number } | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { iat, exp } = JSON.parse(atob(payload)) as { iat?: unknown; exp?: unknown };
    return typeof iat === 'number' && typeof exp === 'number'
      ? { emitido: iat * 1000, vence: exp * 1000 }
      : null;
  } catch {
    return null;
  }
}

/** Registro, login, token JWT y datos del usuario que inició sesión. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly modal = inject(ModalService);
  private readonly url = `${environment.apiUrl}/autenticacion`;

  private readonly sesion = signal<Sesion | null>(leerSesionGuardada());
  /** true cuando el servidor ya aceptó el token en esta visita (login, registro o autorizar). */
  private readonly confirmada = signal(false);

  readonly usuario = computed(() => this.sesion()?.usuario ?? null);
  readonly token = computed(() => this.sesion()?.token ?? null);
  readonly haySesion = computed(() => this.sesion() !== null);
  readonly sesionConfirmada = this.confirmada.asReadonly();
  private readonly tiempos = computed(() => {
    const token = this.token();
    return token ? tiemposDe(token) : null;
  });
  /** Momento (en ms) en que vence el token. */
  readonly vencimiento = computed(() => this.tiempos()?.vence ?? null);
  /** Cuánto dura cada token (en ms). Lo decide el servidor: se lee del token, no está escrito acá. */
  readonly duracion = computed(() => {
    const tiempos = this.tiempos();
    return tiempos ? tiempos.vence - tiempos.emitido : null;
  });

  /** Recibe un FormData porque viaja junto con la imagen de perfil (multipart/form-data). */
  registrar(datos: FormData): Observable<Usuario> {
    return this.http
      .post<Sesion>(`${this.url}/registro`, datos)
      .pipe(map((sesion) => this.guardar(sesion)));
  }

  /** "usuario" puede ser el correo o el nombre de usuario. */
  iniciarSesion(usuario: string, contrasena: string): Observable<Usuario> {
    return this.http
      .post<Sesion>(`${this.url}/login`, { usuario, contrasena })
      .pipe(map((sesion) => this.guardar(sesion)));
  }

  /** Valida el token guardado y trae los datos actualizados del usuario. */
  autorizar(): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.url}/autorizar`, null).pipe(
      tap((usuario) => {
        const token = this.token();
        if (token) this.guardar({ token, usuario });
      }),
    );
  }

  /** Cambia el token por uno nuevo, con toda su duración desde ahora. */
  refrescar(): Observable<void> {
    return this.http.post<{ token: string }>(`${this.url}/refrescar`, null).pipe(
      map(({ token }) => {
        const usuario = this.usuario();
        if (usuario) this.guardar({ token, usuario });
      }),
    );
  }

  cerrarSesion(): void {
    localStorage.removeItem(CLAVE_SESION);
    this.sesion.set(null);
    this.confirmada.set(false);
  }

  /**
   * El token venció o la API lo rechazó: se cierra la sesión, se vuelve al login y se avisa por qué
   * (sesión vencida o cuenta deshabilitada por un administrador).
   */
  async expulsar(motivo?: string): Promise<void> {
    if (!this.haySesion()) return;
    const duracion = this.duracion();
    this.cerrarSesion();
    await this.router.navigateByUrl('/login');
    if (motivo === CUENTA_DESHABILITADA) {
      void this.modal.abrir({
        tipo: 'error',
        titulo: 'Tu cuenta fue deshabilitada',
        mensaje:
          'Un administrador deshabilitó tu cuenta. Comunicate con él para volver a ingresar.',
      });
      return;
    }
    void this.modal.abrir({
      titulo: 'Tu sesión venció',
      mensaje: `Por seguridad, la sesión dura ${duracion ? textoDuracion(duracion) : 'un tiempo limitado'}. Ingresá de nuevo para seguir.`,
    });
  }

  private guardar(sesion: Sesion): Usuario {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    this.sesion.set(sesion);
    this.confirmada.set(true);
    return sesion.usuario;
  }
}
