/**
 * Carga los datos de ejemplo: la cuenta "admin" (administradora), 10 jugadores con publicaciones (con y sin
 * foto), comentarios (algunos editados) y "Me gusta", repartidos en los últimos 30 días para que las
 * estadísticas tengan datos. Las cuentas que ya existen se saltean, así que se puede correr más de una vez.
 * Uso: npm run sembrar (con el .env apuntando a la base). Para la base de producción, URL_PUBLICA tiene que
 * ser la URL de la API publicada: con ella se arman las URL de las imágenes.
 */
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Model, Types } from 'mongoose';
import { AppModule } from '../app.module';
import { ComentariosService } from '../publicaciones/comentarios.service';
import { PublicacionesService } from '../publicaciones/publicaciones.service';
import { Comentario } from '../publicaciones/schemas/comentario.schema';
import { Publicacion } from '../publicaciones/schemas/publicacion.schema';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { UsuariosService } from '../usuarios/usuarios.service';
import {
  ADMIN,
  COMENTARIOS,
  CONTRASENA_ADMIN,
  CONTRASENA_JUGADORES,
  JUGADORES,
  JugadorSemilla,
} from './datos-semilla';

const CARPETA = path.join(__dirname, '..', '..', 'semilla');
const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;
/** Comentarios de cada publicación, en el orden en que se publican: dispares, para que el gráfico muestre algo. */
const CANTIDAD_COMENTARIOS = [
  5, 2, 7, 1, 3, 0, 4, 2, 9, 1, 3, 6, 2, 0, 4, 1, 8, 3, 2, 5, 1, 3,
];

