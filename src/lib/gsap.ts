/* GSAP for the trailer kit.
   The kit scripts (trailers/<id>/js/*.js) read GSAP and its plugins from the global scope, as they did
   when they were loaded from the CDN. This module installs them on window and must be imported first. */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(SplitText, MorphSVGPlugin, DrawSVGPlugin, ScrambleTextPlugin);
Object.assign(window, { gsap, SplitText, MorphSVGPlugin, DrawSVGPlugin, ScrambleTextPlugin });
