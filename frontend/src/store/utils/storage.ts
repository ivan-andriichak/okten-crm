const storage = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
  clearAuth: () =>
    ['token', 'role', 'currentUserId', 'name', 'surname'].forEach(
      storage.remove,
    ),
};

export default storage;
