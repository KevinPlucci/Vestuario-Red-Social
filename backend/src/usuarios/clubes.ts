/**
 * Los 30 clubes de la Liga Profesional de Fútbol 2026, por su identificador. Se guarda el
 * identificador; el front tiene el nombre, el escudo y la foto del estadio de cada uno.
 */
export const CLUBES = [
  'aldosivi',
  'argentinos-juniors',
  'atletico-tucuman',
  'banfield',
  'barracas-central',
  'belgrano',
  'boca-juniors',
  'central-cordoba',
  'defensa-y-justicia',
  'deportivo-riestra',
  'estudiantes-lp',
  'estudiantes-rc',
  'gimnasia-lp',
  'gimnasia-mendoza',
  'huracan',
  'independiente',
  'independiente-rivadavia',
  'instituto',
  'lanus',
  'newells',
  'platense',
  'racing-club',
  'river-plate',
  'rosario-central',
  'san-lorenzo',
  'sarmiento',
  'talleres',
  'tigre',
  'union',
  'velez-sarsfield',
] as const;
export type Club = (typeof CLUBES)[number];
