import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario';

export interface ListadoUsuarios {
  usuarios: Usuario[];
  total: number;
  offset: number;
  limit: number;
}

/** Dashboard de usuarios (solo administradores): listar, crear y dar de baja o de alta. */
@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/usuarios`;

  listar(filtro: { buscar?: string; offset: number; limit: number }): Observable<ListadoUsuarios> {
    let params = new HttpParams().set('offset', filtro.offset).set('limit', filtro.limit);
    if (filtro.buscar) params = params.set('buscar', filtro.buscar);
    return this.http.get<ListadoUsuarios>(this.url, { params });
  }

  /** Recibe un FormData con los datos del registro, el perfil elegido y la imagen. */
  crear(datos: FormData): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, datos);
  }

  deshabilitar(id: string): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.url}/${id}`);
  }

  habilitar(id: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.url}/${id}/habilitar`, null);
  }
}
