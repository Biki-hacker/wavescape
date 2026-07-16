export const DURATION = {
  hover: 0.15,
  buttonPress: 0.1,
  cardReveal: 0.3,
  modal: 0.35,
  themeTransition: 1.0,
  sceneTransition: 1.5,
  landingIntro: 2.0,
  searchResultFade: 0.25,
  radioNeedle: 0.5,
  crossfade: 0.6,
} as const

export const EASING = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.76, 0, 0.24, 1],
  softOut: [0.25, 0.46, 0.45, 0.94],
  expoOut: [0.16, 1, 0.3, 1],
} as const
