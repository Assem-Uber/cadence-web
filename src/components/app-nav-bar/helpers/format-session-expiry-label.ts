export default function formatSessionExpiryLabel(
  expiresAtMs: number,
  nowMs = Date.now()
): string {
  const remainingMs = expiresAtMs - nowMs;
  if (remainingMs <= 0) {
    return 'Session expired';
  }

  if (remainingMs < 60_000) {
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    return `Session · ${remainingSeconds}s left`;
  }

  const remainingMinutes = Math.ceil(remainingMs / 60_000);
  if (remainingMinutes < 60) {
    return `Session · ${remainingMinutes}m left`;
  }

  return `Session · ${new Date(expiresAtMs).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}
