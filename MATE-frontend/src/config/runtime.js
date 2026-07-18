const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_BASE_URL = configuredBaseUrl.endsWith('/api')
  ? configuredBaseUrl
  : `${configuredBaseUrl.replace(/\/$/, '')}/api`;

export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const getAssetUrl = (path) => {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  return `${ASSET_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const isMswEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true';
