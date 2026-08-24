import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import AppNavBar from '@/components/app-nav-bar/app-nav-bar';
import {
  getLoginRedirectIfNeeded,
  getRequestReturnTo,
} from '@/utils/auth/auth-login-redirect';

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const headerStore = headers();
  const returnTo = await getRequestReturnTo(
    headerStore.get('x-cadence-return-to')
  );
  const loginRedirect = await getLoginRedirectIfNeeded(
    { cookies: cookieStore, headers: headerStore },
    returnTo
  );
  if (loginRedirect) {
    redirect(loginRedirect);
  }

  return (
    <>
      <AppNavBar />
      <main>{children}</main>
    </>
  );
}
