import { useQuery } from '@tanstack/react-query';
import { getTrend } from '../api/trends';
import type { TrendRange } from '../api/types';

export const useTrendData = (range: TrendRange, date?: string) => {
  return useQuery({
    queryKey: ['trend', range, date],
    queryFn: () => getTrend(range, date)
  });
};
