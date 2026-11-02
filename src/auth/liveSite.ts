const LIVE_SITE = 'kimmysdelivery.com'

export function isLiveCustomerHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  return host === LIVE_SITE || host.endsWith(`.${LIVE_SITE}`)
}
