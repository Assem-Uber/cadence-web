import React, { useMemo, useState } from 'react';

import {
  QueryClient,
  type QueryClientConfig,
  QueryClientProvider,
} from '@tanstack/react-query';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider/next-13.5'; // TODO: @assem.hafez remove the dependency on next-router-mock
// @ts-expect-error Could not find a declaration file for module 'styletron-engine-snapshot'
import { StyletronSnapshotEngine } from 'styletron-engine-snapshot';

import themeProviderOverrides from '@/config/theme/theme-provider-overrides.config';
import StyletronProvider from '@/providers/styletron-provider';

import MSWMockHandlers from './msw-mock-handlers/msw-mock-handlers';
import { type Props } from './test-provider.types';

jest.mock('next/router', () => require('next-router-mock'));

const snapshotEngine = new StyletronSnapshotEngine();

const disableAnimationOverrides = {
  AppContainer: {
    style: {
      [`*, *::before, *::after`]: {
        '-moz-transition': ' none !important',
        transition: ' none !important',
        '-moz-animation': 'none !important',
        animation: 'none !important',
        'caret-color': ' transparent !important',
      },
    },
  },
};
const getQueryClient = (config: QueryClientConfig) =>
  new QueryClient(
    Object.assign(
      {},
      {
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: Infinity,
            retryOnMount: false,
            refetchOnWindowFocus: false,
          },
        },
      },
      config
    )
  );
/**
 * Don't use this directly. Use render from rtl.tsx instead.
 */
export const TestProvider = ({
  children,
  router = {
    initialUrl: '/',
    pathnames: [],
  },
  queryClientConfig = {},
  endpointsMocks,
  enableAnimations = false,
  isSnapshotTest = false,
}: Props) => {
  const [client] = useState(() => getQueryClient(queryClientConfig));
  const themeOverridesWithDisabledAnimations = useMemo(() => {
    if (enableAnimations) return themeProviderOverrides;
    return Object.assign({}, themeProviderOverrides, disableAnimationOverrides);
  }, [enableAnimations]);
  return (
    <StyletronProvider
      baseProviderOverrides={themeOverridesWithDisabledAnimations}
      {...(isSnapshotTest && {
        styletronEngine: snapshotEngine,
      })}
    >
      <MSWMockHandlers endpointsMocks={endpointsMocks} />
      <MemoryRouterProvider url={router.initialUrl}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </MemoryRouterProvider>
    </StyletronProvider>
  );
};
