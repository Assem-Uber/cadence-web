import getDomainAccessLabel from '../authorization/domain-access-label';

describe(getDomainAccessLabel.name, () => {
  it('returns Open when auth is disabled', () => {
    expect(
      getDomainAccessLabel({ canRead: false, canWrite: false }, false)
    ).toBe('Open');
  });

  it('returns Admin when user is an admin', () => {
    expect(
      getDomainAccessLabel(
        { canRead: true, canWrite: true, isAdmin: true },
        true
      )
    ).toBe('Admin');
  });

  it('returns Read & write when user can write', () => {
    expect(getDomainAccessLabel({ canRead: true, canWrite: true }, true)).toBe(
      'Read & write'
    );
  });

  it('returns Read only when user can read but not write', () => {
    expect(getDomainAccessLabel({ canRead: true, canWrite: false }, true)).toBe(
      'Read only'
    );
  });

  it('returns No access when user lacks read permission', () => {
    expect(
      getDomainAccessLabel({ canRead: false, canWrite: false }, true)
    ).toBe('No access');
  });
});
