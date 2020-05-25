export type Diff<T, U> = Pick<T, Exclude<keyof T, keyof U>>

export type Assign<T, U> = Diff<T, U> & U
