import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BehaviorSubject, catchError, combineLatest, forkJoin, of, switchMap, tap } from 'rxjs';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
} from '../../core/models/estadisticas';
import { EstadisticasService, Rango } from '../../core/services/estadisticas.service';
import { mensajesDeError } from '../../core/utils/errores';
import {
  COLOR_RESALTADO,
  COLOR_RESTO,
  COLOR_SUPERFICIE,
  COLORES_SERIE,
  Grafico,
  LINEA_EJE,
  LINEA_GRILLA,
  lineaGuia,
  RELLENO_LINEA,
} from '../../shared/components/grafico';
import { PluralPipe } from '../../shared/pipes/plural.pipe';

const DIA = 24 * 60 * 60 * 1000;
/** Barras que entran en el gráfico de publicaciones por usuario; el resto queda en la tabla. */
const MAX_BARRAS = 15;
/** Publicaciones con porción propia en la torta (una por color); las demás se juntan en "Otras". */
const MAX_PORCIONES = COLORES_SERIE.length;

type Lapso = 7 | 30 | 90 | 'fechas';

interface Estadisticas {
  porUsuario: PublicacionesPorUsuario;
  porDia: ComentariosPorDia;
  porPublicacion: ComentariosPorPublicacion;
}

/** Una porción de la torta: una publicación o el resto juntas (sin id). */
interface Porcion {
  id: string | null;
  titulo: string;
  autor: string | null;
  cantidad: number;
  porcentaje: string;
  color: string;
}

const pluralizar = new PluralPipe();
// Las fechas de la API (AAAA-MM-DD) ya son días de Argentina: se leen en UTC para no correrlas un día.
const DIA_CORTO = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const DIA_LARGO = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});
const PORCENTAJE = new Intl.NumberFormat('es-AR', { style: 'percent', maximumFractionDigits: 0 });
const DECIMAL = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

const diaCorto = (fecha: string) => DIA_CORTO.format(new Date(`${fecha}T00:00:00Z`));
const diaLargo = (fecha: string) => DIA_LARGO.format(new Date(`${fecha}T00:00:00Z`));

/** La fecha de un input type="date" (AAAA-MM-DD) a las 0 h de ese día, en la hora local. */
function inicioDe(texto: string): Date {
  const [anio, mes, dia] = texto.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

/** Una fecha como la espera un input type="date". */
function textoDe(fecha: Date): string {
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

/** Hoy y los días anteriores hasta completar la cantidad pedida. */
function ultimosDias(dias: number): Rango {
  const hasta = new Date();
  const desde = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate() - (dias - 1));
  return { desde, hasta };
}

const sumar = (datos: { cantidad: number }[]) => datos.reduce((suma, d) => suma + d.cantidad, 0);

/**
 * Cada publicación que sigue entre las primeras al cambiar el lapso conserva su color, para que no
 * parezca otra; las que entran toman los colores que quedaron libres.
 */
function asignarColores(ids: string[], anteriores: ReadonlyMap<string, number>) {
  const colores = new Map<string, number>();
  for (const id of ids) {
    const color = anteriores.get(id);
    if (color !== undefined) colores.set(id, color);
  }
  const usados = new Set(colores.values());
  const libres = COLORES_SERIE.map((_, i) => i).filter((i) => !usados.has(i));
  for (const id of ids) if (!colores.has(id)) colores.set(id, libres.shift() ?? 0);
  return colores;
}

/** Dashboard de estadísticas (solo administradores): tres gráficos de distinto tipo para un mismo lapso. */
@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [Grafico, RouterLink, DatePipe, PluralPipe],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css',
})
export class DashboardEstadisticas {
  private readonly servicio = inject(EstadisticasService);
  private readonly recargar$ = new BehaviorSubject<void>(undefined);

  protected readonly lapsos: { valor: Lapso; texto: string }[] = [
    { valor: 7, texto: 'Últimos 7 días' },
    { valor: 30, texto: 'Últimos 30 días' },
    { valor: 90, texto: 'Últimos 90 días' },
    { valor: 'fechas', texto: 'Elegir fechas' },
  ];
  protected readonly maxBarras = MAX_BARRAS;
  protected readonly hoy = textoDe(new Date());

  protected readonly lapso = signal<Lapso>(30);
  /** El lapso de los datos que se piden: cambia al tocar un lapso o al aplicar las fechas elegidas. */
  protected readonly rango = signal<Rango>(ultimosDias(30));
  protected readonly desde = signal(textoDe(ultimosDias(30).desde));
  protected readonly hasta = signal(this.hoy);
  protected readonly errorFechas = signal<string | null>(null);

