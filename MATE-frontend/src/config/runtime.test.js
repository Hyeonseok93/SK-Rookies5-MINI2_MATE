import { describe, it, expect } from 'vitest';
import { API_BASE_URL, ASSET_BASE_URL, getAssetUrl } from './runtime';

describe('runtime base URLs', () => {
  it('always exposes an /api suffixed API base', () => {
    expect(API_BASE_URL.endsWith('/api')).toBe(true);
  });

  it('derives an asset base without the /api suffix', () => {
    expect(ASSET_BASE_URL).toBe(API_BASE_URL.replace(/\/api\/?$/, ''));
    expect(ASSET_BASE_URL.endsWith('/api')).toBe(false);
  });
});

describe('getAssetUrl', () => {
  it('returns null for empty input', () => {
    expect(getAssetUrl(null)).toBeNull();
    expect(getAssetUrl(undefined)).toBeNull();
    expect(getAssetUrl('')).toBeNull();
  });

  it('passes through already-absolute and inline URLs unchanged', () => {
    expect(getAssetUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
    expect(getAssetUrl('http://cdn.example.com/a.png')).toBe('http://cdn.example.com/a.png');
    expect(getAssetUrl('//cdn.example.com/a.png')).toBe('//cdn.example.com/a.png');
    expect(getAssetUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(getAssetUrl('blob:http://x/y')).toBe('blob:http://x/y');
  });

  it('prefixes relative paths with the asset base and a single slash', () => {
    expect(getAssetUrl('/uploads/a.png')).toBe(`${ASSET_BASE_URL}/uploads/a.png`);
    expect(getAssetUrl('uploads/a.png')).toBe(`${ASSET_BASE_URL}/uploads/a.png`);
  });
});
