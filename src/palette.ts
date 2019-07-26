import { Rgb, Palette } from './types'
import { nonZeroInt } from './util'
import { imageDataToImage } from './image';

const paletteMap = new Map<string, Rgb>()

export const createRgb = ( r: number, g: number, b: number ) => {
  r |= 0
  g |= 0
  b |= 0

  const key = `${ r },${ g },${ b }`

  if ( paletteMap.has( key ) ) return paletteMap.get( key )!

  const rgb = Object.freeze( [ r, g, b ] ) as Rgb

  paletteMap.set( key, rgb )

  return rgb
}

export const imageDataToPalette = ( imageData: ImageData ) => {
  const used = new Set<string>()
  const palette: Rgb[] = []
  const { width, height } = imageData

  for ( let y = 0; y < height; y++ ) {
    for ( let x = 0; x < width; x++ ) {
      const index = ( y * width + x ) * 4
      const r = imageData.data[ index ]
      const g = imageData.data[ index + 1 ]
      const b = imageData.data[ index + 2 ]

      const key = `${ r },${ g },${ b }`

      if ( used.has( key ) ) continue

      const rgb = createRgb( r, g, b )

      palette.push( rgb )

      used.add( key )
    }
  }

  return Object.freeze( palette ) as Palette
}

export const paletteToImageData = (
  palette: Palette, scale = 1, columns = palette.length
) => {
  scale = nonZeroInt( scale )
  columns = nonZeroInt( columns )

  const rows = Math.ceil( palette.length / columns )
  const width = columns * scale
  const height = rows * scale

  const imageData = new ImageData( width, height )

  for ( let ry = 0; ry < rows; ry++ ) {
    const dy = ry * scale

    for ( let cx = 0; cx < columns; cx++ ) {
      const paletteIndex = ry * columns + cx

      if ( paletteIndex >= palette.length ) continue

      const [ r, g, b ] = palette[ paletteIndex ]
      const dx = cx * scale

      for ( let sy = 0; sy < scale; sy++ ) {
        const y = dy + sy

        for ( let sx = 0; sx < scale; sx++ ) {
          const x = dx + sx

          const index = ( y * width + x ) * 4

          imageData.data[ index ] = r
          imageData.data[ index + 1 ] = g
          imageData.data[ index + 2 ] = b
          imageData.data[ index + 3 ] = 255
        }
      }
    }
  }

  return imageData
}

export const paletteToImage = (
  palette: Palette, scale = 1, columns = palette.length
) => {
  const imageData = paletteToImageData( palette, scale, columns )

  return imageDataToImage( imageData )
}

export const sortPalette = (
  palette: Palette, comparator: ( a: Rgb, b: Rgb ) => number
) =>
  Object.freeze(
    Array.from( palette ).sort( comparator )
  ) as Palette

export const filterPalette = (
  palette: Palette, predicate: ( rgb: Rgb ) => boolean
) =>
  Object.freeze(
    Array.from( palette ).filter( predicate )
  ) as Palette

export const mapPalette = (
  palette: Palette, mapper: ( rgb: Rgb ) => Rgb
) =>
  Object.freeze(
    Array.from( palette ).map( rgb => {
      const [ r, g, b ] = mapper( rgb )

      return createRgb( r, g, b )
    } )
  ) as Palette

export const slicePalette = (
  palette: Palette, start?: number, end?: number
) =>
  Object.freeze(
    Array.from( palette ).slice( start, end )
  ) as Palette

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

export const splitPaletteToDarkAndLight = ( palette: Palette ) => {
  const half = Math.ceil( palette.length / 2 )
  const sorted = sortPalette( palette, lumaComparator )

  const d: Rgb[] = []
  const l: Rgb[] = []

  for ( let i = 0; i < sorted.length; i++ ) {
    const rgb = sorted[ i ]

    if ( i < half ) {
      d.push( rgb )
    } else {
      l.push( rgb )
    }
  }

  const dark = filterPalette( palette, rgb => d.includes( rgb ) )
  const light = filterPalette( palette, rgb => l.includes( rgb ) )

  return { dark, light }
}
