/* Íconos de línea del diseño 2026 de la app (src/handy/app/DISENO.md): grilla de 24×24, trazo redondeado, color =
   currentColor. Casi todos son de Lucide (ISC, https://lucide.dev); los marcados "propio" se dibujaron para Handy en la
   misma grilla calcando las fotos (rayo, canilla con manija en T, llama, llave de dos dientes, aire, personita, …).
   icono('canilla', { tam: 36 }) → string <svg class="ap-icono">. Para agregar uno: una entrada más en TRAZOS.
   Medidas tomadas de las fotos: rubros 36 px · encabezado 28 · barra inferior 27 · filas y chips 16–20. */

const TRAZOS = {
  // rubros
  'rayo': '<path d="M13 2 4.2 13.7h6.6l-.6 8 9-11.7h-7z"/>', // propio: el rayo angosto de la foto
  'canilla': '<path d="M3.8 4.8v6.4"/><path d="M6.6 4.2h5"/><path d="M7.8 4.2v3.7"/><path d="M3.8 7.9H11a2.3 2.3 0 0 1 2.3 2.3v2h3.9a1.8 1.8 0 0 1 1.8 1.8v.6"/><path d="M17.7 15.5c-.9 1-1.8 2-1.8 2.8a1.8 1.8 0 0 0 3.6 0c0-.8-.9-1.8-1.8-2.8z"/>', // propio: caño con manija en T, pico escalonado y la gota
  'llama': '<path d="M9.4 2.3C7.2 5.4 5.2 8.8 5.2 14.9a6.8 6.8 0 0 0 13.6 0c0-2.8-1.5-5.3-4.2-7.3l-2.3 3C12.2 7.2 11.3 4.4 9.4 2.3Z"/><path d="M12 14.2c-1.6 1.5-2.9 2.6-2.9 4a2.9 2.9 0 0 0 5.8 0c0-1.4-1.3-2.5-2.9-4z"/>', // propio: llama alta con lengüeta a la derecha y llamita adentro
  'llave': '<circle cx="7.6" cy="16.1" r="4.4"/><path d="M10.8 12.9 20.6 3.1"/><path d="m17.6 6.1 2.8 2.8"/><path d="m15 8.7 2.8 2.8"/>', // propio: llave con dos dientes rectos
  'ladrillos': '<rect width="20" height="16" x="2" y="4" rx="2.5"/><path d="M2 9.33h20"/><path d="M2 14.67h20"/><path d="M12 9.33v5.34"/><path d="M8 4v5.33"/><path d="M16 4v5.33"/><path d="M8 14.67V20"/><path d="M16 14.67V20"/>',
  'aire': '<rect width="20" height="9" x="2" y="4" rx="2.5"/><path d="M6 9.5h12"/><path d="m8 16.5-.6 3"/><path d="M12 16.5v3"/><path d="m16 16.5.6 3"/>', // propio: equipo split con el aire saliendo

  // encabezado y barra inferior
  'campana': '<path d="M6.5 15.5V10a5.5 5.5 0 0 1 11 0v5.5"/><path d="M4 15.8h16"/><path d="M10.2 20h3.6"/>', // propio: campana del diseño 2026 (base ancha y badajo de barra)
  'pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  'casa': '<path d="M3.2 10.3 12 3.05l8.8 7.25"/><path d="M5.2 8.65v11.4h13.6V8.65"/><path d="M10.1 20.05V14.3h3.8v5.75"/>', // propio: techo a dos aguas con alero y puerta angosta (barra inferior, 09-u-confirmar)
  'agenda': '<rect width="17.44" height="16.63" x="3.28" y="3.56" rx="2.5"/><path d="M8.15 1.7v3.7"/><path d="M15.85 1.7v3.7"/><path d="M3.28 8.5h17.44"/><path d="M7.7 12.38h8.6"/><path d="M7.7 15.81h5.05"/>', // propio: calendario con encabezado y dos renglones (barra, "Programar turno")
  'mensajes': '<path d="M5.6 14.2 4 19.55l5-1.5A7.55 6.75 0 1 0 5.6 14.2z"/><path d="M8.3 10.45h7"/><path d="M8.3 13.3h3.8"/>', // propio: globo ovalado con la colita abajo a la izquierda y dos renglones
  'usuario': '<circle cx="12" cy="7.4" r="3.8"/><path d="M4.05 20.2a8 8 0 0 1 15.9 0"/>', // propio: cabeza chica y hombros redondos y anchos
  'usuarios': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',

  // especialista
  'maletin': '<rect width="20" height="14" x="2" y="6.5" rx="2.5"/><path d="M16 6.5V4.5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 13h20"/>', // briefcase de Lucide con la línea al medio
  'interruptor': '<rect width="20" height="12" x="2" y="6" rx="6"/><circle cx="16" cy="12" r="3.2"/>', // toggle-right de Lucide, más chato (como en la foto)
  'billetera': '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  'caminando': '<circle cx="10.6" cy="3.4" r="2.4" stroke-width="2.3"/><path d="M10.9 7.3 5.4 11.7"/><path d="M10.9 7.3 8.3 14"/><path d="M10.9 7.3 14.7 12.3 18.8 13.4"/><path d="M8.3 22.8 10.6 15.9 14.5 19.3 14.7 22.8"/>', // propio: la personita del seguimiento (cabeza en aro, piernas sueltas del torso)
  'cronometro': '<path d="M10 2h4"/><path d="M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',

  // flechas y navegación
  'chevron-abajo': '<path d="m6 9 6 6 6-6"/>',
  'chevron-der': '<path d="m9 18 6-6-6-6"/>',
  'chevron-izq': '<path d="m15 18-6-6 6-6"/>',
  'flecha-der': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'flecha-izq': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'cerrar': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'tilde': '<path d="M20 6 9 17l-5-5"/>',
  'mas': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'menos': '<path d="M5 12h14"/>',
  'mas-circulo': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',

  // interfaz
  'reloj': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  'calendario': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M7.5 14h9"/><path d="M7.5 18h5.5"/>',
  'lapiz': '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'alerta': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'prohibido': '<circle cx="12" cy="12" r="10"/><path d="M4.929 4.929 19.07 19.071"/>',
  'ayuda': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  'escudo': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'verificado': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'destello': '<path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>', // loader de Lucide: "Te ayuda a armar el pedido"
  'buscar': '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  'estrella': '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',

  // chat
  'enviar': '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  'camara': '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>',
  'imagen': '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  'chat': '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/><path d="M8 10h8"/><path d="M8 14h5"/>',
  'telefono': '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
} as const;

export type Icono = keyof typeof TRAZOS;
export const ICONOS = Object.keys(TRAZOS) as Icono[];

export interface IconoOpciones {
  /** lado en px (default 24) */
  tam?: number;
  /** grosor del trazo en unidades de la grilla de 24 (default 2) */
  trazo?: number;
  /** relleno (default none: ícono de línea; 'currentColor' para la estrella llena) */
  relleno?: string;
  clase?: string;
}

export function icono(nombre: Icono, { tam = 24, trazo = 2, relleno = 'none', clase = '' }: IconoOpciones = {}): string {
  return `<svg class="ap-icono${clase ? ' ' + clase : ''}" data-icono="${nombre}" viewBox="0 0 24 24" width="${tam}" height="${tam}"`
    + ` fill="${relleno}" stroke="currentColor" stroke-width="${trazo}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`
    + `${TRAZOS[nombre]}</svg>`;
}
