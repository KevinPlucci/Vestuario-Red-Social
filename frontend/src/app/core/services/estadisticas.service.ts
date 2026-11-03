import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
} from '../models/estadisticas';

/** Lapso de tiempo de las estadísticas, en instantes exactos. */
export interface Rango {
  desde: Date;
  hasta: Date;
}

/** Datos de los gráficos del dashboard (solo administradores). */
@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(rango: Rango): Observable<PublicacionesPorUsuario> {
    return this.pedir('publicaciones-por-usuario', rango);
  }

  comentariosPorDia(rango: Rango): Observable<ComentariosPorDia> {
    return this.pedir('comentarios-por-dia', rango);
  }

  comentariosPorPublicacion(rango: Rango): Observable<ComentariosPorPublicacion> {
    return this.pedir('comentarios-por-publicacion', rango);
  }

  private pedir<T>(ruta: string, { desde, hasta }: Rango): Observable<T> {
    const params = new HttpParams()
      .set('desde', desde.toISOString())
      .set('hasta', hasta.toISOString());
    return this.http.get<T>(`${this.url}/${ruta}`, { params });
  }
}
