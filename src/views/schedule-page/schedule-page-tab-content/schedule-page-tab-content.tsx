'use client';
import React from 'react';

import { notFound } from 'next/navigation';

import ErrorPanel from '@/components/error-panel/error-panel';
import PanelSection from '@/components/panel-section/panel-section';
import { type ReadOnlyDetailsTableRow } from '@/components/read-only-details-table/read-only-details-table.types';
import SectionLoadingIndicator from '@/components/section-loading-indicator/section-loading-indicator';
import useStyletronClasses from '@/hooks/use-styletron-classes';
import { RequestError } from '@/utils/request/request-error';
import useDescribeSchedule from '@/views/shared/hooks/use-describe-schedule/use-describe-schedule';

import scheduleDetailsSectionsConfig from '../config/schedule-details-sections.config';
import { type ScheduleDetailRowConfig } from '../config/schedule-detail-sections.types';
import schedulePageTabsConfig from '../config/schedule-page-tabs.config';
import SchedulePageDetailsSection from '../schedule-page-details-section/schedule-page-details-section';

import { cssStyles } from './schedule-page-tab-content.styles';
import { type Props } from './schedule-page-tab-content.types';

export default function SchedulePageTabContent({ params }: Props) {
  const { cls } = useStyletronClasses(cssStyles);
  const tabConfig = schedulePageTabsConfig[params.scheduleTab];

  if (!tabConfig) {
    return notFound();
  }

  const schedulesListLink = `/domains/${encodeURIComponent(params.domain)}/${encodeURIComponent(params.cluster)}/schedules`;

  const {
    data,
    error,
    isLoading,
    isPending,
    refetch,
  } = useDescribeSchedule({
    domain: params.domain,
    cluster: params.cluster,
    scheduleId: params.scheduleId,
  });

  if (isLoading || isPending) {
    return (
      <div className={cls.tabContentContainer}>
        <SectionLoadingIndicator />
      </div>
    );
  }

  if (error instanceof RequestError && error.status === 404) {
    return (
      <div className={cls.tabContentContainer}>
        <PanelSection>
          <ErrorPanel
            error={error}
            message={`Schedule "${params.scheduleId}" was not found`}
            actions={[
              {
                kind: 'link-internal',
                label: 'Go to schedules',
                link: schedulesListLink,
              },
            ]}
            reset={refetch}
            omitLogging={true}
            showErrorDetails={true}
          />
        </PanelSection>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cls.tabContentContainer}>
        <PanelSection>
          <ErrorPanel
            error={error}
            message="Failed to load schedule"
            actions={[{ kind: 'retry', label: 'Retry' }]}
            reset={refetch}
            showErrorDetails={error instanceof RequestError}
          />
        </PanelSection>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cls.tabContentContainer}>
        <PanelSection>
          <ErrorPanel
            message="Schedule data is unavailable"
            description="Try refreshing the page. If the issue persists, return to schedules and open it again."
            actions={[
              {
                kind: 'link-internal',
                label: 'Go to schedules',
                link: schedulesListLink,
              },
            ]}
            omitLogging={true}
          />
        </PanelSection>
      </div>
    );
  }

  if (params.scheduleTab === 'details') {
    return (
      <div className={cls.tabContentContainer}>
        <div className={cls.detailsSectionsContainer}>
          {scheduleDetailsSectionsConfig.map((section) => {
            const rows = getRowsFromConfig(section.rowsConfig, data);
            if (!rows.length) {
              return null;
            }

            return (
              <SchedulePageDetailsSection
                key={section.key}
                title={section.title}
                rows={rows}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cls.tabContentContainer}>
      <div>{tabConfig.title} — coming soon</div>
    </div>
  );
}

function getRowsFromConfig(
  config: ScheduleDetailRowConfig[],
  data: NonNullable<ReturnType<typeof useDescribeSchedule>['data']>
): ReadOnlyDetailsTableRow[] {
  return config
    .filter((rowConfig) => !rowConfig.hide || !rowConfig.hide({ describeSchedule: data }))
    .map((rowConfig) => ({
      key: rowConfig.key,
      label: rowConfig.getLabel(),
      value: rowConfig.getValue({ describeSchedule: data }),
    }));
}
