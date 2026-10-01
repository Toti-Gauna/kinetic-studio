/* Publishes the hub catalog on window for trailers that show the rest of the library (bifurcacion,
   export). Import it before the trailer script that reads window.HUB_CATALOG. */
import { catalog } from '../../hub/catalog.ts';

window.HUB_CATALOG = catalog;
