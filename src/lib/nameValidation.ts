// Validates name according to defined rules
// Name validation utility
// Rules: required, min 4, max 50, only letters (A-Z, a-z) and hyphen (-) allowed

export function validateName(name: string): string | null {
  if (!name || !name.trim()) {
    return 'Name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 4) {
    return 'Name must be at least 4 characters.';
  }
  if (trimmed.length > 50) {
    return 'Name must be at most 50 characters.';
  }
  if (!/^[A-Za-z-]+$/.test(trimmed)) {
    return 'Name can only contain letters and hyphens.';
  }
  return null;
} 