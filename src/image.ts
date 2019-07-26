import { nonZeroInt } from './util'

export const imageToImageData = ( img: HTMLImageElement ) => {
  const { naturalWidth: width, naturalHeight: height } = img
  const { context } = createCanvasContext( width, height )

  context.drawImage( img, 0, 0 )

  return context.getImageData( 0, 0, width, height )
}

export const imageDataToImage = ( imageData: ImageData ) => {
  const { width, height } = imageData
  const { canvas, context } = createCanvasContext( width, height )

  context.putImageData( imageData, 0, 0 )

  const img = new Image()

  img.src = canvas.toDataURL()

  return img
}

export const createCanvasContext = ( width: number, height: number ) => {
  width = nonZeroInt( width )
  height = nonZeroInt( height )

  const canvas = document.createElement( 'canvas' )
  const context = canvas.getContext( '2d' )!

  Object.assign( canvas, { width, height } )

  return { canvas, context }
}
