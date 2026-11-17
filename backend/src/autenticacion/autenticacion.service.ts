import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { CUENTA_DESHABILITADA } from './cuenta-deshabilitada';
import { DatosToken, DURACION_EXTENSION_SEGUNDOS } from './token';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly jwt: JwtService,
  ) {}

  async registrar(datos: RegistroDto, imagen?: Express.Multer.File) {
    // El perfil no se toma del formulario: toda cuenta nueva arranca como "usuario".
    const usuario = await this.usuarios.crearCuenta(datos, imagen);
    return this.iniciarSesionDe(usuario);
  }

  async iniciarSesion({ usuario, contrasena }: LoginDto) {
    const encontrado = await this.usuarios.buscarConContrasena(usuario);
    // compare() encripta la contraseña recibida con la misma sal del hash guardado y compara el resultado.
    const coincide =
      encontrado !== null &&
      (await bcrypt.compare(contrasena, encontrado.contrasena));
    if (!coincide)
      throw new UnauthorizedException('Las credenciales no son correctas.');
    // Recién con la contraseña correcta se avisa la baja: así no se revela qué cuentas existen.
    if (encontrado.activo === false) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message:
          'Tu cuenta está deshabilitada: no estás autorizado a ingresar. Comunicate con un administrador.',
        motivo: CUENTA_DESHABILITADA,
      });
    }
    return this.iniciarSesionDe(encontrado);
  }

  /** Token nuevo con el mismo payload que el actual, que dura lo que dura una extensión. */
  refrescar({ sub, nombreUsuario, perfil }: DatosToken) {
    return {
      token: this.firmar(
        { sub, nombreUsuario, perfil },
        DURACION_EXTENSION_SEGUNDOS,
      ),
    };
  }

  /** Respuesta del registro y del login: el token y todos los datos del usuario. */
  private iniciarSesionDe(usuario: UsuarioDocument) {
    const token = this.firmar({
      sub: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    });
    return { token, usuario };
  }

  /** Sin duración usa la del módulo (la del login); con duración, la indicada. */
  private firmar(datos: DatosToken, duracionSegundos?: number): string {
    return duracionSegundos
      ? this.jwt.sign(datos, { expiresIn: duracionSegundos })
      : this.jwt.sign(datos);
  }
}
