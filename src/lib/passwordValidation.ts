// Password validation utility
// Rules: required, min 6, max 12 characters

export function validatePassword(password: string): string | null {
  if (!password || !password.trim()) {
    return 'Password is required.';
  }
  const trimmed = password.trim();
  if (trimmed.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  if (trimmed.length > 12) {
    return 'Password must be at most 12 characters.';
  }
  return null;
} 