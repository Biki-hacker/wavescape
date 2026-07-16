import gsap from 'gsap'
import { DURATION } from '../constants'

export function animateLandingIntro(element: string | Element) {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
  tl.fromTo(element, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: DURATION.landingIntro })
  return tl
}

export function animateFadeIn(element: string | Element, delay: number = 0) {
  return gsap.fromTo(element, { opacity: 0 }, { opacity: 1, duration: DURATION.cardReveal, delay, ease: 'power2.out' })
}

export function animateThemeTransition(element: string | Element, duration: number = DURATION.themeTransition) {
  return gsap.to(element, { duration, ease: 'power2.inOut' })
}

export function animateRadioPulse(element: string | Element, intensity: number = 1) {
  return gsap.to(element, { scale: 1 + intensity * 0.02, duration: 0.3, yoyo: true, repeat: -1, ease: 'power1.out' })
}

export function animateSpeakerPulse(element: string | Element, bass: number = 0) {
  return gsap.to(element, { scaleX: 1 + bass * 0.05, scaleY: 1 + bass * 0.03, duration: 0.1, ease: 'none' })
}

export function animateFloat(element: string | Element) {
  return gsap.to(element, { y: -8, duration: 3, repeat: -1, yoyo: true, ease: 'power1.out' })
}

export function animateButtonPress(element: string | Element) {
  return gsap.timeline()
    .to(element, { y: 2, x: 2, duration: DURATION.buttonPress, ease: 'none' })
    .to(element, { y: 0, x: 0, duration: DURATION.buttonPress, ease: 'none' })
}
