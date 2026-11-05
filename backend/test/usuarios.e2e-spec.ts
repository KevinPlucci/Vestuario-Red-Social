import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

/** Cabecera de un PNG: alcanza para que se reconozca como imagen. */
const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
const ID_INEXISTENTE = '0123456789abcdef01234567';
const SOLO_ADMIN = 'Solo un administrador puede hacer esto.';

interface Cuenta {
  id: string;
  token: string;
}

describe('Usuarios (e2e)', () => {
  let app: INestApplication<App>;
  let mongo: MongoMemoryServer;
  let conexion: Connection;
  let admin: Cuenta;
  let ana: Cuenta;

  const servidor = () => app.getHttpServer();
  const con = (pedido: request.Test, cuenta?: Cuenta | null) =>
    cuenta ? pedido.set('Authorization', `Bearer ${cuenta.token}`) : pedido;

  const datosCuenta = (nombreUsuario: string) => ({
    nombre: 'Nombre',
    apellido: 'Apellido',
    correo: `${nombreUsuario}@example.com`,
    nombreUsuario,
    contrasena: 'Segura123',
    fechaNacimiento: '1995-05-05',
    posicion: 'defensor',
    club: 'lanus',
    descripcion: 'Cuenta de prueba.',
  });

  async function registrar(nombreUsuario: string): Promise<Cuenta> {
    const pedido = request(servidor()).post('/autenticacion/registro');
    for (const [campo, valor] of Object.entries(datosCuenta(nombreUsuario)))
      pedido.field(campo, valor);
    const { body } = await pedido
      .attach('imagenPerfil', PNG, { filename: 'perfil.png' })
      .expect(201);
    return { id: body.usuario.id as string, token: body.token as string };
  }

  /** Alta desde el dashboard. Sin imagen si se pasa imagen = false. */
  function crear(
    cuenta: Cuenta | undefined,
    campos: Record<string, string>,
    imagen = true,
  ) {
    const pedido = con(request(servidor()).post('/usuarios'), cuenta);
    for (const [campo, valor] of Object.entries(campos))
      pedido.field(campo, valor);
    if (imagen) pedido.attach('imagenPerfil', PNG, { filename: 'perfil.png' });
    return pedido;
  }

  const listar = (query = '', cuenta: Cuenta | null = admin) =>
    con(request(servidor()).get(`/usuarios${query}`), cuenta);
  const deshabilitar = (id: string, cuenta: Cuenta | null = admin) =>
    con(request(servidor()).delete(`/usuarios/${id}`), cuenta);
  const habilitar = (id: string, cuenta: Cuenta | null = admin) =>
    con(request(servidor()).post(`/usuarios/${id}/habilitar`), cuenta);
  const login = (usuario: string) =>
    request(servidor())
      .post('/autenticacion/login')
      .send({ usuario, contrasena: 'Segura123' });

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
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  describe('permisos', () => {
    it('401 sin token en todas las rutas', async () => {
      expect((await listar('', null)).status).toBe(401);
      expect((await crear(undefined, datosCuenta('x'))).status).toBe(401);
      expect((await deshabilitar(ana.id, null)).status).toBe(401);
      expect((await habilitar(ana.id, null)).status).toBe(401);
    });

    it('403 con el token de un usuario común', async () => {
      for (const respuesta of [
        await listar('', ana),
        await crear(ana, { ...datosCuenta('beto'), perfil: 'usuario' }),
        await deshabilitar(admin.id, ana),
        await habilitar(admin.id, ana),
      ]) {
        expect(respuesta.status).toBe(403);
        expect(respuesta.body.message).toBe(SOLO_ADMIN);
      }
    });
  });

  describe('GET /usuarios', () => {
    it('200 con las cuentas, las más nuevas primero, sin contraseñas', async () => {
      const { status, body } = await listar();
      expect(status).toBe(200);
      expect(body).toMatchObject({ total: 2, offset: 0, limit: 10 });
      const nombres = (body.usuarios as { nombreUsuario: string }[]).map(
        (u) => u.nombreUsuario,
      );
      expect(nombres).toEqual(['ana', 'admin']);
      expect(body.usuarios[0]).toMatchObject({
        perfil: 'usuario',
        activo: true,
        club: 'lanus',
      });
      expect(body.usuarios[0]).not.toHaveProperty('contrasena');
    });

    it('pagina y busca por nombre de usuario, nombre o correo', async () => {
      const pagina = await listar('?offset=1&limit=1');
      expect(pagina.body.usuarios).toHaveLength(1);
      expect(pagina.body.usuarios[0].nombreUsuario).toBe('admin');

      const busqueda = await listar('?buscar=AN');
      expect(busqueda.body.total).toBe(1);
      expect(busqueda.body.usuarios[0].nombreUsuario).toBe('ana');
    });

    it('400 con parámetros inválidos', async () => {
      const { status, body } = await listar('?limit=0');
      expect(status).toBe(400);
      expect(body.message).toEqual(['limit tiene que ser al menos 1.']);
    });
  });

  describe('POST /usuarios', () => {
    it('201 con el perfil elegido y sin token; la cuenta ya puede ingresar', async () => {
      const { status, body } = await crear(admin, {
        ...datosCuenta('carla'),
        perfil: 'administrador',
      });
      expect(status).toBe(201);
      expect(body).toMatchObject({
        nombreUsuario: 'carla',
        perfil: 'administrador',
        activo: true,
      });
      expect(body).not.toHaveProperty('token');
      expect(body).not.toHaveProperty('contrasena');

      const ingreso = await login('carla');
      expect(ingreso.status).toBe(200);
      const carla = { id: body.id as string, token: ingreso.body.token };
      expect((await listar('', carla)).status).toBe(200);
    });

    it('201 como usuario común', async () => {
      const { status, body } = await crear(admin, {
        ...datosCuenta('dario'),
        perfil: 'usuario',
      });
      expect(status).toBe(201);
      expect(body.perfil).toBe('usuario');
    });

    it('400 sin perfil o con un perfil inválido', async () => {
      const sinPerfil = await crear(admin, datosCuenta('eva'));
      expect(sinPerfil.status).toBe(400);
      expect(sinPerfil.body.message).toEqual(['Elegí el perfil de la cuenta.']);

      const invalido = await crear(admin, {
        ...datosCuenta('eva'),
        perfil: 'superusuario',
      });
      expect(invalido.status).toBe(400);
      expect(invalido.body.message).toEqual([
        'El perfil tiene que ser "usuario" o "administrador".',
      ]);
    });

    it('201 sin imagen de perfil (es opcional)', async () => {
      const { status, body } = await crear(
        admin,
        { ...datosCuenta('eva'), perfil: 'usuario' },
        false,
      );
      expect(status).toBe(201);
      expect(body.nombreUsuario).toBe('eva');
      expect(body).not.toHaveProperty('imagenPerfil');
    });

    it('409 si el correo o el nombre de usuario ya existen', async () => {
      const { status, body } = await crear(admin, {
        ...datosCuenta('ana'),
        perfil: 'usuario',
      });
      expect(status).toBe(409);
      expect(body.campo).toBe('correo');
    });
  });

  describe('baja y alta lógica', () => {
    let fede: Cuenta;

    beforeAll(async () => {
      fede = await registrar('fede');
    });

    it('DELETE 200: la cuenta queda deshabilitada, no puede ingresar y su token deja de servir', async () => {
      const { status, body } = await deshabilitar(fede.id);
      expect(status).toBe(200);
      expect(body).toMatchObject({ nombreUsuario: 'fede', activo: false });

      const ingreso = await login('fede');
      expect(ingreso.status).toBe(403);
      expect(ingreso.body).toMatchObject({
        message:
          'Tu cuenta está deshabilitada: no estás autorizado a ingresar. Comunicate con un administrador.',
        motivo: 'cuenta-deshabilitada',
      });

      const conToken = await con(
        request(servidor()).get('/publicaciones'),
        fede,
      );
      expect(conToken.status).toBe(401);
      expect(conToken.body).toMatchObject({
        message: 'Tu cuenta fue deshabilitada por un administrador.',
        motivo: 'cuenta-deshabilitada',
      });
    });

    it('con contraseña incorrecta, una cuenta deshabilitada responde lo mismo que cualquiera (401)', async () => {
      const { status, body } = await request(servidor())
        .post('/autenticacion/login')
        .send({ usuario: 'fede', contrasena: 'Otra1234' });
      expect(status).toBe(401);
      expect(body.message).toBe('Las credenciales no son correctas.');
    });

    it('409 si ya estaba deshabilitada; 400 la propia cuenta; 404 si no existe', async () => {
      expect((await deshabilitar(fede.id)).status).toBe(409);
      const propia = await deshabilitar(admin.id);
      expect(propia.status).toBe(400);
      expect(propia.body.message).toBe(
        'No podés deshabilitar tu propia cuenta.',
      );
      expect((await deshabilitar(ID_INEXISTENTE)).status).toBe(404);
      expect((await deshabilitar('no-es-un-id')).status).toBe(404);
    });

    it('POST habilitar 200: vuelve a ingresar; 409 si ya estaba habilitada; 404 si no existe', async () => {
      const { status, body } = await habilitar(fede.id);
      expect(status).toBe(200);
      expect(body.activo).toBe(true);
      expect((await login('fede')).status).toBe(200);

      expect((await habilitar(fede.id)).status).toBe(409);
      expect((await habilitar(ID_INEXISTENTE)).status).toBe(404);
    });
  });
});
