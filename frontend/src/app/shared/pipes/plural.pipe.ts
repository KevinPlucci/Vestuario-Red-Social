import { Pipe, PipeTransform } from '@angular/core';

/**
 * Una cantidad con la palabra en singular o en plural: {{ 1 | plural: 'comentario' }} → "1 comentario",
 * {{ 8 | plural: 'comentario' }} → "8 comentarios". El plural se puede indicar si no termina en "s".
 */
@Pipe({ name: 'plural' })
export class PluralPipe implements PipeTransform {
  transform(cantidad: number, singular: string, plural = `${singular}s`): string {
    return `${cantidad} ${cantidad === 1 ? singular : plural}`;
  }
}
