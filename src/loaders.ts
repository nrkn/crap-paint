import { imageDataToPalette } from './palette'
import { imageToImageData } from './image'

export const loadPalette = async ( src: string ) => {
  const img = await loadImage( src )
  const imageData = imageToImageData( img )

  return imageDataToPalette( imageData )
}

export const loadImage = ( src: string ) => new Promise<HTMLImageElement>(
  ( resolve, reject ) => {
    const img = new Image()

    img.addEventListener( 'load', () => {
      const { naturalWidth, naturalHeight } = img

      if ( naturalWidth === 0 || naturalHeight === 0 ) {
        return reject( Error( 'Bad image' ) )
      }

      resolve( img )
    } )

    img.addEventListener( 'error', () => reject( Error( 'Bad image' ) ) )

    img.src = src
  }
)
