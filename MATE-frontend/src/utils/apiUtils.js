export const getApiErrorMessage = (error, fallback) =>
  error?.error?.message ||
  error?.response?.data?.error?.message ||
  fallback;

export const getProjectId = (value) =>
  value?.projectId ?? value?.project?.id ?? null;

export const getApplicationId = (value) =>
  value?.applicationId ?? value?.applyId ?? value?.id ?? null;

export const getProfileImage = (value) =>
  value?.profileImageUrl ?? value?.profileImg ?? null;

export const getPageContent = (response) =>
  Array.isArray(response) ? response : response?.content ?? response?.data ?? [];

export const getPageInfo = (response, fallbackLength = 0) => ({
  totalPages: response?.page?.totalPages ?? response?.totalPages ?? (fallbackLength ? 1 : 0),
  totalElements: response?.page?.totalElements ?? response?.totalElements ?? fallbackLength,
});

export const formatDate = (value, separator = '-') => {
  if (!value) return '';
  return String(value).split('T')[0].replaceAll('-', separator);
};
