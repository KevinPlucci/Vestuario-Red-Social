import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Types } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
const RUTAS = [
  'publicaciones-por-usuario',
  'comentarios-por-dia',
  'comentarios-por-publicacion',
];

interface Cuenta {
  id: string;
  token: string;
}

describe('Estadísticas (e2e)', () => {
  let app: INestApplication<App>;
  let mongo: MongoMemoryServer;
  let conexion: Connection;
  let admin: Cuenta;
  let ana: Cuenta;
  let beto: Cuenta;

  const servidor = () => app.getHttpServer();
  const pedir = (ruta: string, query = '', cuenta: Cuenta | null = admin) => {
    const pedido = request(servidor()).get(`/estadisticas/${ruta}${query}`);
    return cuenta
      ? pedido.set('Authorization', `Bearer ${cuenta.token}`)
      : pedido;
  };

  async function registrar(nombreUsuario: string): Promise<Cuenta> {
    const { body } = await request(servidor())
      .post('/autenticacion/registro')
      .field('nombre', 'Nombre')
      .field('apellido', 'Apellido')
      .field('correo', `${nombreUsuario}@example.com`)
      .field('nombreUsuario', nombreUsuario)
      .field('contrasena', 'Segura123')
      .field('fechaNacimiento', '1995-05-05')
      .field('posicion', 'delantero')
      .field('descripcion', 'Cuenta de prueba.')
      .attach('imagenPerfil', PNG, { filename: 'perfil.png' })
      .expect(201);
    return { id: body.usuario.id as string, token: body.token as string };
  }

  /** Inserta directo en la base para controlar las fechas. */
  async function publicacion(
    autor: Cuenta,
    titulo: string,
    fecha: string,
    activa = true,
  ) {
    const { insertedId } = await conexion
      .collection('publicaciones')
      .insertOne({
        titulo,
        mensaje: titulo,
        usuario: new Types.ObjectId(autor.id),
        meGusta: [],
        activa,
        createdAt: new Date(fecha),
        updatedAt: new Date(fecha),
      });
    return insertedId;
  }

  const comentario = (
    publicacion: Types.ObjectId,
    autor: Cuenta,
    fecha: string,
  ) =>
    conexion.collection('comentarios').insertOne({
      publicacion,
      usuario: new Types.ObjectId(autor.id),
      mensaje: 'Comentario',
      modificado: false,
      createdAt: new Date(fecha),
      updatedAt: new Date(fecha),
    });

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri('red-social-test');
    process.env.JWT_SECRETO = 'secreto-de-prueba';
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    await app.init();
    conexion = app.get<Connection>(getConnectionToken());

    admin = await registrar('admin');
    await conexion
      .collection('usuarios')
      .updateOne(
        { nombreUsuario: 'admin' },
        { $set: { perfil: 'administrador' } },
      );
    ana = await registrar('ana');
    beto = await registrar('beto');

    const p1 = await publicacion(ana, 'Uno', '2026-03-02T15:00:00Z');
    const p2 = await publicacion(ana, 'Dos', '2026-03-03T15:00:00Z');
    const p3 = await publicacion(beto, 'Tres', '2026-03-04T15:00:00Z');
    // Dada de baja: cuenta como publicación hecha, pero sus comentarios ya no se muestran por publicación.
    const p4 = await publicacion(beto, 'Baja', '2026-03-05T15:00:00Z', false);
    // Fuera del lapso de las pruebas (1 al 10 de marzo).
    await publicacion(beto, 'Vieja', '2026-01-10T15:00:00Z');

    await comentario(p1, beto, '2026-03-02T16:00:00Z');
    await comentario(p1, beto, '2026-03-02T17:00:00Z');
    // 02:00 UTC del 3 es todavía el 2 a la noche en la Argentina (UTC-3).
    await comentario(p1, admin, '2026-03-03T02:00:00Z');
    await comentario(p3, ana, '2026-03-04T18:00:00Z');
    await comentario(p4, ana, '2026-03-05T18:00:00Z');
    await comentario(p2, beto, '2026-01-11T18:00:00Z');
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  const MARZO =
    '?desde=2026-03-01T03:00:00.000Z&hasta=2026-03-11T02:59:59.999Z';

  it('401 sin token y 403 si no es administrador, en las tres rutas', async () => {
    for (const ruta of RUTAS) {
      expect((await pedir(ruta, '', null)).status).toBe(401);
      const comun = await pedir(ruta, '', ana);
      expect(comun.status).toBe(403);
      expect(comun.body.message).toBe(
        'Solo un administrador puede hacer esto.',
      );
    }
  });

  it('publicaciones por usuario en el lapso, de más a menos, incluidas las dadas de baja', async () => {
    const { status, body } = await pedir('publicaciones-por-usuario', MARZO);
    expect(status).toBe(200);
    expect(
      (
        body.datos as { usuario: { nombreUsuario: string }; cantidad: number }[]
      ).map((d) => [d.usuario.nombreUsuario, d.cantidad]),
    ).toEqual([
      ['ana', 2],
      ['beto', 2],
    ]);
    expect(body.desde).toBe('2026-03-01T03:00:00.000Z');
  });

  it('comentarios por día: todos los días del lapso, contados en la hora argentina', async () => {
    const { status, body } = await pedir('comentarios-por-dia', MARZO);
    expect(status).toBe(200);
    expect(body.total).toBe(5);
    const porDia = Object.fromEntries(
      (body.datos as { fecha: string; cantidad: number }[]).map((d) => [
        d.fecha,
        d.cantidad,
      ]),
    );
    expect(Object.keys(porDia)).toHaveLength(10);
    expect(porDia).toMatchObject({
      '2026-03-01': 0,
      '2026-03-02': 3,
      '2026-03-03': 0,
      '2026-03-04': 1,
      '2026-03-05': 1,
      '2026-03-10': 0,
    });
  });

  it('comentarios por publicación, sin las dadas de baja', async () => {
    const { status, body } = await pedir('comentarios-por-publicacion', MARZO);
    expect(status).toBe(200);
    expect(
      (
        body.datos as {
          publicacion: { titulo: string; autor: string };
          cantidad: number;
        }[]
      ).map((d) => [d.publicacion.titulo, d.publicacion.autor, d.cantidad]),
    ).toEqual([
      ['Uno', 'ana', 3],
      ['Tres', 'beto', 1],
    ]);
  });

  it('sin fechas, los últimos 30 días', async () => {
    const { status, body } = await pedir('comentarios-por-dia');
    expect(status).toBe(200);
    const { desde, hasta } = body as { desde: string; hasta: string };
    const dias = (Date.parse(hasta) - Date.parse(desde)) / 86_400_000;
    expect(dias).toBe(30);
    expect(body.datos.length).toBeGreaterThanOrEqual(30);
  });

  it('400 con fechas inválidas, desde posterior a hasta o un lapso de más de un año', async () => {
    const invalida = await pedir('comentarios-por-dia', '?desde=ayer');
    expect(invalida.status).toBe(400);
    expect(invalida.body.message).toEqual([
      'desde tiene que ser una fecha válida.',
    ]);

    const alReves = await pedir(
      'publicaciones-por-usuario',
      '?desde=2026-03-10&hasta=2026-03-01',
    );
    expect(alReves.status).toBe(400);
    expect(alReves.body.message).toBe('desde no puede ser posterior a hasta.');

    const largo = await pedir(
      'comentarios-por-publicacion',
      '?desde=2024-01-01&hasta=2026-03-01',
    );
    expect(largo.status).toBe(400);
    expect(largo.body.message).toBe('El lapso no puede superar un año.');
  });
});
