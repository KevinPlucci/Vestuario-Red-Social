import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../autenticacion/admin.guard';
import { SesionGuard } from '../autenticacion/sesion.guard';
import { UsuarioActual } from '../autenticacion/usuario-actual.decorator';
import { ImagenPipe, LIMITE_SUBIDA } from '../imagenes/imagen.pipe';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';
import type { UsuarioDocument } from './schemas/usuario.schema';
import { UsuariosService } from './usuarios.service';

/** Dashboard de usuarios: todo solo para administradores (401 sin sesión, 403 si no es administrador). */
@Controller('usuarios')
@UseGuards(SesionGuard, AdminGuard)
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  /** 200 con { usuarios, total, offset, limit }, las cuentas más nuevas primero · 400 parámetros inválidos. */
  @Get()
  listar(@Query() filtro: ListarUsuariosDto) {
    return this.usuarios.listar(filtro);
  }

  /** 201 con la cuenta creada (sin token: el administrador sigue en su sesión) · 400 · 409 correo o usuario en uso. */
  @Post()
  @UseInterceptors(
    FileInterceptor('imagenPerfil', { limits: { fileSize: LIMITE_SUBIDA } }),
  )
  crear(
    @Body() { perfil, ...datos }: CrearUsuarioDto,
    @UploadedFile(new ImagenPipe('La imagen de perfil es obligatoria.'))
    imagen: Express.Multer.File,
  ) {
    return this.usuarios.crearCuenta(datos, imagen, perfil);
  }

  /** 200 con la cuenta deshabilitada · 400 la propia cuenta · 404 no existe · 409 ya estaba deshabilitada. */
  @Delete(':id')
  deshabilitar(
    @Param('id') id: string,
    @UsuarioActual() administrador: UsuarioDocument,
  ) {
    return this.usuarios.deshabilitar(id, administrador);
  }

  /** 200 con la cuenta habilitada · 404 no existe · 409 ya estaba habilitada. */
  @Post(':id/habilitar')
  @HttpCode(HttpStatus.OK)
  habilitar(@Param('id') id: string) {
    return this.usuarios.habilitar(id);
  }
}
