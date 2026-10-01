/** Una sección de la galería: dibuja sus componentes en root y, si tiene demos animadas,
    las agrega a tl en tiempos absolutos (la galería la reproduce en loop o la congela con ?t=). */
export interface Seccion {
  id: string;
  titulo: string;
  render(root: HTMLElement, tl: GSAPTimeline): void;
}
