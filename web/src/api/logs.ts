import httpClient from './httpClient';
import type { DailyLogPayload, DailyLogResponse } from './types';

const logCache = new Map<string, DailyLogResponse>();

export const submitDailyLog = async (payload: DailyLogPayload) => {
  const { data } = await httpClient.post<DailyLogResponse>('/logs', payload);
  logCache.set(payload.date, data);
  return data;
};

export const getDailyLog = async (date: string) => {
  if (logCache.has(date)) {
    return logCache.get(date)!;
  }

  const { data } = await httpClient.get<DailyLogResponse>(`/logs/${date}`);
  logCache.set(date, data);
  return data;
};

export const invalidateLogCache = (date?: string) => {
  if (date) {
    logCache.delete(date);
    return;
  }
  logCache.clear();
};
