import { describe, it, expect } from 'vitest';
import {
  toApiCategory,
  toApiOnOffline,
  getOnOfflineLabel,
  getDynamicStatus,
} from './statusUtils';

describe('toApiCategory', () => {
  it('maps Korean labels to API enums', () => {
    expect(toApiCategory('전체')).toBe('');
    expect(toApiCategory('프로젝트')).toBe('PROJECT');
    expect(toApiCategory('스터디')).toBe('STUDY');
  });

  it('passes through unknown values and defaults empties', () => {
    expect(toApiCategory('PROJECT')).toBe('PROJECT');
    expect(toApiCategory(undefined)).toBe('');
  });
});

describe('toApiOnOffline', () => {
  it('maps Korean labels back to API enums', () => {
    expect(toApiOnOffline('온라인')).toBe('ONLINE');
    expect(toApiOnOffline('오프라인')).toBe('OFFLINE');
    expect(toApiOnOffline('온/오프라인')).toBe('BOTH');
  });

  it('defaults to ONLINE for unknown or empty values', () => {
    expect(toApiOnOffline(undefined)).toBe('ONLINE');
    expect(toApiOnOffline('ONLINE')).toBe('ONLINE');
  });
});

describe('getOnOfflineLabel', () => {
  it('maps API enums to Korean labels', () => {
    expect(getOnOfflineLabel('ONLINE')).toBe('온라인');
    expect(getOnOfflineLabel('OFFLINE')).toBe('오프라인');
    expect(getOnOfflineLabel('BOTH')).toBe('온/오프라인');
  });

  it('defaults to 온라인 when the value is missing', () => {
    expect(getOnOfflineLabel(undefined)).toBe('온라인');
  });
});

describe('getDynamicStatus', () => {
  it('defaults to RECRUITING when no post is provided', () => {
    expect(getDynamicStatus(null)).toBe('RECRUITING');
  });

  it('honors an explicit CLOSED status', () => {
    expect(getDynamicStatus({ status: 'CLOSED', recruitCount: 5, currentCount: 0 })).toBe('CLOSED');
  });

  it('closes when the roster is full', () => {
    expect(getDynamicStatus({ recruitCount: 3, currentCount: 3 })).toBe('CLOSED');
  });

  it('flags DEADLINE_SOON when only one slot remains', () => {
    expect(getDynamicStatus({ recruitCount: 3, currentCount: 2 })).toBe('DEADLINE_SOON');
  });

  it('uses server-provided remainingDays for the near-deadline window', () => {
    expect(getDynamicStatus({ recruitCount: 5, currentCount: 0, remainingDays: 2 })).toBe('DEADLINE_SOON');
    expect(getDynamicStatus({ recruitCount: 5, currentCount: 0, remainingDays: 10 })).toBe('RECRUITING');
  });

  it('treats a past endDate as CLOSED', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const iso = yesterday.toISOString().split('T')[0];
    expect(getDynamicStatus({ recruitCount: 5, currentCount: 0, endDate: iso })).toBe('CLOSED');
  });

  it('flags DEADLINE_SOON when the endDate is within three days', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);
    const iso = soon.toISOString().split('T')[0];
    expect(getDynamicStatus({ recruitCount: 5, currentCount: 0, endDate: iso })).toBe('DEADLINE_SOON');
  });
});
