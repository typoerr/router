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
export function query(search = ''): PartialMap<string> {
  return search ? qs.parse(search) : {}
}

// Refs: https://github.com/nuintun/URI/blob/a38c20a3873d958e3bad8861eb4c90b915b4778e/URI.ts#L70
//
//     1.protocol                 2.user     3.pass     4.hostname         5.port      6.pathname 7.search 8.hash
//          |                       |           |            |                |              |       |       |
//   ---------------             --------    -------     ----------    ---------------   ----------------- -----
// /^([a-z0-9.+-]+:)?(?:\/\/)?(?:([^/:]*)(?::([^/]*))?@)?([^:?#/]*)(?::(\d*(?=$|[?#/])))?([^?#]*)(\?[^#]*)?(#.*)?/i
const URI_REGEXP = /^([a-z0-9.+-]+:)?(?:\/\/)?(?:([^/:]*)(?::([^/]*))?@)?([^:?#/]*)(?::(\d*(?=$|[?#/])))?([^?#]*)(\?[^#]*)?(#.*)?/i
const parts = ['protocol', 'username', 'password', 'hostname', 'port', 'pathname', 'search', 'hash']

export interface ParsedURL {
  protocol?: string
  username?: string
  password?: string
  hostname?: string
  port?: string
  pathname?: string
  search?: string
  hash?: string
}
/**
 * Parse URL
 */
export function url(path: string): ParsedURL {
  const matched = URI_REGEXP.exec(decodeURI(path))
  if (!matched) {
    throw Error('URI not a standard WHATWG URI.')
  }
  const result: any = {}
  for (let i = 0; i < parts.length; ) {
    const key = parts[i]
    const val = matched[++i]
    result[key] = val ? val.replace(/(.+)[/]$/, '$1') : undefined
  }
  return result
}
