import qs from 'querystringify'
import { PartialMap } from './utils'

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
export function params(path: string, hint: MatchHint): PartialMap<string> {
  const ret: PartialMap<string> = {}
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
export function query(search?: string): PartialMap<string> {
  return search ? qs.parse(search) : {}
}
