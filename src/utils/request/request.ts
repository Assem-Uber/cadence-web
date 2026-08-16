import getConfigValue from '../config/get-config-value';

import { handleApiUnauthorized } from '../auth/client-auth-actions';
import { shouldAttemptAuthRecovery } from '../auth/helpers/should-attempt-auth-recovery';

import { RequestError } from './request-error';
import { type RequestOptions } from './request.types';

async function readRequestError(response: Response, url: string) {
  const error = await response.json();
  return new RequestError(
    error.message,
    url,
    response.status,
    error.validationErrors,
    {
      cause: error.cause,
    }
  );
}

export default async function request(
  url: string,
  options?: RequestOptions
): Promise<Response> {
  let absoluteUrl = url;
  let userHeaders = {};
  const isRelativeUrl = url.startsWith('/');
  const isOnServer = typeof window === 'undefined';
  if (isOnServer && isRelativeUrl) {
    const port = await getConfigValue('CADENCE_WEB_PORT');
    absoluteUrl = `http://127.0.0.1:${port}${url}`;
    userHeaders = Object.fromEntries(
      await (await import('next/headers')).headers().entries()
    );
  }

  const { omitUserHeaders, headers, skipAuthRecovery, _authRetried, ...requestOptions } =
    options || {};
  const requestHeaders = omitUserHeaders
    ? headers
    : { ...userHeaders, ...(headers || {}) };

  const response = await fetch(absoluteUrl, {
    cache: 'no-cache',
    ...requestOptions,
    headers: requestHeaders,
  });

  if (
    !response.ok &&
    response.status === 401 &&
    shouldAttemptAuthRecovery(url, { skipAuthRecovery, _authRetried })
  ) {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    const recovery = await handleApiUnauthorized({
      returnTo,
      notice: 'session-expired',
    });

    if (recovery.kind === 'recovered') {
      return request(url, {
        ...options,
        _authRetried: true,
      });
    }
  }

  if (!response.ok) {
    throw await readRequestError(response, url);
  }

  return response;
}
