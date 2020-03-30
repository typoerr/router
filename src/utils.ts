export type Diff<T extends object, U extends object> = Pick<T, Exclude<keyof T, keyof U>>

export type Assign<T extends object, U extends object> = Diff<T, U> & U

export type PartialMap<T = any> = Partial<{ [k: string]: T }>
