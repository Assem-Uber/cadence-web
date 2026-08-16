import { render, screen } from '@/test-utils/rtl';

import DomainPageErrorUnauthorized from '../domain-page-error-unauthorized';

jest.mock('@/components/error-panel/error-panel', () =>
  jest.fn(
    ({ message, description }: { message: string; description?: string }) => (
      <div>
        <div>{message}</div>
        {description && <div>{description}</div>}
      </div>
    )
  )
);

describe(DomainPageErrorUnauthorized.name, () => {
  it('shows access denied message', async () => {
    render(<DomainPageErrorUnauthorized domain="restricted" />);
    expect(
      await screen.findByText('Access denied for domain "restricted"')
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/You do not have permission to view this domain/)
    ).toBeInTheDocument();
  });
});
