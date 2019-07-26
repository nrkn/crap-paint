export interface Rgb extends ArrayLike<number>, Iterable<number> {
  length: 3
}

export type Palette =  ArrayLike<Rgb>