/** Un archivo de la carpeta semilla con la forma que tiene un archivo subido por multer. */
function archivo(carpeta: string, nombre: string): Express.Multer.File {
  const buffer = fs.readFileSync(path.join(CARPETA, carpeta, nombre));
  const mimetype = nombre.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return {
    buffer,
    mimetype,
    size: buffer.length,
    originalname: nombre,
    fieldname: 'imagen',
  } as Express.Multer.File;
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  const usuarios = app.get(UsuariosService);
  const publicaciones = app.get(PublicacionesService);
  const comentarios = app.get(ComentariosService);
  const usuarioModel = app.get<Model<Usuario>>(getModelToken(Usuario.name));
  const publicacionModel = app.get<Model<Publicacion>>(
    getModelToken(Publicacion.name),
  );
  const comentarioModel = app.get<Model<Comentario>>(
    getModelToken(Comentario.name),
  );

  const ahora = Date.now();
  /** Cambia las fechas sin pasar por Mongoose, que si no las pisa con la hora actual. */
  const fechar = (
    modelo: Model<any>,
    id: Types.ObjectId,
    creado: number,
    modificado = creado,
  ) =>
    modelo.collection.updateOne(
      { _id: id },
      {
        $set: { createdAt: new Date(creado), updatedAt: new Date(modificado) },
      },
    );

  async function crear(
    jugador: JugadorSemilla,
    contrasena: string,
    perfil: 'usuario' | 'administrador',
    alta: number,
  ) {
    if (await usuarioModel.exists({ nombreUsuario: jugador.nombreUsuario })) {
      console.log(`  @${jugador.nombreUsuario} ya existe: se saltea.`);
      return null;
    }
    const usuario = await usuarios.crearCuenta(
      {
        nombre: jugador.nombre,
        apellido: jugador.apellido,
        nombreUsuario: jugador.nombreUsuario,
        posicion: jugador.posicion,
        club: jugador.club,
        descripcion: jugador.descripcion,
        correo: `${jugador.nombreUsuario}@example.com`,
        contrasena,
        fechaNacimiento: new Date(jugador.fechaNacimiento),
      },
      archivo('avatares', `${jugador.nombreUsuario}.png`),
      perfil,
    );
    await fechar(usuarioModel, usuario._id, alta);
    console.log(`  @${usuario.nombreUsuario} (${perfil})`);
    return usuario;
  }

  console.log('Cuentas:');
  await crear(ADMIN, CONTRASENA_ADMIN, 'administrador', ahora - 40 * DIA);
  const creados: { usuario: UsuarioDocument; jugador: JugadorSemilla }[] = [];
  for (const [i, jugador] of JUGADORES.entries()) {
    const usuario = await crear(
      jugador,
      CONTRASENA_JUGADORES,
      'usuario',
      ahora - 38 * DIA + i * 5 * HORA,
    );
    if (usuario) creados.push({ usuario, jugador });
  }

  // Publicaciones repartidas entre hace 29 días y hace unas horas, intercalando a los jugadores.
  const pendientes = creados.flatMap(({ usuario, jugador }) =>
    jugador.publicaciones.map((datos, orden) => ({ usuario, datos, orden })),
  );
  pendientes.sort((a, b) => a.orden - b.orden);
  const hechas: { id: string; autor: UsuarioDocument; fecha: number }[] = [];
  for (const [k, { usuario, datos }] of pendientes.entries()) {
    const fecha =
      ahora -
      29 * DIA +
      Math.round((k * 28 * DIA) / Math.max(1, pendientes.length)) +
      (k % 4) * 3 * HORA;
    const foto = datos.foto ? archivo('fotos', `${datos.foto}.jpg`) : undefined;
    const vista = await publicaciones.crear(
      usuario,
      { titulo: datos.titulo, mensaje: datos.mensaje },
      foto,
    );
    await fechar(publicacionModel, new Types.ObjectId(vista.id), fecha);
    hechas.push({ id: vista.id, autor: usuario, fecha });
  }
  console.log(
    `Publicaciones: ${hechas.length} (${pendientes.filter((p) => p.datos.foto).length} con foto)`,
  );

  // Cada publicación recibe de 0 a 9 comentarios y hasta 4 "Me gusta" de otros jugadores; algunos comentarios se editan.
  const jugadores = creados.map((c) => c.usuario);
  let cantidadComentarios = 0;
  let editados = 0;
  let meGusta = 0;
  for (const [k, publicacion] of hechas.entries()) {
    const otros = jugadores.filter((j) => !j._id.equals(publicacion.autor._id));
    if (!otros.length) continue;
    const cantidad = Math.min(
      otros.length,
      CANTIDAD_COMENTARIOS[k % CANTIDAD_COMENTARIOS.length],
    );
    for (let j = 0; j < cantidad; j++) {
      const autor = otros[(k + 1 + j) % otros.length];
      const mensaje = COMENTARIOS[(k * 3 + j) % COMENTARIOS.length];
      const fecha = Math.min(
        ahora - 10 * 60 * 1000,
        publicacion.fecha + (j + 1) * (2 + (k % 5)) * HORA + j * 5 * HORA,
      );
      const comentario = await comentarios.crear(publicacion.id, autor, {
        mensaje,
      });
      cantidadComentarios++;
      if (cantidadComentarios % 7 === 0) {
        await comentarioModel.collection.updateOne(
          { _id: new Types.ObjectId(comentario.id) },
          { $set: { mensaje: `${mensaje} ¡Bien ahí!`, modificado: true } },
        );
        await fechar(
          comentarioModel,
          new Types.ObjectId(comentario.id),
          fecha,
          Math.min(ahora, fecha + HORA),
        );
        editados++;
      } else {
        await fechar(comentarioModel, new Types.ObjectId(comentario.id), fecha);
      }
    }
    for (const salto of [2, 4, 5, 7].slice(0, 1 + (k % 4))) {
      const usuario = otros[(k + salto) % otros.length];
      await publicaciones
        .darMeGusta(publicacion.id, usuario)
        .catch(() => undefined);
      meGusta++;
    }
  }
  console.log(
    `Comentarios: ${cantidadComentarios} (${editados} editados) · "Me gusta": ${meGusta}`,
  );
  console.log(
    `\nAdministrador: ${ADMIN.nombreUsuario} / ${CONTRASENA_ADMIN} · Jugadores: <usuario> / ${CONTRASENA_JUGADORES}`,
  );
  await app.close();
}

void main();
