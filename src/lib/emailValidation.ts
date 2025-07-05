// Email validation utility
// Rules: required, must be a valid email format

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email is required.';
  }
  const trimmed = email.trim();
  // Simple email regex
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
} 