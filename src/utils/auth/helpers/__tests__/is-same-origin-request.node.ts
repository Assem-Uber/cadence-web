import { type NextRequest } from 'next/server';

import isSameOriginRequest from '../is-same-origin-request';

function buildRequest(headers: Record<string, string>): NextRequest {
  return {
    headers: new Headers(headers),
  } as unknown as NextRequest;
}

describe(isSameOriginRequest.name, () => {
  it('allows requests without an Origin header', () => {
    expect(isSameOriginRequest(buildRequest({ host: 'cadence.test' }))).toBe(
      true
    );
  });

  it('allows same-origin requests', () => {
    expect(
      isSameOriginRequest(
        buildRequest({ host: 'cadence.test', origin: 'https://cadence.test' })
      )
    ).toBe(true);
  });

  it('rejects cross-origin requests', () => {
    expect(
      isSameOriginRequest(
        buildRequest({ host: 'cadence.test', origin: 'https://evil.test' })
      )
    ).toBe(false);
  });

  it('rejects malformed Origin headers', () => {
    expect(
      isSameOriginRequest(
        buildRequest({ host: 'cadence.test', origin: 'null' })
      )
    ).toBe(false);
  });

  it('matches Origin against x-forwarded-host behind a host-rewriting proxy', () => {
    expect(
      isSameOriginRequest(
        buildRequest({
          host: 'internal-pod:8088',
          'x-forwarded-host': 'cadence.test',
          origin: 'https://cadence.test',
        })
      )
    ).toBe(true);
  });

  it('rejects cross-origin requests even with x-forwarded-host present', () => {
    expect(
      isSameOriginRequest(
        buildRequest({
          host: 'internal-pod:8088',
          'x-forwarded-host': 'cadence.test',
          origin: 'https://evil.test',
        })
      )
    ).toBe(false);
  });
});
