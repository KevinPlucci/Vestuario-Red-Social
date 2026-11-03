// Generado a partir de los créditos de las imágenes (Wikimedia Commons). Ver /creditos en la aplicación.

/** Autor, licencia y página de origen de una imagen. */
export interface Credito {
  autor: string;
  licencia: string;
  fuente: string;
}

/** Uno de los 30 clubes de la Liga Profesional 2026, con su estadio y los créditos de sus imágenes. */
export interface Club {
  id: string;
  nombre: string;
  estadio: string;
  /** Foto del estadio (public/estadios/<id>.jpg); null si no hay una con licencia libre. */
  foto: Credito | null;
  escudo: Credito;
}

export const CLUBES: Club[] = [
  {
    id: 'aldosivi',
    nombre: 'Aldosivi',
    estadio: 'Estadio José María Minella',
    foto: {
      autor: 'Nachomdqcor',
      licencia: 'CC BY-SA 3.0',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Jos%C3%A9-Mar%C3%ADa-Minella-Stadium_present.JPG',
    },
    escudo: {
      autor: 'Desconocido',
      licencia: 'Fair use',
      fuente: 'https://en.wikipedia.org/wiki/File:Aldosivi_logo.svg',
    },
  },
  {
    id: 'argentinos-juniors',
    nombre: 'Argentinos Juniors',
    estadio: 'Estadio Diego Armando Maradona',
    foto: {
      autor: 'https://www.flickr.com/photos/yonolatengo/5546734895/',
      licencia: 'CC BY 2.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Argentinos_Juniors_Stadium.jpg',
    },
    escudo: {
      autor: 'Asociación Atlética Argentinos Juniors',
      licencia: 'Public domain',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Asociaci%C3%B3n_Atl%C3%A9tica_Argentinos_Juniors_logo.svg',
    },
  },
  {
    id: 'atletico-tucuman',
    nombre: 'Atlético Tucumán',
    estadio: 'Estadio Monumental José Fierro',
    foto: {
      autor: 'Jmmuguerza',
      licencia: 'CC BY-SA 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estadio_Monumental_Jos%C3%A9_Fierro_01.jpg',
    },
    escudo: {
      autor: 'Club Atlético Tucumán',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Atletico_tucuman_nuevo2.svg',
    },
  },
  {
    id: 'banfield',
    nombre: 'Banfield',
    estadio: 'Estadio Florencio Sola',
    foto: {
      autor: 'Vincenzo.togni',
      licencia: 'CC BY 4.0',
      fuente:
        'https://commons.wikimedia.org/wiki/File:The_Estadio_Florencio_Sola_during_a_match_between_Banfield_and_Platense_(2023).jpg',
    },
    escudo: {
      autor: 'Club Atlético Banfield',
      licencia: 'CC BY-SA 3.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Banfield_2022.png',
    },
  },
  {
    id: 'barracas-central',
    nombre: 'Barracas Central',
    estadio: 'Estadio Claudio Chiqui Tapia',
    foto: {
      autor: 'Unknown',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estadio_barracas_central_1922.jpg',
    },
    escudo: {
      autor: 'DesconocidoUnknown author',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Barracas_central_logo.svg',
    },
  },
  {
    id: 'belgrano',
    nombre: 'Belgrano',
    estadio: 'Estadio Julio César Villagra',
    foto: {
      autor: 'TheProxy18',
      licencia: 'CC BY-SA 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Gigante_de_alberdi.jpg',
    },
    escudo: {
      autor: 'DesconocidoUnknown author (presumably for Club Atlético Belgrano)',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Club_Atl%C3%A9tico_Belgrano_2026.svg',
    },
  },
  {
    id: 'boca-juniors',
    nombre: 'Boca Juniors',
    estadio: 'Estadio Alberto J. Armando (La Bombonera)',
    foto: {
      autor: 'ProtoplasmaKid',
      licencia: 'CC BY-SA 4.0',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Vista_a%C3%A9rea_del_Estadio_Alberto_J._Armando_%22La_Bombonera%22_01.jpg',
    },
    escudo: {
      autor: 'Club Atlético Boca Juniors',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Boca_Juniors_logo_2026.svg',
    },
  },
  {
    id: 'central-cordoba',
    nombre: 'Central Córdoba (SdE)',
    estadio: 'Estadio Único Madre de Ciudades',
    foto: {
      autor: 'Gergas',
      licencia: 'CC BY-SA 4.0',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Estadio_%C3%9Anico_Madre_de_Ciudades_(Este).jpg',
    },
    escudo: {
      autor: 'DesconocidoUnknown author',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Central_Cordoba_SdE_crest_(2025).svg',
    },
  },
  {
    id: 'defensa-y-justicia',
    nombre: 'Defensa y Justicia',
    estadio: 'Estadio Norberto Tito Tomaghello',
    foto: {
      autor: 'Ignacio Her11',
      licencia: 'CC BY-SA 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Norberto_Tomaghello.jpg',
    },
    escudo: {
      autor: 'Defensa y Justicia',
      licencia: 'Public domain',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Social_y_Deportivo_Defensa_y_Justicia.svg',
    },
  },
  {
    id: 'deportivo-riestra',
    nombre: 'Deportivo Riestra',
    estadio: 'Estadio Guillermo Laza',
    foto: null,
    escudo: {
      autor: 'DesconocidoUnknown author',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Deportivo_Riestra.svg',
    },
  },
  {
    id: 'estudiantes-lp',
    nombre: 'Estudiantes (LP)',
    estadio: 'Estadio Jorge Luis Hirschi',
    foto: {
      autor: 'Germanramos2',
      licencia: 'CC BY-SA 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:UNO_20220614_210130.jpg',
    },
    escudo: {
      autor: 'DesconocidoUnknown author',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estudiantes_de_la_Plata_crest_(2025).svg',
    },
  },
  {
    id: 'estudiantes-rc',
    nombre: 'Estudiantes (RC)',
    estadio: 'Estadio Antonio Candini',
    foto: {
      autor: 'AtlasFederal',
      licencia: 'CC0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estadio_Candini.png',
    },
    escudo: {
      autor: 'Marcelo Lopez Tobares',
      licencia: 'Public domain',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Escudo_Asociacion_Atl%C3%A9tica_Estudiantes_de_R%C3%ADo_Cuarto.svg',
    },
  },
  {
    id: 'gimnasia-lp',
    nombre: 'Gimnasia (LP)',
    estadio: 'Estadio Juan Carmelo Zerillo',
    foto: {
      autor: 'Gelpgim22 (Sergio Moises Panei Pitrau)',
      licencia: 'CC BY-SA 4.0',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Museo_Tripero_-_Estadio_Juan_Carmelo_Zerillo._31.JPG',
    },
    escudo: {
      autor: 'Emilio Coutaret',
      licencia: 'Public domain',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_de_Gimnasia_y_Esgrima_La_Plata_(v2026).svg',
    },
  },
  {
    id: 'gimnasia-mendoza',
    nombre: 'Gimnasia (Mendoza)',
    estadio: 'Estadio Víctor Antonio Legrotaglie',
    foto: {
      autor: "Ozaru's Photos (Iván Aguilar)",
      licencia: 'CC BY-SA 4.0',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Panor%C3%A1mica_lateral_del_Estadio_V%C3%ADctor_Legrotaglie_(2017).jpg',
    },
    escudo: {
      autor: 'Unknown (Vector graphics image by Trandos)',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Escudo_Club_Gimnasia_y_Esgrima_Mendoza.svg',
    },
  },
  {
    id: 'huracan',
    nombre: 'Huracán',
    estadio: 'Estadio Tomás Adolfo Ducó',
    foto: {
      autor: 'Unknown',
      licencia: 'CC BY 2.5 ar',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estadio_duco_huracan.jpg',
    },
    escudo: {
      autor: 'Club Atlético Huracán',
      licencia: 'CC BY-SA 4.0',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Emblema_oficial_del_Club_Atl%C3%A9tico_Hurac%C3%A1n.svg',
    },
  },
  {
    id: 'independiente',
    nombre: 'Independiente',
    estadio: 'Estadio Libertadores de América',
    foto: {
      autor: 'AlexRojo93',
      licencia: 'CC BY-SA 3.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estadio_Libertadores_de_America_2014.JPG',
    },
    escudo: {
      autor: 'Club Atlético Independiente',
      licencia: 'Public domain',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_Independiente.svg',
    },
  },
  {
    id: 'independiente-rivadavia',
    nombre: 'Independiente Rivadavia',
    estadio: 'Estadio Bautista Gargantini',
    foto: {
      autor: 'Gonce',
      licencia: 'CC BY-SA 3.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:UNCUECO_24.JPG',
    },
    escudo: {
      autor: 'Unknown (Vector graphics by Trandos)',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Independiente_Rivadavia.svg',
    },
  },
  {
    id: 'instituto',
    nombre: 'Instituto',
    estadio: 'Estadio Juan Domingo Perón',
    foto: {
      autor: 'Javier Zengaro',
      licencia: 'CC BY-SA 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estadio_alta_cordoba_cropped.jpg',
    },
    escudo: {
      autor: 'Instituto Alético Central Córdoba',
      licencia: 'CC BY-SA 4.0',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Escudo_Instituto_Atletico_Central_Cordoba.png',
    },
  },
  {
    id: 'lanus',
    nombre: 'Lanús',
    estadio: 'Estadio Ciudad de Lanús',
    foto: {
      autor: '1915CAL',
      licencia: 'CC BY 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Hinchada_del_Club_Lan%C3%BAs.jpg',
    },
    escudo: {
      autor: 'DesconocidoUnknown author',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Escudo_de_Lan%C3%BAs_(sin_estrellas).svg',
    },
  },
  {
    id: 'newells',
    nombre: "Newell's Old Boys",
    estadio: 'Estadio Marcelo Bielsa',
    foto: {
      autor: 'Juanmanob',
      licencia: 'CC0',
      fuente: 'https://commons.wikimedia.org/wiki/File:ColosoDelParque.jpg',
    },
    escudo: {
      autor: 'Estudio Shakespear',
      licencia: 'Public domain',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_Newell%27s_Old_Boys_de_Rosario.svg',
    },
  },
  {
    id: 'platense',
    nombre: 'Platense',
    estadio: 'Estadio Ciudad de Vicente López',
    foto: {
      autor: 'Fernando Martello',
      licencia: 'CC BY-SA 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estadio_de_platense_tribuna_y_campo.jpg',
    },
    escudo: {
      autor: 'DesconocidoUnknown author',
      licencia: 'Public domain',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Club_Alt%C3%A9tico_Platense_crest_(2025).svg',
    },
  },
  {
    id: 'racing-club',
    nombre: 'Racing Club',
    estadio: 'Estadio Presidente Perón (El Cilindro)',
    foto: {
      autor: 'Sentencia Gráfica Estudio',
      licencia: 'CC0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estadio_Presidente_Peron.jpg',
    },
    escudo: {
      autor: 'Racing Club de Avellaneda',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Escudo_de_Racing_Club_(2014).svg',
    },
  },
  {
    id: 'river-plate',
    nombre: 'River Plate',
    estadio: 'Estadio Monumental',
    foto: {
      autor: 'Dibumartinez23',
      licencia: 'CC0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estadio_mas_monumental.jpg',
    },
    escudo: {
      autor: 'Club Atlético River Plate',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Club_Atl%C3%A9tico_River_Plate_logo.svg',
    },
  },
  {
    id: 'rosario-central',
    nombre: 'Rosario Central',
    estadio: 'Estadio Gigante de Arroyito',
    foto: {
      autor: 'Rodrigo Accurcio from São Paulo, Brasil',
      licencia: 'CC BY 2.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:2009_Argentina-Brasil_en_el_Gigante.jpg',
    },
    escudo: {
      autor: 'DesconocidoUnknown author',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Escudo_Rosario_Central.png',
    },
  },
  {
    id: 'san-lorenzo',
    nombre: 'San Lorenzo',
    estadio: 'Estadio Pedro Bidegain',
    foto: {
      autor: 'Nicocuervo95',
      licencia: 'CC BY-SA 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Platea_Este_Nuevo_Gasometro_1.jpg',
    },
    escudo: {
      autor: 'Unknown (Vector graphics by Trandos)',
      licencia: 'Public domain',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_San_Lorenzo_de_Almagro.svg',
    },
  },
  {
    id: 'sarmiento',
    nombre: 'Sarmiento (Junín)',
    estadio: 'Estadio Eva Perón',
    foto: {
      autor: 'Paolazaccardi',
      licencia: 'CC0',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Estadio_Eva_Peron_Club_Sarmiento_de_Junin_2.jpg',
    },
    escudo: {
      autor: 'Club Atlético Sarmiento',
      licencia: 'Public domain',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_Sarmiento_de_Jun%C3%ADn.svg',
    },
  },
  {
    id: 'talleres',
    nombre: 'Talleres (Córdoba)',
    estadio: 'Estadio Mario Alberto Kempes',
    foto: {
      autor: 'Alepizarro32',
      licencia: 'CC BY-SA 4.0',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Estadio_Mario_Alberto_Kempes_en_el_entretiempo_de_Belgrano_-_River.jpg',
    },
    escudo: {
      autor: 'Talleres',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Escudo_Talleres_2015.svg',
    },
  },
  {
    id: 'tigre',
    nombre: 'Tigre',
    estadio: 'Estadio José Dellagiovanna',
    foto: {
      autor: 'DesconocidoUnknown author',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Tigre_estadio_tribuna_peron.jpg',
    },
    escudo: {
      autor: 'Unknown (Vector graphics image by Trandos)',
      licencia: 'Public domain',
      fuente: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_Tigre.svg',
    },
  },
  {
    id: 'union',
    nombre: 'Unión (Santa Fe)',
    estadio: 'Estadio 15 de Abril',
    foto: {
      autor: 'TitiNicola',
      licencia: 'CC BY-SA 4.0',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Estadio_15_de_Abril_-_Club_Atl%C3%A9tico_Uni%C3%B3n_de_Santa_Fe_-_30.jpg',
    },
    escudo: {
      autor: 'Club Atlético Uniónm de Santa Fe',
      licencia: 'Public domain',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Escudo_club_Atl%C3%A9tico_Uni%C3%B3n_de_santa_fe.svg',
    },
  },
  {
    id: 'velez-sarsfield',
    nombre: 'Vélez Sarsfield',
    estadio: 'Estadio José Amalfitani',
    foto: {
      autor: 'Gonzabar77',
      licencia: 'CC0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estadio_Jos%C3%A9_Amalfitani_2024.jpg',
    },
    escudo: {
      autor: 'Trandos',
      licencia: 'Public domain',
      fuente:
        'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_V%C3%A9lez_Sarsfield.svg',
    },
  },
];

const POR_ID = new Map(CLUBES.map((club) => [club.id, club]));

/** Datos del club a partir del identificador que guarda la API; null si no tiene o no es de la lista. */
export const datosClub = (id: string | null | undefined): Club | null =>
  (id && POR_ID.get(id)) || null;

/** Cancha dibujada: el fondo de quien no tiene club o de los clubes sin foto del estadio. */
export const FONDO_CANCHA = '/fondos/cancha.svg';

export const escudoDe = (club: Club) => `/escudos/${club.id}.png`;

export const fondoDe = (club: Club | null) =>
  club?.foto ? `/estadios/${club.id}.jpg` : FONDO_CANCHA;
