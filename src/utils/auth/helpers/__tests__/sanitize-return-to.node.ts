import { DEFAULT_AUTH_RETURN_TO } from '../../auth.constants';
import { sanitizeReturnTo } from '../sanitize-return-to';

describe(sanitizeReturnTo.name, () => {
  it('returns default for empty paths', () => {
    expect(sanitizeReturnTo(null)).toBe(DEFAULT_AUTH_RETURN_TO);
    expect(sanitizeReturnTo('')).toBe(DEFAULT_AUTH_RETURN_TO);
  });

  it('blocks open redirects', () => {
    expect(sanitizeReturnTo('https://evil.test/path')).toBe(
      DEFAULT_AUTH_RETURN_TO
    );
    expect(sanitizeReturnTo('//evil.test/path')).toBe(DEFAULT_AUTH_RETURN_TO);
  });

  it('blocks parser-normalization bypasses', () => {
    // Browsers treat backslash as slash in URLs: "/\evil.test" -> "//evil.test"
    expect(sanitizeReturnTo('/\\evil.test/path')).toBe(DEFAULT_AUTH_RETURN_TO);
    expect(sanitizeReturnTo('\\/evil.test/path')).toBe(DEFAULT_AUTH_RETURN_TO);
    // URL parsers strip tabs/newlines: "/\t/evil.test" -> "//evil.test"
    expect(sanitizeReturnTo('/\t/evil.test')).toBe(DEFAULT_AUTH_RETURN_TO);
    expect(sanitizeReturnTo('/\n/evil.test')).toBe(DEFAULT_AUTH_RETURN_TO);
  });

  it('preserves safe in-app paths', () => {
    expect(sanitizeReturnTo('/domains/sample/cluster')).toBe(
      '/domains/sample/cluster'
    );
    expect(sanitizeReturnTo('/domains?tab=workflows')).toBe(
      '/domains?tab=workflows'
    );
    expect(sanitizeReturnTo('/api/auth/oidc/login')).toBe(
      '/api/auth/oidc/login'
    );
  });
});
