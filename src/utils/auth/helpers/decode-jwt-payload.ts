export function decodeJwtPayload(token: string): unknown | undefined {
  const [, payload] = token.split('.');
  if (!payload) {
    return undefined;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload =
      normalizedPayload + '='.repeat((4 - (normalizedPayload.length % 4)) % 4);
    const decodedPayload = Buffer.from(paddedPayload, 'base64').toString(
      'utf8'
    );
    return JSON.parse(decodedPayload);
  } catch {
    return undefined;
  }
}
