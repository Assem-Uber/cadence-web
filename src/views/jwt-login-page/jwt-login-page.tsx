'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Banner, HIERARCHY, KIND as BANNER_KIND } from 'baseui/banner';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import useAuthLifecycle from '@/components/app-nav-bar/hooks/use-auth-lifecycle';
import { isAuthLogoutNotice } from '@/utils/auth/helpers/is-auth-logout-notice';
import { sanitizeReturnTo } from '@/utils/auth/helpers/sanitize-return-to';

import getNoticeMessage from './helpers/get-notice-message';
import { styled } from './jwt-login-page.styles';

export default function JwtLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthLoading, isJwtAuth, isValidToken, saveToken } =
    useAuthLifecycle();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnTo = useMemo(
    () => sanitizeReturnTo(searchParams.get('returnTo')),
    [searchParams]
  );
  const notice = useMemo(() => {
    const value = searchParams.get('notice');
    return isAuthLogoutNotice(value) ? value : undefined;
  }, [searchParams]);

  useEffect(() => {
    if (isAuthLoading || !isJwtAuth || !isValidToken) {
      return;
    }
    router.replace(returnTo);
  }, [isAuthLoading, isJwtAuth, isValidToken, returnTo, router]);

  const handleSubmit = useCallback(async () => {
    if (!token.trim()) {
      setError('Please paste a JWT token first');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const saved = await saveToken(token.trim());
      if (!saved) {
        setError('Token is expired or invalid');
        return;
      }
      router.replace(returnTo);
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to save authentication token'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [returnTo, router, saveToken, token]);

  if (!isAuthLoading && !isJwtAuth) {
    return (
      <styled.Page>
        <styled.Title>Authentication unavailable</styled.Title>
        <styled.Description>
          JWT login is not enabled for this deployment.
        </styled.Description>
        <Button $as={NextLink} href="/domains" kind="secondary">
          Go to domains
        </Button>
      </styled.Page>
    );
  }

  return (
    <styled.Page>
      <styled.Title>Authenticate with JWT</styled.Title>
      <styled.Description>
        Paste a Cadence-compatible JWT issued by your identity provider.
      </styled.Description>

      {notice ? (
        <Banner
          hierarchy={HIERARCHY.low}
          kind={
            notice === 'session-expired'
              ? BANNER_KIND.negative
              : BANNER_KIND.info
          }
        >
          {getNoticeMessage(notice)}
        </Banner>
      ) : null}

      <FormControl label="Cadence JWT" error={error || null}>
        <Textarea
          value={token}
          onChange={(event) =>
            setToken((event?.target as HTMLTextAreaElement)?.value || '')
          }
          clearOnEscape
          disabled={isSubmitting || isAuthLoading}
          rows={6}
        />
      </FormControl>

      <styled.Actions>
        <Button
          $as={NextLink}
          href={returnTo}
          kind="tertiary"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          isLoading={isSubmitting}
          disabled={isAuthLoading}
          data-testid="jwt-login-submit"
        >
          Save token
        </Button>
      </styled.Actions>
    </styled.Page>
  );
}
