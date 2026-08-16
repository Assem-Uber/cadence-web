import React from 'react';

import decodeUrlParams from '@/utils/decode-url-params';

import DomainPageAccessGate from './domain-page-access-gate/domain-page-access-gate';
import DomainPageContextProvider from './domain-page-context-provider/domain-page-context-provider';
import DomainPageHeader from './domain-page-header/domain-page-header';
import DomainPageTabs from './domain-page-tabs/domain-page-tabs';
import { type Props } from './domain-page.types';

export default async function DomainPage(props: Props) {
  const decodedParams = decodeUrlParams(props.params);
  return (
    <DomainPageContextProvider>
      <DomainPageAccessGate
        domain={decodedParams.domain}
        cluster={decodedParams.cluster}
      >
        <DomainPageHeader
          domain={decodedParams.domain}
          cluster={decodedParams.cluster}
        />
        <DomainPageTabs />
        {props.children}
      </DomainPageAccessGate>
    </DomainPageContextProvider>
  );
}
