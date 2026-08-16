import formatSessionExpiryLabel from '../format-session-expiry-label';

describe(formatSessionExpiryLabel.name, () => {
  it('shows seconds when less than one minute remains', () => {
    const nowMs = 1_000_000;
    expect(formatSessionExpiryLabel(nowMs + 45_000, nowMs)).toBe(
      'Session · 45s left'
    );
  });

  it('shows minutes when at least one minute remains', () => {
    const nowMs = 1_000_000;
    expect(formatSessionExpiryLabel(nowMs + 120_000, nowMs)).toBe(
      'Session · 2m left'
    );
  });

  it('shows expired when past expiry', () => {
    expect(formatSessionExpiryLabel(1_000, 2_000)).toBe('Session expired');
  });
});
