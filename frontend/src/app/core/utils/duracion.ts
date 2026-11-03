/** Una duración en minutos o, si no llega a uno, en segundos: "15 minutos", "1 minuto", "10 segundos". */
export function textoDuracion(ms: number): string {
  const [cantidad, unidad] =
    ms >= 60_000
      ? [Math.round(ms / 60_000), 'minuto']
      : [Math.max(1, Math.round(ms / 1000)), 'segundo'];
  return `${cantidad} ${unidad}${cantidad === 1 ? '' : 's'}`;
}
