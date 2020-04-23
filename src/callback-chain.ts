export interface Next<T, U> {
  (ctx: T): Promise<U> | U
}

export interface Callback<T, U> {
  (ctx: T, next: Next<T, U>): Promise<U> | U
}

export interface Composed<T, U> {
  (ctx: T, next: Next<T, U>): Promise<U>
}

export function compose<T, U = any>(callbacks: Callback<T, U>[]): Composed<T, U> {
  function dispatch(pos: number, ctx: T, done: Next<T, U>): Promise<U> {
    const cb = callbacks[pos] || done
    const next = (ctx: T) => dispatch(pos + 1, ctx, done)
    return new Promise((resolve) => resolve(cb(ctx, next)))
  }
  return function composed(ctx: T, next: Next<T, U>) {
    return dispatch(0, ctx, next)
  }
}
