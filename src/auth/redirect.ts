import { isLiveCustomerHost } from './liveSite'
import { UPDATE_PASSWORD_PATH } from './gate'

function isLoopback(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

export function safeRecoveryRedirect(origin: string): string {
  let url: URL
  try {
    url = new URL(UPDATE_PASSWORD_PATH, origin)
  } catch {
    throw new Error('Recovery redirect is not a valid address.')
  }

  if (isLiveCustomerHost(url.hostname)) {
    throw new Error('Recovery cannot use the live customer website.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Recovery redirect must use http or https.')
  }

  if (url.protocol === 'http:' && !isLoopback(url.hostname)) {
    throw new Error('Recovery redirect must use https.')
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new Error('Recovery redirect cannot include extra data.')
  }

  if (url.pathname !== UPDATE_PASSWORD_PATH) {
    throw new Error('Recovery redirect left the password update page.')
  }

  return `${url.origin}${UPDATE_PASSWORD_PATH}`
}
