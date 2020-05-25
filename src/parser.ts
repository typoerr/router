import qs from 'querystringify'

/**
 * Return value from regexparam()
 */
export interface MatchHint {
  keys: string[]
  pattern: RegExp
}

/**
 * Parse params
 */
export function params(path: string, hint: MatchHint): Partial<Record<string, string>> {
  const ret: Partial<Record<string, string>> = {}
  const match = hint.pattern.exec(path)
  if (match) {
    for (let i = 0; i < hint.keys.length; i++) {
      ret[hint.keys[i]] = match[i + 1]
    }
  }
  return ret
}

/**
 * Parse query strings
 */
export function query(search?: string): Partial<Record<string, string>> {
  return search ? qs.parse(search) : {}
}
