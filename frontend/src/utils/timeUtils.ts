export const formatCell = (key: string, value: any) => {
  if (key === 'created_at' && value) {
    return new Date(value).toLocaleString('uk-UA', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  if (key === 'last_login' && value) {
    return new Date(value).toLocaleString('uk-UA', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (key === 'manager' && value) {
    return `${value.name || ''} ${value.surname || ''}`.trim() || 'None';
  }
  return value ?? 'null';
};