import { loadPalette } from './loaders'
import { paletteToImageData, splitPaletteToDarkAndLight } from './palette'
import { imageDataToImage } from './image'
import { paint } from './paint';

const start = async() => {
  const main = document.querySelector( 'main' )!
  const palette = await loadPalette( 'palette.png' )

  const paintApp = paint( palette, 9, 10 )

  main.appendChild( paintApp )

  // const { light, dark } = splitPaletteToDarkAndLight( palette )
  // const lightImageData = paletteToImageData( light, 32 )
  // const darkImageData = paletteToImageData( dark, 32 )
  // const lightImg = imageDataToImage( lightImageData )
  // const darkImg = imageDataToImage( darkImageData )

  // document.body.append( lightImg )
  // document.body.append( document.createElement( 'br' ) )

  // document.body.append( darkImg )
  // document.body.append( document.createElement( 'br' ) )
}

start()
