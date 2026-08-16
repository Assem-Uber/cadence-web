import { Suspense } from 'react';

import { render, screen } from '@/test-utils/rtl';

import DomainPageMetadataAuth from '../domain-page-metadata-auth';

describe(DomainPageMetadataAuth.name, () => {
  it('renders access label formed from access flags', async () => {
    setup({
      domainAccess: { canRead: true, canWrite: false, isAdmin: false },
    });

    expect(await screen.findByText('Read only')).toBeInTheDocument();
  });

  it('renders Admin label for admin users', async () => {
    setup({
      domainAccess: { canRead: true, canWrite: true, isAdmin: true },
    });

    expect(await screen.findByText('Admin')).toBeInTheDocument();
  });

  it('renders Open label when auth is disabled', async () => {
    setup({
      authEnabled: false,
      domainAccess: { canRead: true, canWrite: true, isAdmin: false },
    });

    expect(await screen.findByText('Open')).toBeInTheDocument();
  });

  it('renders read and write groups without a user groups section', async () => {
    setup({
      accessGroups: {
        readGroups: ['cadence-readers'],
        writeGroups: ['cadence-writers'],
      },
    });

    expect(await screen.findByText('cadence-readers')).toBeInTheDocument();
    expect(screen.getByText('cadence-writers')).toBeInTheDocument();
    expect(screen.queryByText('Your groups')).not.toBeInTheDocument();
  });

  it('renders empty group placeholders', async () => {
    setup({});

    expect(
      await screen.findByText('Any authenticated user')
    ).toBeInTheDocument();
    expect(screen.getByText('Not restricted by group')).toBeInTheDocument();
  });

  it('renders manage links when modify URLs are provided', async () => {
    setup({
      domainAccess: {
        canRead: true,
        canWrite: true,
        isAdmin: false,
        userGroupsModifyUrl: 'https://iam.example.com/my-groups',
      },
      accessGroups: {
        readGroups: [],
        writeGroups: [],
        domainGroupsModifyUrl: 'https://iam.example.com/domain-groups',
      },
    });

    expect(
      await screen.findByRole('link', { name: 'Manage your groups' })
    ).toHaveAttribute('href', 'https://iam.example.com/my-groups');
    expect(
      screen.getByRole('link', { name: 'Manage domain groups' })
    ).toHaveAttribute('href', 'https://iam.example.com/domain-groups');
  });

  it('omits manage links when modify URLs are absent', async () => {
    setup({});

    expect(await screen.findByText('Your access')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

function setup({
  authEnabled = true,
  domainAccess = { canRead: true, canWrite: true, isAdmin: false },
  accessGroups = { readGroups: [], writeGroups: [] },
}: {
  authEnabled?: boolean;
  domainAccess?: Record<string, unknown>;
  accessGroups?: Record<string, unknown>;
}) {
  render(
    <Suspense>
      <DomainPageMetadataAuth domain="test-domain" cluster="test-cluster" />
    </Suspense>,
    {
      endpointsMocks: [
        {
          path: '/api/auth/me',
          httpMethod: 'GET',
          mockOnce: false,
          jsonResponse: {
            authEnabled,
            authStrategy: authEnabled ? 'jwt' : 'disabled',
            auth: { isValidToken: authEnabled },
          },
        },
        {
          path: '/api/domains/test-domain/test-cluster/access',
          httpMethod: 'GET',
          mockOnce: false,
          jsonResponse: domainAccess,
        },
        {
          path: '/api/domains/test-domain/test-cluster/access-groups',
          httpMethod: 'GET',
          mockOnce: false,
          jsonResponse: accessGroups,
        },
      ],
    }
  );
}
