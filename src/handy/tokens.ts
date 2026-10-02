/* Tokens de marca de Handy, compartidos por los tráileres de la app de usuario y la del especialista.
   Los mismos valores existen como variables CSS (--hd-*) en css/base.css: si cambiás uno, cambiá los dos.
   Colores medidos en las piezas originales (handy-png/): se ajustaron los que difieren a simple vista (ΔE2000 > 2)
   de la aproximación del brief; los demás quedan como estaban. */

export const COLORS = {
  /** azul principal: logo, títulos, botones primarios, barra inferior (logo y pantallas: #1E57A6, ΔE 0,3) */
  azul: '#1F57A8',
  /** azul claro de la interfaz: hojas, tarjetas, botones secundarios (medido en las pantallas; el brief decía #4A72B0) */
  azulClaro: '#496EA2',
  /** azul de los personajes: relleno del engranaje (medido; el brief decía #2F6BFF) */
  azulHandy: '#3071FF',
  /** fondo gris de las láminas y del escenario (del brief: las fotos originales no están en el repo) */
  gris: '#CFCFCF',
  /** fichas de la grilla de inicio (pantalla-inicio: #EEEEEE, ΔE 0,2) */
  grisFicha: '#EDEDED',
  /** amarillo de la lamparita (medido; el brief decía #F5F59A) */
  amarillo: '#F8FFA0',
  /** amarillo de alerta: triángulo del botón de urgencia (medido #FFC100, ΔE 1) */
  amarilloAlerta: '#FFC21A',
  blanco: '#FFFFFF',
  /** texto principal sobre claro */
  tinta: '#141414',
  /** texto secundario sobre claro */
  tintaSuave: '#5C5C5C',
  /** confirmaciones */
  verde: '#1FA855',
  /** acciones destructivas */
  rojo: '#E5322D',
} as const;

export type ColorName = keyof typeof COLORS;

export const FONTS = {
  /** interfaz de la app y textos del tráiler (Google Fonts, variable 100–900) */
  ui: "'Inter', system-ui, -apple-system, sans-serif",
} as const;

/** Escenario de los tráileres de Handy: 4:3 horizontal para iPad. */
export const STAGE = { w: 1440, h: 1080 } as const;

/** Pantalla del teléfono en px lógicos (iPhone 11: el tamaño en el que se diseñaron las pantallas originales). */
export const SCREEN = { w: 414, h: 896 } as const;

/** Tarifa de servicio de Handy sobre el presupuesto del especialista. */
export const HANDY_FEE = 0.05;

/** "$ 45.000": pesos argentinos sin decimales, punto de miles y espacio duro después del signo. */
export function formatARS(value: number): string {
  return '$ ' + Math.round(value).toLocaleString('es-AR');
}

/** Tarifa de Handy (5 %) y precio final para un presupuesto: 45000 → { fee: 2250, total: 47250 }. */
export function priceWithFee(budget: number): { budget: number; fee: number; total: number } {
  const fee = Math.round(budget * HANDY_FEE);
  return { budget, fee, total: budget + fee };
}

/** Comisión de Handy sobre el presupuesto del especialista (la ve el especialista; el cliente paga aparte su 5 %). */
export const HANDY_COMISION = 0.1;

/** Lo que recibe el especialista de su presupuesto: 45000 → { comision: 4500, neto: 40500 }. */
export function netoEspecialista(budget: number): { budget: number; comision: number; neto: number } {
  const comision = Math.round(budget * HANDY_COMISION);
  return { budget, comision, neto: budget - comision };
}
