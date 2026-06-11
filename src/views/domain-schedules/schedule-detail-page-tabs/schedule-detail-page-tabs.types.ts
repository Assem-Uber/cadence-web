import { type ScheduleDetailTabName } from '../schedule-detail-page/schedule-detail-tabs.config';

export type ScheduleDetailPageTabsParams = {
  domain: string;
  cluster: string;
  scheduleId: string;
  scheduleTab: ScheduleDetailTabName;
};
