import { DatePipe } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/**
 * Cuánto pasó desde una fecha: "recién", "hace 5 min", "hace 3 h", "ayer", "hace 4 días" y, de una
 * semana en adelante, la fecha ("12 oct 2026"). Es pura: se calcula al mostrarse, no se actualiza sola.
 */
@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  private readonly fecha = new DatePipe(inject(LOCALE_ID));

  transform(valor: string | Date | null | undefined, ahora = Date.now()): string {
    if (!valor) return '';
    const momento = new Date(valor).getTime();
    const pasado = Math.max(0, ahora - momento);
    if (pasado < MINUTO) return 'recién';
    if (pasado < HORA) return `hace ${Math.floor(pasado / MINUTO)} min`;
    if (pasado < DIA) return `hace ${Math.floor(pasado / HORA)} h`;
    const dias = Math.floor(pasado / DIA);
    if (dias === 1) return 'ayer';
    if (dias < 7) return `hace ${dias} días`;
    return this.fecha.transform(momento, 'd MMM y') ?? '';
  }
}
