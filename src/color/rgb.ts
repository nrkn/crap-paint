import { Rgb } from './types'

const rgbCache = new Map<string, Rgb>()

export const createRgb = ( r: number, g: number, b: number ) => {
  r |= 0
  g |= 0
  b |= 0

  const key = `${ r },${ g },${ b }`

  if ( rgbCache.has( key ) ) return rgbCache.get( key )!

  const rgb = Object.freeze( [ r, g, b ] ) as Rgb

  rgbCache.set( key, rgb )

  return rgb
}

export const getHue = ( rgb: Rgb ) => {
  const [ r, g, b ] = rgb

  const min = Math.min( r, g, b )
  const max = Math.max( r, g, b )
  const delta = max - min

  if ( delta === 0 ) return 0

  let hue = 0

  if ( max === r ) {
    hue = ( g - b ) / delta
  } else if ( max === g ) {
    hue = 2 + ( b - r ) / delta
  } else {
    hue = 4 + ( r - g ) / delta
  }

  hue *= 60

  if ( hue < 0 ) hue += 360

  return Math.round( hue )
}

export const getLuma = ( rgb: Rgb ) => {
  const [ r, g, b ] = rgb

  return 0.299 * r + 0.587 * g + 0.114 * b
}

export const getSaturation = ( rgb: Rgb ) => {
  let [ r, g, b ] = rgb

  r /= 255
  g /= 255
  b /= 255

  const min = Math.min( r, g, b )
  const max = Math.max( r, b, b )
  const delta = max - min

  const l = ( min + max ) / 2

  return delta / ( 1 - Math.abs( 2 * l - 1 ) )
}

export const lumaComparator = ( a: Rgb, b: Rgb ) =>
  getLuma( a ) - getLuma( b )

export const hueComparator = ( a: Rgb, b: Rgb ) =>
  getHue( a ) - getHue( b )

export const saturationComparator = ( a: Rgb, b: Rgb ) =>
  getSaturation( a ) - getSaturation( b )