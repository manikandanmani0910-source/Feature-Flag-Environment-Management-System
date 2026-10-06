export function normalizeList<T>(
  response: unknown,
): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    response &&
    typeof response === "object"
  ) {
    const data =
      response as Record<string, unknown>;

    if (Array.isArray(data.items)) {
      return data.items as T[];
    }

    if (Array.isArray(data.data)) {
      return data.data as T[];
    }

    if (Array.isArray(data.results)) {
      return data.results as T[];
    }

    if (Array.isArray(data.users)) {
      return data.users as T[];
    }

    if (Array.isArray(data.feature_flags)) {
      return data.feature_flags as T[];
    }

    if (Array.isArray(data.environments)) {
      return data.environments as T[];
    }

    if (Array.isArray(data.schedules)) {
      return data.schedules as T[];
    }

    if (Array.isArray(data.usage)) {
      return data.usage as T[];
    }

    if (Array.isArray(data.logs)) {
      return data.logs as T[];
    }

    if (Array.isArray(data.audit_logs)) {
      return data.audit_logs as T[];
    }
  }

  return [];
}