export interface Next<T, U> {
  (ctx: T): Promise<U>
}

export interface Callback<T, U> {
  (ctx: T, next: Next<T, U>): Promise<U>
}

/**
 * compose callback-chain
 */
export function call<T, U>(cbs: Callback<T, U>[], ctx: T, done: Next<T, U>) {
  function disaptch(pos: number, ctx: T, done: Next<T, U>): Promise<U> {
    const mw = cbs[pos] || done
    const next = (c: T) => disaptch(pos + 1, c, done)
    return new Promise((resolve) => resolve(mw(ctx, next)))
  }
  return disaptch(0, ctx, done)
}
