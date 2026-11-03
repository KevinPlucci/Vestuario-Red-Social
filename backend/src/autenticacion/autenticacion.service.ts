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
import { DatosToken } from './token';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly jwt: JwtService,
  ) {}

  async registrar(datos: RegistroDto, imagen: Express.Multer.File) {
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
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
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

  /** Token nuevo con el mismo payload que el actual y 15 minutos más de vida. */
  refrescar({ sub, nombreUsuario, perfil }: DatosToken) {
    return { token: this.firmar({ sub, nombreUsuario, perfil }) };
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

  private firmar(datos: DatosToken): string {
    return this.jwt.sign(datos);
  }
}
