export const cleanQueryParams = (params: Record<string, any>): Record<string, string> => {
  const cleaned: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value.toString();
    }
  });
  return cleaned;
};