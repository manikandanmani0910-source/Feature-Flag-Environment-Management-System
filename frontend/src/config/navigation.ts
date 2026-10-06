export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  permission?: string;
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export const navigationSections: NavigationSection[] =
  [
    {
      label: "Overview",
      items: [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: "LayoutDashboard",
        },
        {
          label: "Analytics",
          path: "/analytics",
          icon: "BarChart3",
        },
      ],
    },

    {
      label: "Feature Management",
      items: [
        {
          label: "Feature Flags",
          path: "/feature-flags",
          icon: "Flag",
        },
        {
          label: "Environments",
          path: "/environments",
          icon: "Server",
        },
        {
          label: "Rollouts",
          path: "/rollouts",
          icon: "Rocket",
        },
      ],
    },

    {
      label: "Operations",
      items: [
        {
          label: "Evaluations",
          path: "/evaluations",
          icon: "Activity",
        },
        {
          label: "Usage",
          path: "/usage",
          icon: "BarChart3",
        },
        {
          label: "Audit Logs",
          path: "/audit-logs",
          icon: "FileText",
        },
      ],
    },

    {
      label: "Administration",
      items: [
        {
          label: "Users",
          path: "/users",
          icon: "Users",
        },
        {
          label: "Settings",
          path: "/settings",
          icon: "Settings",
        },
      ],
    },
  ];

export const navigationItems =
  navigationSections.flatMap(
    (section) => section.items,
  );