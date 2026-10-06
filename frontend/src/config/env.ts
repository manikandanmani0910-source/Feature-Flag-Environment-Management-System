const getEnv = (
  key: string,
  fallback: string,
): string => {
  const value =
    import.meta.env[key];

  return value ?? fallback;
};

export const env = {
  apiBaseUrl: getEnv(
    "VITE_API_BASE_URL",
    "http://127.0.0.1:8000",
  ),

  appName: getEnv(
    "VITE_APP_NAME",
    "Feature Flag Management",
  ),

  appVersion: getEnv(
    "VITE_APP_VERSION",
    "1.0.0",
  ),

  isDevelopment:
    import.meta.env.DEV,

  isProduction:
    import.meta.env.PROD,
} as const;