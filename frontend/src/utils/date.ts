export function toISOString(
  value: string | Date,
): string {
  return new Date(value).toISOString();
}

export function isDateInPast(
  value?: string | null,
): boolean {
  if (!value) {
    return false;
  }

  return (
    new Date(value).getTime() <
    Date.now()
  );
}

export function isDateInFuture(
  value?: string | null,
): boolean {
  if (!value) {
    return false;
  }

  return (
    new Date(value).getTime() >
    Date.now()
  );
}