  protected readonly datos = signal<Estadisticas | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string[] | null>(null);
  /** Color (posición en COLORES_SERIE) de cada publicación con porción propia en la torta. */
  private readonly colores = signal<ReadonlyMap<string, number>>(new Map());

  /** Qué tarjetas muestran la tabla en lugar del gráfico. */
  protected readonly tabla = {
    usuarios: signal(false),
    dias: signal(false),
    publicaciones: signal(false),
  };

  protected readonly totalPublicaciones = computed(() =>
    sumar(this.datos()?.porUsuario.datos ?? []),
  );

  /** Barras horizontales, de quien más publicó a quien menos. */
  protected readonly barras = computed(() => {
    const datos = this.datos()?.porUsuario.datos.slice(0, MAX_BARRAS) ?? [];
    if (!datos.length) return null;
    const [primero] = datos;
    const configuracion: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: datos.map(({ usuario }) => `${usuario.nombre} ${usuario.apellido}`),
        datasets: [
          {
            data: datos.map((d) => d.cantidad),
            backgroundColor: COLORES_SERIE[0],
            hoverBackgroundColor: COLOR_RESALTADO,
            borderRadius: 4,
            borderSkipped: 'start',
            maxBarThickness: 18,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        // La ayuda aparece con el puntero en cualquier parte de la fila, no solo sobre la barra.
        interaction: { mode: 'index', axis: 'y', intersect: false },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: LINEA_GRILLA },
            border: { display: false },
          },
          y: { grid: { display: false }, border: { color: LINEA_EJE } },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: ([item]) => `${item.label} · @${datos[item.dataIndex].usuario.nombreUsuario}`,
              label: (item) =>
                pluralizar.transform(item.parsed.x ?? 0, 'publicación', 'publicaciones'),
            },
          },
        },
      },
    };
    return {
      configuracion,
      alto: datos.length * 32 + 40,
      descripcion: `Gráfico de barras de las publicaciones por usuario. Publicó más ${primero.usuario.nombre} ${primero.usuario.apellido}, con ${primero.cantidad}.`,
    };
  });

  /** Total, promedio y el día con más comentarios del lapso. */
  protected readonly resumenDias = computed(() => {
    const porDia = this.datos()?.porDia;
    if (!porDia?.datos.length) return null;
    const maximo = porDia.datos.reduce((max, d) => (d.cantidad > max.cantidad ? d : max));
    return {
      total: porDia.total,
      promedio: DECIMAL.format(porDia.total / porDia.datos.length),
      maximo: { cantidad: maximo.cantidad, dia: diaLargo(maximo.fecha) },
    };
  });

  /** Una línea con un punto por día, también los días sin comentarios. */
  protected readonly linea = computed(() => {
    const porDia = this.datos()?.porDia;
    const resumen = this.resumenDias();
    if (!porDia?.total || !resumen) return null;
    const configuracion: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: porDia.datos.map((d) => diaCorto(d.fecha)),
        datasets: [
          {
            data: porDia.datos.map((d) => d.cantidad),
            borderColor: COLORES_SERIE[0],
            backgroundColor: RELLENO_LINEA,
            fill: 'origin',
            borderWidth: 2,
            borderJoinStyle: 'round',
            borderCapStyle: 'round',
            pointRadius: 0,
            pointHitRadius: 12,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointHoverBackgroundColor: COLORES_SERIE[0],
            pointHoverBorderColor: COLOR_SUPERFICIE,
          },
        ],
      },
      options: {
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            grid: { display: false },
            border: { color: LINEA_EJE },
            ticks: { maxRotation: 0, autoSkipPadding: 18 },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: LINEA_GRILLA },
            border: { display: false },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: ([item]) => diaLargo(porDia.datos[item.dataIndex].fecha),
              label: (item) => pluralizar.transform(item.parsed.y ?? 0, 'comentario'),
            },
          },
        },
      },
      plugins: [lineaGuia],
    };
    return {
      configuracion,
      descripcion: `Gráfico de líneas de los comentarios por día: ${pluralizar.transform(resumen.total, 'comentario')} en el lapso; el día con más fue el ${resumen.maximo.dia}, con ${resumen.maximo.cantidad}.`,
    };
  });

  /** Torta con las publicaciones más comentadas y el resto juntas, más la leyenda con los números. */
  protected readonly torta = computed(() => {
    const datos = this.datos()?.porPublicacion.datos ?? [];
    if (!datos.length) return null;
    const colores = this.colores();
    const total = sumar(datos);
    const porcentaje = (cantidad: number) => PORCENTAJE.format(cantidad / total);
    const porciones: Porcion[] = datos.slice(0, MAX_PORCIONES).map(({ publicacion, cantidad }) => ({
      ...publicacion,
      cantidad,
      porcentaje: porcentaje(cantidad),
      color: COLORES_SERIE[colores.get(publicacion.id) ?? 0],
    }));
    const resto = datos.slice(MAX_PORCIONES);
    if (resto.length) {
      const cantidad = sumar(resto);
      porciones.push({
        id: null,
        titulo: resto.length === 1 ? 'Otra publicación' : `Otras ${resto.length} publicaciones`,
        autor: null,
        cantidad,
        porcentaje: porcentaje(cantidad),
        color: COLOR_RESTO,
      });
    }
    const configuracion: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: porciones.map((p) => p.titulo),
        datasets: [
          {
            data: porciones.map((p) => p.cantidad),
            backgroundColor: porciones.map((p) => p.color),
            hoverBackgroundColor: porciones.map((p) => p.color),
            // El borde del color de la tarjeta deja una separación entre porciones.
            borderColor: COLOR_SUPERFICIE,
            hoverBorderColor: COLOR_SUPERFICIE,
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        cutout: '64%',
        layout: { padding: 8 },
        plugins: {
          tooltip: {
            callbacks: {
              title: ([item]) => item.label,
              label: (item) =>
                `${pluralizar.transform(item.parsed, 'comentario')} · ${porcentaje(item.parsed)}`,
            },
          },
        },
      },
    };
    const [primera] = porciones;
    return {
      total,
      porciones,
      configuracion,
      descripcion: `Gráfico de torta de los comentarios por publicación: ${pluralizar.transform(total, 'comentario')}; la más comentada es «${primera.titulo}», con ${primera.cantidad} (${primera.porcentaje}).`,
    };
  });

  /** Todas las publicaciones comentadas, con su parte del total, para la tabla de la torta. */
  protected readonly filasPublicaciones = computed(() => {
    const datos = this.datos()?.porPublicacion.datos ?? [];
    const total = sumar(datos);
    return datos.map((d) => ({ ...d, porcentaje: PORCENTAJE.format(d.cantidad / total) }));
  });

  protected readonly filasDias = computed(() =>
    (this.datos()?.porDia.datos ?? []).map((d) => ({ ...d, dia: diaLargo(d.fecha) })),
  );

  constructor() {
    // Las tres estadísticas se piden juntas para el mismo lapso. Mientras llegan los datos nuevos, los
    // gráficos siguen mostrando los anteriores (atenuados) en lugar de desaparecer.
    combineLatest([toObservable(this.rango), this.recargar$])
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap(([rango]) =>
          forkJoin({
            porUsuario: this.servicio.publicacionesPorUsuario(rango),
            porDia: this.servicio.comentariosPorDia(rango),
            porPublicacion: this.servicio.comentariosPorPublicacion(rango),
          }).pipe(
            catchError((error: unknown) => {
              this.error.set(mensajesDeError(error));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((estadisticas) => {
        this.cargando.set(false);
        if (!estadisticas) return;
        const primeras = estadisticas.porPublicacion.datos
          .slice(0, MAX_PORCIONES)
          .map((d) => d.publicacion.id);
        this.colores.update((anteriores) => asignarColores(primeras, anteriores));
        this.datos.set(estadisticas);
      });
  }

  protected recargar(): void {
    this.recargar$.next();
  }

  protected elegirLapso(lapso: Lapso): void {
    this.lapso.set(lapso);
    this.errorFechas.set(null);
    if (lapso !== 'fechas') this.rango.set(ultimosDias(lapso));
  }

  protected cambiarFecha(campo: 'desde' | 'hasta', evento: Event): void {
    this[campo].set((evento.target as HTMLInputElement).value);
    this.errorFechas.set(null);
  }

  /** Valida las fechas elegidas (las mismas reglas que la API) y pide los datos de ese lapso. */
  protected aplicarFechas(evento: Event): void {
    evento.preventDefault();
    if (!this.desde() || !this.hasta()) {
      this.errorFechas.set('Elegí las dos fechas.');
      return;
    }
    const desde = inicioDe(this.desde());
    const finDelDia = inicioDe(this.hasta());
    finDelDia.setDate(finDelDia.getDate() + 1);
    const hasta = new Date(finDelDia.getTime() - 1);
    if (desde > hasta) {
      this.errorFechas.set('La fecha "desde" no puede ser posterior a "hasta".');
    } else if (hasta.getTime() - desde.getTime() > 366 * DIA) {
      this.errorFechas.set('El lapso no puede superar un año.');
    } else {
      this.rango.set({ desde, hasta });
    }
  }
}
