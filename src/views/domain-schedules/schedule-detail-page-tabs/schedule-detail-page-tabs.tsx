'use client';
import React, { useMemo } from 'react';

import { useParams, useRouter } from 'next/navigation';

import PageTabs from '@/components/page-tabs/page-tabs';
import decodeUrlParams from '@/utils/decode-url-params';

import scheduleDetailTabsConfig from '../schedule-detail-page/schedule-detail-tabs.config';

import { type ScheduleDetailPageTabsParams } from './schedule-detail-page-tabs.types';

export default function ScheduleDetailPageTabs() {
  const router = useRouter();
  const params = useParams<ScheduleDetailPageTabsParams>();
  const decodedParams = decodeUrlParams(params) as ScheduleDetailPageTabsParams;

  const tabList = useMemo(
    () =>
      Object.entries(scheduleDetailTabsConfig).map(([key, tabConfig]) => ({
        key,
        title: tabConfig.title,
        artwork: tabConfig.artwork,
      })),
    []
  );

  return (
    <PageTabs
      selectedTab={decodedParams.scheduleTab}
      tabList={tabList}
      setSelectedTab={(newTab) => {
        router.push(encodeURIComponent(newTab.toString()));
      }}
    />
  );
}
