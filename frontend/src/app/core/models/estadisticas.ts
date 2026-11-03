/** Lapso de las estadísticas que devolvió la API (fechas ISO). */
interface Lapso {
  desde: string;
  hasta: string;
}

export interface PublicacionesPorUsuario extends Lapso {
  datos: {
    usuario: { id: string; nombre: string; apellido: string; nombreUsuario: string };
    cantidad: number;
  }[];
}

export interface ComentariosPorDia extends Lapso {
  total: number;
  /** Un elemento por día del lapso (AAAA-MM-DD), también los que no tuvieron comentarios. */
  datos: { fecha: string; cantidad: number }[];
}

export interface ComentariosPorPublicacion extends Lapso {
  datos: { publicacion: { id: string; titulo: string; autor: string }; cantidad: number }[];
}
