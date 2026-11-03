import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../autenticacion/admin.guard';
import { SesionGuard } from '../autenticacion/sesion.guard';
import { RangoFechasDto } from './dto/rango-fechas.dto';
import { EstadisticasService } from './estadisticas.service';

/**
 * Datos de los gráficos del dashboard, solo para administradores. Todas las rutas aceptan
 * ?desde=&hasta= y responden 200 · 400 fechas inválidas · 401 sin sesión · 403 si no es administrador.
 */
@Controller('estadisticas')
@UseGuards(SesionGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticas: EstadisticasService) {}

  /** { desde, hasta, datos: [{ usuario, cantidad }] }, de más a menos publicaciones. */
  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() rango: RangoFechasDto) {
    return this.estadisticas.publicacionesPorUsuario(rango);
  }

  /** { desde, hasta, total, datos: [{ fecha, cantidad }] }, un elemento por día. */
  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() rango: RangoFechasDto) {
    return this.estadisticas.comentariosPorDia(rango);
  }

  /** { desde, hasta, datos: [{ publicacion, cantidad }] }, de más a menos comentarios. */
  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() rango: RangoFechasDto) {
    return this.estadisticas.comentariosPorPublicacion(rango);
  }
}
