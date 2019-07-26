export const nonZeroInt = ( value: number ) =>
  Math.max( Math.floor( value ), 1 )

export interface Attributes {
  [ key: string ]: string | number | EventListener
}

export type NodeOrText = Node | string

export type NodeOrTextOrAttributes = NodeOrText | Attributes

export const h = <
  Key extends keyof HTMLElementTagNameMap,
  Element extends HTMLElementTagNameMap[Key]
>( name: Key, ...args: NodeOrTextOrAttributes[] ) => {
  const el = document.createElement( name )

  return populateElement( el, ...args ) as Element
}

export const populateElement = ( el: Element, ...args: NodeOrTextOrAttributes[] ) => {
  args.forEach( arg => {
    if ( typeof arg === 'string' ) {
      el.appendChild( document.createTextNode( arg ) )
    } else if ( arg instanceof Node ) {
      el.appendChild( arg )
    } else if ( arg ) {
      Object.keys( arg ).forEach( key => {
        const value = arg[ key ]

        if ( typeof value === 'function' ) {
          el.addEventListener( key, value )
        } else {
          el.setAttribute( key, String( value ) )
        }
      } )
    }
  } )

  return el
}

export const css = ( strings: TemplateStringsArray, ...keys: string[] ) =>
  h(
    'style',
    strings.map( ( s, i ) => s + ( keys[ i ] || '' ) ).join( '' )
  )
