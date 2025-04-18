'use client';
import { ProgressBar, type ProgressBarOverrides } from 'baseui/progress-bar';

const progressOverrides = {
  BarContainer: {
    style: { margin: 0 },
  },
} satisfies ProgressBarOverrides;

export default function HomePageLoading() {
  return <ProgressBar overrides={progressOverrides} infinite />;
}
