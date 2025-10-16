import httpClient from './httpClient';
import type { TrendRange, TrendResponse } from './types';

const trendCache = new Map<string, TrendResponse>();

const getKey = (range: TrendRange, date?: string) => `${range}:${date ?? 'latest'}`;

export const getTrend = async (range: TrendRange, date?: string) => {
  const cacheKey = getKey(range, date);
  if (trendCache.has(cacheKey)) {
    return trendCache.get(cacheKey)!;
  }

  const { data } = await httpClient.get<TrendResponse>('/trends', {
    params: { range, date }
  });
  trendCache.set(cacheKey, data);
  return data;
};

export const invalidateTrendCache = (range?: TrendRange) => {
  if (!range) {
    trendCache.clear();
    return;
  }

  Array.from(trendCache.keys()).forEach((key) => {
    if (key.startsWith(`${range}:`)) {
      trendCache.delete(key);
    }
  });
};
