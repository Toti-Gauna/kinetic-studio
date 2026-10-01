/* Scroll / pointer plugins for interactive trailers (js/interactive.js). Import after ./gsap. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(ScrollTrigger, Observer);
Object.assign(window, { ScrollTrigger, Observer });
