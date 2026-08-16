import { type NextRequest } from 'next/server';

export default function getCookieSecureAttribute(request: NextRequest) {
  // Direct TLS always wins: a client-forged "x-forwarded-proto: http" header
  // must not strip the Secure attribute from a cookie set over https.
  if (request.nextUrl.protocol === 'https:') {
    return true;
  }
  // Behind a TLS-terminating proxy the server sees http; trust the proxy's
  // forwarded protocol (proxies overwrite client-supplied values).
  const xfProto = request.headers.get('x-forwarded-proto');
  const proto = xfProto?.split(',')[0]?.trim().toLowerCase();
  return proto === 'https';
}
