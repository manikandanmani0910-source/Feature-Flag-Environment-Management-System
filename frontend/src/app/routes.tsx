import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { LoginPage } from "../pages/auth/LoginPage";

import { DashboardPage } from "../pages/dashboard/DashboardPage";

import { FeatureFlagsPage } from "../pages/feature-flags/FeatureFlagsPage";

import { EnvironmentsPage } from "../pages/environments/EnvironmentsPage";

import { RolloutsPage } from "../pages/rollouts/RolloutsPage";

import { AssignmentsPage } from "../pages/assignments/AssignmentsPage";

import { SchedulesPage } from "../pages/schedules/SchedulesPage";

import { UsagePage } from "../pages/usage/UsagePage";

import { EvaluationsPage } from "../pages/evaluations/EvaluationsPage";

import { AnalyticsPage } from "../pages/analytics/AnalyticsPage";

import { AuditLogsPage } from "../pages/audit-logs/AuditLogsPage";

import { UsersPage } from "../pages/users/UsersPage";

import { SettingsPage } from "../pages/settings/SettingsPage";

import { AppLayout } from "../components/layout/AppLayout";

import { useAuthStore } from "../store/authStore";


/* =========================================================
   PROTECTED ROUTE
   ========================================================= */

function ProtectedRoute() {
  const location = useLocation();

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}


/* =========================================================
   PUBLIC ROUTE
   ========================================================= */

function PublicRoute() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}


/* =========================================================
   APPLICATION ROUTES
   ========================================================= */

export const routes = [

  /* -------------------------------------------------------
     PUBLIC
     ------------------------------------------------------- */

  {
    element: <PublicRoute />,

    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },


  /* -------------------------------------------------------
     PROTECTED
     ------------------------------------------------------- */

  {
    element: <ProtectedRoute />,

    children: [

      /* Dashboard */

      {
        path: "/dashboard",
        element: <DashboardPage />,
      },


      /* Feature Flags */

      {
        path: "/feature-flags",
        element: <FeatureFlagsPage />,
      },


      /* Environments */

      {
        path: "/environments",
        element: <EnvironmentsPage />,
      },


      /* Rollouts */

      {
        path: "/rollouts",
        element: <RolloutsPage />,
      },


      /* Assignments */

      {
        path: "/assignments",
        element: <AssignmentsPage />,
      },


      /* Schedules */

      {
        path: "/schedules",
        element: <SchedulesPage />,
      },


      /* Usage */

      {
        path: "/usage",
        element: <UsagePage />,
      },


      /* Evaluations */

      {
        path: "/evaluations",
        element: <EvaluationsPage />,
      },


      /* Analytics */

      {
        path: "/analytics",
        element: <AnalyticsPage />,
      },


      /* Audit Logs */

      {
        path: "/audit-logs",
        element: <AuditLogsPage />,
      },


      /* Users */

      {
        path: "/users",
        element: <UsersPage />,
      },


      /* Settings */

      {
        path: "/settings",
        element: <SettingsPage />,
      },

    ],
  },


  /* -------------------------------------------------------
     ROOT
     ------------------------------------------------------- */

  {
    path: "/",

    element: (
      <Navigate
        to="/dashboard"
        replace
      />
    ),
  },


  /* -------------------------------------------------------
     UNKNOWN ROUTE
     ------------------------------------------------------- */

  {
    path: "*",

    element: (
      <Navigate
        to="/dashboard"
        replace
      />
    ),
  },
];