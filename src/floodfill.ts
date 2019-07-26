export const floodFill = (
  x: number, y: number, width: number, height: number,
  canFlood: FloodFillPredicate, onFlood: FloodFillCallback
) => {
  x = x | 0
  y = y | 0

  let x1: number
  let isAbove: boolean
  let isBelow: boolean

  const stack: Point[] = [ [ x, y ] ]

  const pop = () => {
    if ( stack.length > 0 ) {
      [ x, y ] = stack.pop()!

      return true
    }

    return false
  }

  while ( pop() ) {
    x1 = x

    while ( x1 >= 0 && canFlood( x1, y ) )
      x1--

    x1++

    isAbove = isBelow = false

    while ( x1 < width && canFlood( x1, y ) ) {
      onFlood( x1, y )

      if ( !isAbove && y > 0 && canFlood( x1, y - 1 ) ) {
        stack.push( [ x1, y - 1 ] )
        isAbove = true
      } else if ( isAbove && y > 0 && !canFlood( x1, y - 1 ) ) {
        isAbove = false
      }

      if ( !isBelow && y < height - 1 && canFlood( x1, y + 1 ) ) {
        stack.push( [ x1, y + 1 ] )
        isBelow = true
      } else if (
        isBelow && y < height - 1 && !canFlood( x1, y + 1 )
      ) {
        isBelow = false
      }

      x1++
    }
  }
}

type Point = [ number, number ]

export type FloodFillPredicate = ( x: number, y: number ) => boolean
export type FloodFillCallback = ( x: number, y: number ) => void
