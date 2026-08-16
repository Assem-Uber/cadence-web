import { render, screen, userEvent, waitFor } from '@/test-utils/rtl';

import JwtLoginPage from '../jwt-login-page';

jest.mock('@/components/app-nav-bar/hooks/use-auth-lifecycle', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseAuthLifecycle = jest.requireMock(
  '@/components/app-nav-bar/hooks/use-auth-lifecycle'
).default as jest.Mock;

const mockReplace = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
  useSearchParams: () =>
    new URLSearchParams('returnTo=%2Fdomains%2Fsample&notice=session-expired'),
}));

describe(JwtLoginPage.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthLifecycle.mockReturnValue({
      isAuthLoading: false,
      isJwtAuth: true,
      isValidToken: false,
      saveToken: jest.fn().mockResolvedValue(true),
    });
  });

  it('renders the login form and session notice', () => {
    setup();

    expect(
      screen.getByRole('heading', { name: 'Authenticate with JWT' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Your session expired. Paste a new JWT to continue.')
    ).toBeInTheDocument();
  });

  it('submits a token and redirects to returnTo', async () => {
    const saveToken = jest.fn().mockResolvedValue(true);
    mockUseAuthLifecycle.mockReturnValue({
      isAuthLoading: false,
      isJwtAuth: true,
      isValidToken: false,
      saveToken,
    });

    const { user } = setup();

    await user.type(screen.getByRole('textbox'), 'header.payload.signature');
    await user.click(screen.getByTestId('jwt-login-submit'));

    await waitFor(() => {
      expect(saveToken).toHaveBeenCalledWith('header.payload.signature');
      expect(mockReplace).toHaveBeenCalledWith('/domains/sample');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});

function setup() {
  const user = userEvent.setup();
  render(<JwtLoginPage />);
  return { user };
}
