import React from 'react';

import SchedulePageHeader from './schedule-page-header/schedule-page-header';
import { type Props } from './schedule-page.types';

export default function SchedulePage({ params, children }: Props) {
  return (
    <>
      <SchedulePageHeader
        domain={params.domain}
        cluster={params.cluster}
        scheduleId={params.scheduleId}
      />
      {children}
    </>
  );
}
