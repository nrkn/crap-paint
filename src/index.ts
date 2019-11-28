import { loadPalette } from './loaders'
import { paint } from './app'

const start = async() => {
  const main = document.querySelector( '#main' )!
  const palette = await loadPalette( 'palette.png' )

  const paintApp = paint( palette, 9, 10 )

  main.appendChild( paintApp )
}

start()
