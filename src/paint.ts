import { Palette } from './types'
import { h, css, populateElement } from './util'
import { paletteToImage, slicePalette, createRgb } from './palette'
import { createCanvasContext } from './image'
import { line } from './line'
import { floodFill } from './floodfill';

export const paint = ( palette: Palette, fill: number, selected: number ) => {
  const app = h(
    'div',
    { class: 'app' },
    css`
      .app {
        display: grid;
        grid-template-rows: auto 1fr;
        grid-gap: 1rem;
      }

      .app .palette {
        display: grid;
        grid-template-columns: auto auto auto 1fr;
        grid-gap: 1rem;
        align-items: center;
      }

      .app .palette img:first-child {
        outline: 1px solid #39f;
      }

      .app .paint-surface {
        position: relative;
      }

      .app .paint-surface canvas {
        height: 100%;
        width: auto;
        image-rendering: auto;
        image-rendering: crisp-edges;
        image-rendering: pixelated;
      }
    `,
    h(
      'div',
      { class: 'palette' },
      selectedEl( palette, selected ),
      paletteEl( palette, 32 ),
      h(
        'form',
        h(
          'label',
          h( 'input', { type: 'radio', name: 'mode', value: 'paint', checked: '' } ),
          'paint'
        ),
        h(
          'label',
          h( 'input', { type: 'radio', name: 'mode', value: 'fill' } ),
          'fill'
        )
      )
    ),
    h(
      'div',
      { class: 'paint-surface' },
      paintCanvas( 256, 256, palette, fill )
    )
  )

  return app
}

export const paintCanvas = ( width: number, height: number, palette: Palette, fillIndex: number ) => {
  const { canvas, context } = createCanvasContext( width, height )

  populateElement(
    canvas,
    { width: width, height: height }
  )

  const rgb = palette[ fillIndex ]

  context.fillStyle = `rgb(${ [...rgb].join(',') })`
  context.fillRect( 0, 0, width, height )

  const imageData = context.getImageData( 0, 0, width, height )

  let mode = 'paint'
  let drawing = false
  let last: [ number, number ] | null = null
  let selectedIndex = fillIndex

  const getCanvasCoords = ( e: MouseEventInit ) => {
    const { left, top, height: ch } = canvas.getBoundingClientRect()
    const { clientX, clientY } = e

    // wrong! only works in landscape
    const dw = width / ch
    const dh = height / ch

    const sx = clientX! - left
    const sy = clientY! - top

    const dx = Math.floor( dw * sx )
    const dy = Math.floor( dh * sy )

    return [ dx, dy ] as [ number, number ]
  }

  const click: EventListener = ( e: MouseEventInit ) => {
    const form = document.querySelector( 'form' )!
    const formData = new FormData( form )

    const m = formData.get( 'mode' )

    if ( typeof m === 'string' ) mode = m

    if( mode === 'paint' ) return

    const selectEl = document.querySelector( '[data-index]' ) as HTMLElement

    selectedIndex = Number( selectEl.dataset.index )

    const [ cx, cy ] = getCanvasCoords( e )

    const sindex = ( cy * width + cx ) * 4
    const sr = imageData.data[ sindex ]
    const sg = imageData.data[ sindex + 1 ]
    const sb = imageData.data[ sindex + 2 ]

    const srgb = createRgb( sr, sg, sb )
    const rgb = palette[ selectedIndex ]

    if( srgb === rgb ){
      return
    }

    const [ r, g, b ] = rgb

    floodFill(
      cx, cy, width, height,
      ( x, y ) => {
        const index = ( y * width + x ) * 4

        const cr = imageData.data[ index ]
        const cg = imageData.data[ index + 1 ]
        const cb = imageData.data[ index + 2 ]

        const crgb = createRgb( cr, cg, cb )

        return crgb === srgb
      },
      ( x, y ) => {
        const index = ( y * width + x ) * 4

        imageData.data[ index ] = r
        imageData.data[ index + 1 ] = g
        imageData.data[ index + 2 ] = b
        imageData.data[ index + 3 ] = 255
      }
    )

    context.putImageData( imageData, 0, 0 )
  }

  const mousedown: EventListener = ( e: MouseEventInit ) => {
    if( mode === 'fill' ) return

    drawing = true
    last = getCanvasCoords( e )

    const selectEl = document.querySelector( '[data-index]' ) as HTMLElement

    selectedIndex = Number( selectEl.dataset.index )
  }

  const mouseup: EventListener = ( e: MouseEventInit ) => {
    drawing = false
    last = null
  }

  const mouseleave: EventListener = ( e: MouseEventInit ) => {
    mouseup( e as any )
  }

  const mousemove: EventListener = ( e: MouseEventInit ) => {
    if ( mode === 'fill' ) return
    if( !drawing || last === null ) return

    const [ r, g, b ] = palette[ selectedIndex ]

    const [ lx, ly ] = last
    const [ cx, cy ] = getCanvasCoords( e )

    line( lx, ly, cx, cy, ( x, y ) => {
      const index = ( y * width + x ) * 4

      imageData.data[ index ] = r
      imageData.data[ index + 1 ] = g
      imageData.data[ index + 2 ] = b
      imageData.data[ index + 3 ] = 255
    } )

    context.putImageData( imageData, 0, 0 )

    last = [ cx, cy ]
  }

  populateElement( canvas, { mousedown, mousemove, mouseup, mouseleave, click } )

  return canvas
}

export const selectedEl = ( palette: Palette, selected: number, scale = 48 ) => {
  const selectedImg = paletteToImage(
    slicePalette( palette, selected, selected + 1 ), scale
  )

  populateElement(
    selectedImg,
    {
      'data-index': selected
    }
  )

  return selectedImg
}

export const paletteEl = ( palette: Palette, scale: number ) => {
  const paletteImg = paletteToImage( palette, scale )

  const click = ( e: MouseEventInit ) => {
    const { left } = paletteImg.getBoundingClientRect()
    const index = Math.floor( ( e.clientX! - left ) / scale )

    const old = paletteImg.previousElementSibling as HTMLImageElement
    const selected = selectedEl( palette, index )

    old.src = selected.src
    old.dataset.index = String( index )
  }

  populateElement(
    paletteImg,
    {
      click
    }
  )


  return paletteImg
}
