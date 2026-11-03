import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RangoFechasDto } from './dto/rango-fechas.dto';
import { Comentario } from './schemas/comentario.schema';
import { Publicacion } from './schemas/publicacion.schema';

const DIA_MS = 24 * 60 * 60 * 1000;
const DIAS_POR_DEFECTO = 30;
const DIAS_MAXIMOS = 366;
/** Los días se cuentan en la hora argentina: un comentario de las 23 h no cae en el día siguiente. */
const ZONA = 'America/Argentina/Buenos_Aires';
const fechaLocal = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA });

export interface Rango {
  desde: Date;
  hasta: Date;
}

/** Cada día (AAAA-MM-DD, hora argentina) entre dos fechas, incluidos los extremos. */
function diasEntre({ desde, hasta }: Rango): string[] {
  const ultimo = fechaLocal.format(hasta);
  const dias: string[] = [];
  for (let t = desde.getTime(); ; t += DIA_MS) {
    const dia = fechaLocal.format(t);
    if (dia > ultimo) break;
    if (dias.at(-1) !== dia) dias.push(dia);
  }
  if (dias.at(-1) !== ultimo) dias.push(ultimo);
  return dias;
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
  ) {}

  /** Publicaciones hechas por cada usuario en el lapso (también las que después se dieron de baja). */
  async publicacionesPorUsuario(filtro: RangoFechasDto) {
    const rango = this.rango(filtro);
    const datos = await this.publicacionModel.aggregate([
      { $match: { createdAt: { $gte: rango.desde, $lte: rango.hasta } } },
      { $group: { _id: '$usuario', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'autor',
        },
      },
      { $unwind: '$autor' },
      { $sort: { cantidad: -1, 'autor.nombreUsuario': 1 } },
      {
        $project: {
          _id: 0,
          cantidad: 1,
          usuario: {
            id: { $toString: '$autor._id' },
            nombre: '$autor.nombre',
            apellido: '$autor.apellido',
            nombreUsuario: '$autor.nombreUsuario',
          },
        },
      },
    ]);
    return { ...rango, datos };
  }

  /** Comentarios hechos por día en el lapso, con todos los días (también los que no tuvieron ninguno). */
  async comentariosPorDia(filtro: RangoFechasDto) {
    const rango = this.rango(filtro);
    const porDia = await this.comentarioModel.aggregate<{
      _id: string;
      cantidad: number;
    }>([
      { $match: { createdAt: { $gte: rango.desde, $lte: rango.hasta } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: ZONA,
            },
          },
          cantidad: { $sum: 1 },
        },
      },
    ]);
    const cantidades = new Map(porDia.map((d) => [d._id, d.cantidad]));
    const datos = diasEntre(rango).map((fecha) => ({
      fecha,
      cantidad: cantidades.get(fecha) ?? 0,
    }));
    const total = porDia.reduce((suma, d) => suma + d.cantidad, 0);
    return { ...rango, total, datos };
  }

  /** Comentarios que recibió cada publicación en el lapso. Las dadas de baja no aparecen. */
  async comentariosPorPublicacion(filtro: RangoFechasDto) {
    const rango = this.rango(filtro);
    const datos = await this.comentarioModel.aggregate([
      { $match: { createdAt: { $gte: rango.desde, $lte: rango.hasta } } },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'publicaciones',
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: '$publicacion' },
      { $match: { 'publicacion.activa': true } },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'publicacion.usuario',
          foreignField: '_id',
          as: 'autor',
        },
      },
      { $unwind: '$autor' },
      { $sort: { cantidad: -1, 'publicacion.createdAt': -1 } },
      {
        $project: {
          _id: 0,
          cantidad: 1,
          publicacion: {
            id: { $toString: '$publicacion._id' },
            titulo: '$publicacion.titulo',
            autor: '$autor.nombreUsuario',
          },
        },
      },
    ]);
    return { ...rango, datos };
  }

  /** Lapso pedido o, si falta algún extremo, los últimos 30 días. */
  private rango({ desde, hasta }: RangoFechasDto): Rango {
    const fin = hasta ?? new Date();
    const inicio = desde ?? new Date(fin.getTime() - DIAS_POR_DEFECTO * DIA_MS);
    if (inicio > fin) {
      throw new BadRequestException('desde no puede ser posterior a hasta.');
    }
    if (fin.getTime() - inicio.getTime() > DIAS_MAXIMOS * DIA_MS) {
      throw new BadRequestException('El lapso no puede superar un año.');
    }
    return { desde: inicio, hasta: fin };
  }
}
