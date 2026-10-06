export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },

  dashboard: {
    summary: "/dashboard/summary",
    dashboard: "/dashboard",
  },

  users: {
    list: "/users",

    detail: (id: number | string) =>
      `/users/${id}`,

    create: "/users",

    update: (id: number | string) =>
      `/users/${id}`,

    delete: (id: number | string) =>
      `/users/${id}`,
  },

  environments: {
    list: "/environments",

    detail: (id: number | string) =>
      `/environments/${id}`,

    create: "/environments",

    update: (id: number | string) =>
      `/environments/${id}`,

    delete: (id: number | string) =>
      `/environments/${id}`,
  },

  featureFlags: {
    list: "/feature-flags",

    detail: (id: number | string) =>
      `/feature-flags/${id}`,

    create: "/feature-flags",

    update: (id: number | string) =>
      `/feature-flags/${id}`,

    delete: (id: number | string) =>
      `/feature-flags/${id}`,

    activate: (id: number | string) =>
      `/feature-flags/${id}/activate`,

    deactivate: (id: number | string) =>
      `/feature-flags/${id}/deactivate`,
  },

  rollouts: {
    list: "/feature-rollouts",

    detail: (id: number | string) =>
      `/feature-rollouts/${id}`,

    create: "/feature-rollouts",

    update: (id: number | string) =>
      `/feature-rollouts/${id}`,

    delete: (id: number | string) =>
      `/feature-rollouts/${id}`,
  },

  assignments: {
    list: "/assignments",

    detail: (id: number | string) =>
      `/assignments/${id}`,

    create: "/assignments",

    update: (id: number | string) =>
      `/assignments/${id}`,

    delete: (id: number | string) =>
      `/assignments/${id}`,
  },

  schedules: {
    list: "/feature-schedules",

    detail: (id: number | string) =>
      `/feature-schedules/${id}`,

    create: "/feature-schedules",

    update: (id: number | string) =>
      `/feature-schedules/${id}`,

    delete: (id: number | string) =>
      `/feature-schedules/${id}`,

    activate: (id: number | string) =>
      `/feature-schedules/${id}/activate`,

    cancel: (id: number | string) =>
      `/feature-schedules/${id}/cancel`,
  },

  usage: {
    list: "/feature-usage",

    detail: (id: number | string) =>
      `/feature-usage/${id}`,
  },

  auditLogs: {
    list: "/audit-logs",

    detail: (id: number | string) =>
      `/audit-logs/${id}`,
  },

  analytics: {
    /*
     * GET /api/v1/analytics/summary
     */
    summary: "/analytics/summary",

    /*
     * GET /api/v1/analytics/daily-usage
     */
    dailyUsage: "/analytics/daily-usage",

    /*
     * GET /api/v1/analytics/top-features
     */
    topFeatures: "/analytics/top-features",

    /*
     * GET /api/v1/analytics/features/{feature_flag_id}
     */
    feature: (
      featureFlagId: number | string,
    ) =>
      `/analytics/features/${featureFlagId}`,

    /*
     * GET /api/v1/analytics/environments/{environment_id}
     */
    environment: (
      environmentId: number | string,
    ) =>
      `/analytics/environments/${environmentId}`,

    /*
     * GET /api/v1/analytics/rollouts/{feature_flag_id}
     */
    rollout: (
      featureFlagId: number | string,
    ) =>
      `/analytics/rollouts/${featureFlagId}`,

    /*
     * POST /api/v1/analytics/usage
     */
    recordUsage: "/analytics/usage",
  },

 evaluations: {
  evaluate: "/evaluations/evaluate",

  // GET /api/v1/evaluations/evaluate
  evaluateGet: "/evaluations/evaluate",

  // POST /api/v1/evaluations/evaluate-many
  batch: "/evaluations/evaluate-many",

  // POST /api/v1/evaluations/invalidate
  invalidate: "/evaluations/invalidate",
},
} as const;