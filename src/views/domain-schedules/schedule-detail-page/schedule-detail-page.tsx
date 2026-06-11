import React from 'react';

import decodeUrlParams from '@/utils/decode-url-params';

import ScheduleDetailPageHeader from '../schedule-detail-page-header/schedule-detail-page-header';
import ScheduleDetailPageTabs from '../schedule-detail-page-tabs/schedule-detail-page-tabs';

import { type Props } from './schedule-detail-page.types';

export default function ScheduleDetailPage({ params, children }: Props) {
  const decodedParams = decodeUrlParams(params) as Props['params'];

  return (
    <>
      <ScheduleDetailPageHeader
        domain={decodedParams.domain}
        cluster={decodedParams.cluster}
        scheduleId={decodedParams.scheduleId}
      />
      <ScheduleDetailPageTabs />
      {children}
    </>
  );
}
