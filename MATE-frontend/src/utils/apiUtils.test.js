import { describe, it, expect } from 'vitest';
import {
  getApiErrorMessage,
  getProjectId,
  getApplicationId,
  getProfileImage,
  getPageContent,
  getPageInfo,
  formatDate,
} from './apiUtils';

describe('getApiErrorMessage', () => {
  it('prefers a normalized error envelope message', () => {
    const error = { error: { message: 'normalized' }, message: 'axios' };
    expect(getApiErrorMessage(error, 'fallback')).toBe('normalized');
  });

  it('falls back to the nested axios response envelope', () => {
    const error = { response: { data: { error: { message: 'from-response' } } } };
    expect(getApiErrorMessage(error, 'fallback')).toBe('from-response');
  });

  it('falls back to response.data.message', () => {
    const error = { response: { data: { message: 'plain-message' } } };
    expect(getApiErrorMessage(error, 'fallback')).toBe('plain-message');
  });

  it('falls back to the raw error message', () => {
    expect(getApiErrorMessage({ message: 'network error' }, 'fallback')).toBe('network error');
  });

  it('returns the fallback when nothing else is present', () => {
    expect(getApiErrorMessage({}, 'fallback')).toBe('fallback');
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(getApiErrorMessage(undefined, 'fallback')).toBe('fallback');
  });
});

describe('getProjectId', () => {
  it('reads a flat projectId', () => {
    expect(getProjectId({ projectId: 5 })).toBe(5);
  });

  it('reads a nested project.id when projectId is absent', () => {
    expect(getProjectId({ project: { id: 7 } })).toBe(7);
  });

  it('prefers the flat projectId over the nested value', () => {
    expect(getProjectId({ projectId: 5, project: { id: 7 } })).toBe(5);
  });

  it('returns null for missing or nullish input', () => {
    expect(getProjectId({})).toBeNull();
    expect(getProjectId(null)).toBeNull();
    expect(getProjectId(undefined)).toBeNull();
  });
});

describe('getApplicationId', () => {
  it('resolves in priority order applicationId > applyId > id', () => {
    expect(getApplicationId({ applicationId: 1, applyId: 2, id: 3 })).toBe(1);
    expect(getApplicationId({ applyId: 2, id: 3 })).toBe(2);
    expect(getApplicationId({ id: 3 })).toBe(3);
    expect(getApplicationId({})).toBeNull();
    expect(getApplicationId(null)).toBeNull();
  });
});

describe('getProfileImage', () => {
  it('resolves profileImageUrl then profileImg', () => {
    expect(getProfileImage({ profileImageUrl: 'a.png' })).toBe('a.png');
    expect(getProfileImage({ profileImg: 'b.png' })).toBe('b.png');
    expect(getProfileImage({})).toBeNull();
    expect(getProfileImage(null)).toBeNull();
  });
});

describe('getPageContent', () => {
  it('returns arrays untouched', () => {
    expect(getPageContent([1, 2])).toEqual([1, 2]);
  });

  it('reads content then data, defaulting to an empty array', () => {
    expect(getPageContent({ content: [1] })).toEqual([1]);
    expect(getPageContent({ data: [2] })).toEqual([2]);
    expect(getPageContent({})).toEqual([]);
    expect(getPageContent(null)).toEqual([]);
  });
});

describe('getPageInfo', () => {
  it('reads the nested page metadata', () => {
    expect(getPageInfo({ page: { totalPages: 3, totalElements: 42 } })).toEqual({
      totalPages: 3,
      totalElements: 42,
    });
  });

  it('reads flat metadata', () => {
    expect(getPageInfo({ totalPages: 2, totalElements: 20 })).toEqual({
      totalPages: 2,
      totalElements: 20,
    });
  });

  it('derives a single page from the fallback length when metadata is absent', () => {
    expect(getPageInfo({}, 5)).toEqual({ totalPages: 1, totalElements: 5 });
    expect(getPageInfo({}, 0)).toEqual({ totalPages: 0, totalElements: 0 });
  });
});

describe('formatDate', () => {
  it('returns an empty string for falsy input', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('strips the time portion and applies the separator', () => {
    expect(formatDate('2026-07-18T12:34:56')).toBe('2026-07-18');
    expect(formatDate('2026-07-18T12:34:56', '.')).toBe('2026.07.18');
    expect(formatDate('2026-07-18', '/')).toBe('2026/07/18');
  });
});
