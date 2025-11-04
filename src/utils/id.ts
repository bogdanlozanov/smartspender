export const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }

  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
};
