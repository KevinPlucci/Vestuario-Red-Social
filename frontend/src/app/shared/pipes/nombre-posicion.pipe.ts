import { Pipe, PipeTransform } from '@angular/core';
import { NOMBRES_POSICION, Posicion } from '../../core/models/usuario';

/** El valor que guarda la API, como se muestra: 'delantero' → "Delantero". */
@Pipe({ name: 'nombrePosicion' })
export class NombrePosicionPipe implements PipeTransform {
  transform(posicion: Posicion | null | undefined): string {
    return posicion ? NOMBRES_POSICION[posicion] : 'Sin indicar';
  }
}
