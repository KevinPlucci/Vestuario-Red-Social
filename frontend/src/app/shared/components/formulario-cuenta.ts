import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CLUBES } from '../../core/models/clubes';
import { NOMBRES_POSICION, Perfil, Posicion } from '../../core/models/usuario';
import { AutoAlturaDirective } from '../directives/auto-altura.directive';
import {
  contrasenaSegura,
  contrasenasIguales,
  correoValido,
  fechaNacimientoValida,
  imagenValida,
  nombreUsuarioValido,
  TIPOS_IMAGEN,
} from '../validators';
import { ErrorCampo } from './error-campo';
import { EscudoClub } from './escudo-club';

type CampoUnico = 'correo' | 'nombreUsuario';

/**
 * Formulario con los datos de una cuenta: lo usan el registro y el alta de usuarios del dashboard
 * (que además elige el perfil con dos radio buttons). Entrega un FormData listo para enviar.
 */
@Component({
  selector: 'app-formulario-cuenta',
  imports: [ReactiveFormsModule, ErrorCampo, EscudoClub, AutoAlturaDirective],
  templateUrl: './formulario-cuenta.html',
  styleUrl: './formulario-cuenta.css',
})
export class FormularioCuenta {
  /** Con true se muestran los radio buttons de perfil (dashboard de administración). */
  readonly elegirPerfil = input(false);
  readonly enviando = input(false);
  readonly textoEnviar = input('Crear cuenta');
  readonly textoEnviando = input('Creando cuenta...');
  /** Los datos validados, como multipart/form-data (incluyen la imagen). */
  readonly enviar = output<FormData>();
  /** Cada vez que se elige un club (null: sin club). El registro lo usa para cambiar el fondo. */
  readonly clubElegido = output<string | null>();

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly tiposImagen = TIPOS_IMAGEN.join(',');
  protected readonly hoy = new Date().toISOString().slice(0, 10);
  protected readonly clubes = CLUBES;
  protected readonly posiciones = Object.entries(NOMBRES_POSICION).map(([valor, texto]) => ({
    valor,
    texto,
  }));
  protected readonly vistaPrevia = signal<string | null>(null);

  protected readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      correo: ['', [Validators.required, correoValido, Validators.maxLength(100)]],
      nombreUsuario: ['', [Validators.required, nombreUsuarioValido]],
      contrasena: ['', [Validators.required, contrasenaSegura]],
      repetirContrasena: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, fechaNacimientoValida]],
      posicion: this.fb.control<Posicion | ''>('', Validators.required),
      // Opcional: vacío es "sin club" y el backend no lo guarda.
      club: [''],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      perfil: this.fb.control<Perfil>('usuario', Validators.required),
      imagenPerfil: this.fb.control<File | null>(null, [imagenValida]),
    },
    { validators: contrasenasIguales },
  );
  protected readonly campos = this.form.controls;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.liberarVistaPrevia());
  }

  /** Marca el campo repetido que informó la API (409). */
  marcarError(campo: string | null, mensaje: string): void {
    if (campo === 'correo' || campo === 'nombreUsuario') {
      this.campos[campo as CampoUnico].setErrors({ servidor: mensaje });
      this.campos[campo as CampoUnico].markAsTouched();
    }
  }

  /** Vuelve a dejar el formulario vacío (por ejemplo, después de crear una cuenta desde el dashboard). */
  reiniciar(): void {
    this.form.reset();
    this.liberarVistaPrevia();
    this.vistaPrevia.set(null);
  }

  protected elegirImagen(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    this.campos.imagenPerfil.setValue(archivo);
    this.campos.imagenPerfil.markAsTouched();
    this.liberarVistaPrevia();
    this.vistaPrevia.set(
      archivo && this.campos.imagenPerfil.valid ? URL.createObjectURL(archivo) : null,
    );
  }

  protected elegirClub(): void {
    this.clubElegido.emit(this.campos.club.value || null);
  }

  protected enviarFormulario(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Va como multipart/form-data porque puede incluir la imagen. "Repetir contraseña" solo se valida acá.
    const { repetirContrasena: _, imagenPerfil, perfil, ...datos } = this.form.getRawValue();
    const formulario = new FormData();
    for (const [campo, valor] of Object.entries(datos)) formulario.append(campo, valor);
    if (this.elegirPerfil()) formulario.append('perfil', perfil);
    // La imagen es opcional: sin foto, la cuenta muestra la silueta por defecto.
    if (imagenPerfil) formulario.append('imagenPerfil', imagenPerfil);
    this.enviar.emit(formulario);
  }

  private liberarVistaPrevia(): void {
    const url = this.vistaPrevia();
    if (url) URL.revokeObjectURL(url);
  }
}
