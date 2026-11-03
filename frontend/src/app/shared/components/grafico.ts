import {
  afterRenderEffect,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartType,
  DoughnutController,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  Plugin,
  PointElement,
  Tooltip,
} from 'chart.js';

// Solo las piezas de Chart.js que usan los gráficos del dashboard: el resto no entra en el paquete.
Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Filler,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
);

/**
 * Colores de las series: el verde de Vestuario y tres más. Se validaron para daltonismo (protanopía y
 * deuteranopía) comparando todos los pares, así que dos porciones de la torta se distinguen estén donde estén.
 */
export const COLORES_SERIE = ['#1a7a3a', '#2a78d6', '#eda100', '#e87ba4'];
/** La porción que junta el resto ("Otras"): un gris que no compite con los colores. */
export const COLOR_RESTO = '#c3c2b7';
/** El verde con el que se marca la barra o el punto que está bajo el puntero. */
export const COLOR_RESALTADO = '#135c2b';
/** El fondo de las tarjetas: separa las porciones de la torta y rodea los puntos. */
export const COLOR_SUPERFICIE = '#ffffff';
/** El relleno debajo de la línea: el mismo verde, casi transparente. */
export const RELLENO_LINEA = 'rgba(26, 122, 58, 0.1)';

const TINTA = '#1f2328';
const TINTA_SUAVE = '#5f6770';
export const LINEA_GRILLA = '#e6e9ed';
export const LINEA_EJE = '#c3c8ce';

// Estilo común: la letra de la página, textos en los grises de la página y una ayuda (tooltip) clara
// con el valor en negrita y el nombre arriba, más chico.
Chart.defaults.font.family = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
Chart.defaults.color = TINTA_SUAVE;
Chart.defaults.borderColor = LINEA_GRILLA;
Chart.defaults.maintainAspectRatio = false;
Object.assign(Chart.defaults.plugins.tooltip, {
  backgroundColor: COLOR_SUPERFICIE,
  borderColor: LINEA_EJE,
  borderWidth: 1,
  titleColor: TINTA_SUAVE,
  titleFont: { size: 12, weight: 'normal' },
  bodyColor: TINTA,
  bodyFont: { size: 14, weight: 'bold' },
  padding: 10,
  cornerRadius: 8,
  caretPadding: 6,
  displayColors: false,
});
if (matchMedia('(prefers-reduced-motion: reduce)').matches) Chart.defaults.animation = false;

/** Línea vertical finita que sigue al puntero en el gráfico de líneas y marca el día que se lee. */
export const lineaGuia: Plugin<'line'> = {
  id: 'lineaGuia',
  beforeDatasetsDraw(grafico) {
    const [activo] = grafico.tooltip?.getActiveElements() ?? [];
    if (!activo) return;
    const { ctx, chartArea } = grafico;
    const x = Math.round(activo.element.x) + 0.5;
    ctx.save();
    ctx.strokeStyle = LINEA_EJE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  },
};

/**
 * Lienzo de Chart.js. Crea el gráfico con la configuración que recibe y, cuando cambia, lo actualiza
 * con animación en lugar de rearmarlo. Para un lector de pantalla es una imagen con la descripción;
 * los valores completos están en la tabla "Ver datos" de cada tarjeta.
 */
@Component({
  selector: 'app-grafico',
  template: `<canvas #lienzo role="img" [attr.aria-label]="descripcion()"></canvas>`,
  host: { '[style.height.px]': 'alto()' },
  styles: `
    :host {
      position: relative;
      display: block;
    }
  `,
})
export class Grafico<T extends ChartType = ChartType> {
  readonly configuracion = input.required<ChartConfiguration<T>>();
  readonly descripcion = input.required<string>();
  readonly alto = input(280);

  private readonly lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico?: Chart<T>;

  constructor() {
    // Después de que Angular pinta la vista: el lienzo ya existe y tiene tamaño.
    afterRenderEffect(() => {
      const configuracion = this.configuracion();
      if (!this.grafico) {
        this.grafico = new Chart(this.lienzo().nativeElement, configuracion);
        return;
      }
      this.grafico.data = configuracion.data;
      if (configuracion.options) this.grafico.options = configuracion.options;
      this.grafico.update();
    });
    inject(DestroyRef).onDestroy(() => this.grafico?.destroy());
  }
}
