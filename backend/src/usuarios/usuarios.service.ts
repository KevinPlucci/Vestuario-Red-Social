import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { RegistroDto } from '../autenticacion/dto/registro.dto';
import { esIdValido } from '../comun/ids';
import { ImagenesService } from '../imagenes/imagenes.service';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';
import { Perfil, Usuario, UsuarioDocument } from './schemas/usuario.schema';

const RONDAS_BCRYPT = 10;
const NO_EXISTE = 'El usuario no existe.';

const MENSAJES_DUPLICADO = {
  correo: 'El correo ya está registrado.',
  nombreUsuario: 'El nombre de usuario ya está en uso.',
};
type CampoUnico = keyof typeof MENSAJES_DUPLICADO;

/** 409 con el campo repetido, para que el front lo marque en el formulario. */
function duplicado(campo: CampoUnico): ConflictException {
  return new ConflictException({
    statusCode: 409,
    error: 'Conflict',
    message: MENSAJES_DUPLICADO[campo],
    campo,
  });
}

/** Error de índice único de MongoDB (si dos altas iguales llegan casi al mismo tiempo). */
function campoDuplicado(error: unknown): CampoUnico | null {
  const { code, keyPattern } = (error ?? {}) as {
    code?: number;
    keyPattern?: Record<string, unknown>;
  };
  if (code !== 11000) return null;
  return keyPattern && 'nombreUsuario' in keyPattern
    ? 'nombreUsuario'
    : 'correo';
}

/** Escapa un texto para usarlo dentro de una expresión regular. */
const literal = (texto: string) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly imagenes: ImagenesService,
  ) {}

  async buscarPorId(id: string) {
    return esIdValido(id) ? this.usuarioModel.findById(id) : null;
  }

  /**
   * Alta de una cuenta, desde el registro (siempre "usuario") o desde el dashboard de un
   * administrador (con el perfil elegido): valida que no se repitan el correo ni el nombre de
   * usuario, encripta la contraseña y guarda la imagen de perfil, si se mandó (es opcional).
   */
  async crearCuenta(
    datos: RegistroDto,
    imagen: Express.Multer.File | undefined,
    perfil: Perfil = 'usuario',
  ): Promise<UsuarioDocument> {
    if (await this.existeCorreo(datos.correo)) throw duplicado('correo');
    if (await this.existeNombreUsuario(datos.nombreUsuario))
      throw duplicado('nombreUsuario');

    const contrasena = await bcrypt.hash(datos.contrasena, RONDAS_BCRYPT);
    const imagenPerfil = imagen
      ? await this.imagenes.guardar(imagen)
      : undefined;
    try {
      return await this.usuarioModel.create({
        ...datos,
        contrasena,
        imagenPerfil,
        perfil,
      });
    } catch (error) {
      if (imagenPerfil) await this.imagenes.eliminarPorUrl(imagenPerfil);
      const campo = campoDuplicado(error);
      throw campo ? duplicado(campo) : error;
    }
  }

  /** Listado para el dashboard: las cuentas más nuevas primero, con búsqueda opcional. */
  async listar({ offset, limit, buscar }: ListarUsuariosDto) {
    const texto = buscar ? new RegExp(literal(buscar), 'i') : null;
    const filtro = texto
      ? {
          $or: [
            { nombre: texto },
            { apellido: texto },
            { nombreUsuario: texto },
            { correo: texto },
          ],
        }
      : {};
    const [usuarios, total] = await Promise.all([
      this.usuarioModel
        .find(filtro)
        .sort({ createdAt: -1, _id: -1 })
        .skip(offset)
        .limit(limit),
      this.usuarioModel.countDocuments(filtro),
    ]);
    return { usuarios, total, offset, limit };
  }

  /** Baja lógica: la cuenta queda guardada, pero ya no puede ingresar ni usar su token. */
  async deshabilitar(id: string, administrador: UsuarioDocument) {
    const usuario = await this.buscarOFallar(id);
    if (usuario._id.equals(administrador._id)) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta.');
    }
    if (usuario.activo === false) {
      throw new ConflictException('La cuenta ya está deshabilitada.');
    }
    return this.cambiarEstado(usuario, false);
  }

  /** Alta lógica: la cuenta vuelve a poder ingresar. */
  async habilitar(id: string) {
    const usuario = await this.buscarOFallar(id);
    if (usuario.activo !== false) {
      throw new ConflictException('La cuenta ya está habilitada.');
    }
    return this.cambiarEstado(usuario, true);
  }

  async existeCorreo(correo: string): Promise<boolean> {
    return (
      (await this.usuarioModel.exists({ correo: correo.toLowerCase() })) !==
      null
    );
  }

  async existeNombreUsuario(nombreUsuario: string): Promise<boolean> {
    return (
      (await this.usuarioModel.exists({
        nombreUsuario: nombreUsuario.toLowerCase(),
      })) !== null
    );
  }

  /** Busca por correo o por nombre de usuario (los dos son únicos) e incluye el hash de la contraseña. */
  buscarConContrasena(correoOUsuario: string) {
    const valor = correoOUsuario.trim().toLowerCase();
    return this.usuarioModel
      .findOne({ $or: [{ correo: valor }, { nombreUsuario: valor }] })
      .select('+contrasena');
  }

  cambiarPerfil(correoOUsuario: string, perfil: Perfil) {
    const valor = correoOUsuario.trim().toLowerCase();
    return this.usuarioModel.findOneAndUpdate(
      { $or: [{ correo: valor }, { nombreUsuario: valor }] },
      { perfil },
      { returnDocument: 'after' },
    );
  }

  private async buscarOFallar(id: string) {
    const usuario = await this.buscarPorId(id);
    if (!usuario) throw new NotFoundException(NO_EXISTE);
    return usuario;
  }

  /** Solo cambia "activo": así una cuenta vieja con datos que hoy no validarían no impide el cambio. */
  private async cambiarEstado(usuario: UsuarioDocument, activo: boolean) {
    await this.usuarioModel.updateOne({ _id: usuario._id }, { activo });
    usuario.activo = activo;
    return usuario;
  }
}
