/**
 * Datos de ejemplo para probar la aplicación: 10 jugadores de la Liga Profesional 2026 (nombre, fecha de
 * nacimiento, posición y club reales), una cuenta administradora, sus publicaciones y comentarios.
 * Son cuentas de demostración: los textos los escribimos nosotros, no son de los jugadores.
 */
import type { Club } from '../usuarios/clubes';
import type { Posicion } from '../usuarios/schemas/usuario.schema';

export const CONTRASENA_JUGADORES = 'Vestuario2026';
export const CONTRASENA_ADMIN = 'Admin2026';

export interface PublicacionSemilla {
  titulo: string;
  mensaje: string;
  /** Archivo de semilla/fotos (sin extensión). Sin foto, la publicación va sin imagen. */
  foto?: string;
}

export interface JugadorSemilla {
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  posicion: Posicion;
  club?: Club;
  descripcion: string;
  publicaciones: PublicacionSemilla[];
}

export const ADMIN: JugadorSemilla = {
  nombreUsuario: 'admin',
  nombre: 'Admin',
  apellido: 'Vestuario',
  fechaNacimiento: '1990-01-01',
  posicion: 'mediocampista',
  descripcion: 'Cuenta de administración de Vestuario.',
  publicaciones: [],
};

export const JUGADORES: JugadorSemilla[] = [
  {
    nombreUsuario: 'fmuslera',
    nombre: 'Fernando',
    apellido: 'Muslera',
    fechaNacimiento: '1986-06-16',
    posicion: 'arquero',
    club: 'estudiantes-lp',
    descripcion:
      'Arquero de Estudiantes de La Plata. Nacido en Buenos Aires, internacional con Uruguay.',
    publicaciones: [
      {
        titulo: 'Noche en el UNO',
        mensaje:
          'Qué lindo ver la cancha así de llena. Gracias por acompañar siempre.',
        foto: 'estudiantes-lp',
      },
      {
        titulo: 'Trabajo de arqueros',
        mensaje:
          'Mañana de achiques, centros y pelotas paradas. Se entrena como se juega.',
      },
    ],
  },
  {
    nombreUsuario: 'hgalindez',
    nombre: 'Hernán',
    apellido: 'Galíndez',
    fechaNacimiento: '1987-03-30',
    posicion: 'arquero',
    club: 'huracan',
    descripcion: 'Arquero de Huracán. Rosarino, internacional con Ecuador.',
    publicaciones: [
      {
        titulo: 'El Palacio',
        mensaje:
          'Atajar en casa siempre es especial. Gracias a la gente por el aliento.',
        foto: 'huracan',
      },
      {
        titulo: 'Día de recuperación',
        mensaje:
          'Regenerativo, pileta y kinesiología. El cuerpo también juega.',
      },
    ],
  },
  {
    nombreUsuario: 'gmontiel',
    nombre: 'Gonzalo',
    apellido: 'Montiel',
    fechaNacimiento: '1997-01-01',
    posicion: 'defensor',
    club: 'river-plate',
    descripcion: 'Lateral derecho de River Plate.',
    publicaciones: [
      {
        titulo: 'Mañana de entrenamiento',
        mensaje: 'Mucha intensidad y trabajo de pelota parada. Vamos por más.',
      },
      {
        titulo: 'El Monumental',
        mensaje: 'No me canso de esta vista.',
        foto: 'river-plate',
      },
    ],
  },
  {
    nombreUsuario: 'lmagallan',
    nombre: 'Lisandro',
    apellido: 'Magallán',
    fechaNacimiento: '1993-09-27',
    posicion: 'defensor',
    club: 'velez-sarsfield',
    descripcion: 'Defensor central de Vélez Sarsfield.',
    publicaciones: [
      {
        titulo: 'Concentrados',
        mensaje: 'Partido a partido, con la cabeza en lo que viene.',
      },
      {
        titulo: 'El Amalfitani',
        mensaje: 'Se siente distinto cuando la tribuna empuja.',
        foto: 'velez-sarsfield',
      },
    ],
  },
  {
    nombreUsuario: 'lparedes',
    nombre: 'Leandro',
    apellido: 'Paredes',
    fechaNacimiento: '1994-06-29',
    posicion: 'mediocampista',
    club: 'boca-juniors',
    descripcion: 'Mediocampista de Boca Juniors.',
    publicaciones: [
      {
        titulo: 'La Bombonera',
        mensaje: 'Desde arriba también es hermosa.',
        foto: 'boca-juniors',
      },
      {
        titulo: 'Pelota al pie',
        mensaje:
          'Buena práctica hoy. Tener la pelota es la mejor forma de defenderse.',
      },
    ],
  },
  {
    nombreUsuario: 'lzelarayan',
    nombre: 'Lucas',
    apellido: 'Zelarayán',
    fechaNacimiento: '1992-06-20',
    posicion: 'mediocampista',
    club: 'belgrano',
    descripcion: 'Mediocampista de Belgrano.',
    publicaciones: [
      {
        titulo: 'Gigante de Alberdi',
        mensaje: 'Volver a casa siempre es lindo.',
        foto: 'belgrano',
      },
      {
        titulo: 'Semana de trabajo',
        mensaje: 'Buena semana con el grupo. Se viene un lindo partido.',
      },
      {
        titulo: 'Tiro libre',
        mensaje:
          'Hoy me quedé un rato más pateando. La práctica hace al maestro.',
        foto: 'pelota',
      },
    ],
  },
  {
    nombreUsuario: 'imalcorra',
    nombre: 'Ignacio',
    apellido: 'Malcorra',
    fechaNacimiento: '1987-07-24',
    posicion: 'mediocampista',
    club: 'union',
    descripcion: 'Mediocampista de Unión de Santa Fe.',
    publicaciones: [
      {
        titulo: '15 de Abril',
        mensaje: 'Así se vive el fútbol en Santa Fe.',
        foto: 'union',
      },
      {
        titulo: 'Doble turno',
        mensaje:
          'Mañana físico, tarde táctico. Las piernas lo sienten, la cabeza también.',
      },
    ],
  },
  {
    nombreUsuario: 'adimaria',
    nombre: 'Ángel',
    apellido: 'Di María',
    fechaNacimiento: '1988-02-14',
    posicion: 'delantero',
    club: 'rosario-central',
    descripcion: 'Delantero de Rosario Central.',
    publicaciones: [
      {
        titulo: 'El Gigante',
        mensaje: 'Qué lindo es verlo lleno.',
        foto: 'rosario-central',
      },
      {
        titulo: 'Gracias',
        mensaje:
          'Gracias por el cariño de siempre. A seguir disfrutando de cada partido.',
      },
    ],
  },
  {
    nombreUsuario: 'amartinez',
    nombre: 'Adrián',
    apellido: 'Martínez',
    fechaNacimiento: '1992-07-02',
    posicion: 'delantero',
    club: 'racing-club',
    descripcion: 'Delantero de Racing Club. Le dicen Maravilla.',
    publicaciones: [
      {
        titulo: 'Noche de Academia',
        mensaje: 'El Cilindro es una caldera.',
        foto: 'racing-club',
      },
      {
        titulo: 'A seguir',
        mensaje: 'Cada día un poco mejor. Gracias por los mensajes.',
      },
      {
        titulo: 'Definición',
        mensaje:
          'Práctica de definición: de primera, de cabeza y con la zurda también.',
        foto: 'cancha',
      },
    ],
  },
  {
    nombreUsuario: 'avombergar',
    nombre: 'Andrés',
    apellido: 'Vombergar',
    fechaNacimiento: '1994-11-20',
    posicion: 'delantero',
    club: 'aldosivi',
    descripcion: 'Delantero de Aldosivi.',
    publicaciones: [
      {
        titulo: 'Mar del Plata',
        mensaje: 'Jugar en el Minella es un lujo.',
        foto: 'aldosivi',
      },
      {
        titulo: 'Recuperando',
        mensaje: 'Semana de trabajo para estar al cien el fin de semana.',
      },
    ],
  },
];

export const COMENTARIOS = [
  '¡Vamos todavía!',
  'Qué lindo estadio.',
  'Fuerza para el fin de semana.',
  'Gran laburo, crack.',
  'Abrazo grande.',
  'A seguir así.',
  'Esa cancha es una locura.',
  'Buen entrenamiento.',
  'Se viene un gran partido.',
  'Qué buena foto.',
  'Mucha suerte en lo que viene.',
  'Grande, hermano.',
];
