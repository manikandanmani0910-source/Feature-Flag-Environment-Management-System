export function isValidEmail(
  email: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

export function isValidPercentage(
  value: number,
): boolean {
  return (
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

export function isRequired(
  value: unknown,
): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (
    typeof value === "string" &&
    value.trim() === ""
  ) {
    return false;
  }

  return true;
}