'use client';
import React from 'react';

import { Button } from 'baseui/button';
import { MdAdd } from 'react-icons/md';

import PageFilters from '@/components/page-filters/page-filters';
import domainPageQueryParamsConfig from '@/views/domain-page/config/domain-page-query-params.config';

import domainSchedulesFiltersConfig from '../config/domain-schedules-filters.config';

import { styled } from './domain-schedules-header.styles';
import { type Props } from './domain-schedules-header.types';

export default function DomainSchedulesHeader({
  count,
  onCreateSchedule,
}: Props) {
  const title = count === undefined ? 'Schedules' : `Schedules (${count})`;

  return (
    <styled.Container>
      <styled.TitleRow>
        <styled.Title>{title}</styled.Title>
      </styled.TitleRow>
      <styled.FiltersRow>
        <PageFilters
          searchQueryParamKey="schedulesSearch"
          searchPlaceholder="Find schedule by ID or workflow type"
          pageFiltersConfig={domainSchedulesFiltersConfig}
          pageQueryParamsConfig={domainPageQueryParamsConfig}
        />
        <Button
          size="compact"
          kind="secondary"
          onClick={onCreateSchedule}
          startEnhancer={<MdAdd size={16} aria-hidden />}
        >
          Create
        </Button>
      </styled.FiltersRow>
    </styled.Container>
  );
}
