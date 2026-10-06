import { useMemo, useState } from "react";
import {
  FiEdit2,
  FiMail,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "../../services/api/client";
import { endpoints } from "../../services/api/endpoints";

interface User {
  id: number | string;
  email: string;
  full_name?: string | null;
  role_id?: number | null;
  role?: string | {
    id: number;
    name: string;
  } | null;
  is_active: boolean;
  is_superuser?: boolean;
}

interface UsersResponse {
  items?: User[];
  data?: User[];
  users?: User[];
  total?: number;
}

/* ========================================================= */
/* USERS PAGE */
/* ========================================================= */

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  const [openMenu, setOpenMenu] =
    useState<number | string | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response =
        await apiClient.get<UsersResponse | User[]>(
          endpoints.users.list,
        );

      return response.data;
    },
  });

  /* ------------------------------------------------------- */
  /* NORMALIZE RESPONSE */
  /* ------------------------------------------------------- */

  const users = useMemo<User[]>(() => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data?.items) {
      return data.items;
    }

    if (data?.data) {
      return data.data;
    }

    if (data?.users) {
      return data.users;
    }

    return [];
  }, [data]);

  /* ------------------------------------------------------- */
  /* FILTER */
  /* ------------------------------------------------------- */

  const filteredUsers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const name =
        user.full_name?.toLowerCase() ?? "";

      const email =
        user.email?.toLowerCase() ?? "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          user.is_active) ||
        (statusFilter === "inactive" &&
          !user.is_active);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    statusFilter,
  ]);

  /* ------------------------------------------------------- */
  /* COUNTS */
  /* ------------------------------------------------------- */

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.is_active,
  ).length;

  const inactiveUsers =
    users.filter(
      (user) => !user.is_active,
    ).length;

  const adminUsers =
    users.filter(
      (user) =>
        user.is_superuser ||
        getRoleName(user) === "admin",
    ).length;

  /* ------------------------------------------------------- */
  /* LOADING */
  /* ------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="space-y-6">

        <PageHeader />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
      </div>
    );
  }

  /* ------------------------------------------------------- */
  /* ERROR */
  /* ------------------------------------------------------- */

  if (isError) {
    return (
      <div className="space-y-6">

        <PageHeader />

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <FiUserX size={22} />
          </div>

          <h2 className="text-lg font-semibold text-red-900">
            Unable to load users
          </h2>

          <p className="mt-2 text-sm text-red-700">
            We couldn't retrieve the users from the
            server.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 rounded-lg bg-[#701A4D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5A163D]"
          >
            Try again
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <PageHeader />


      {/* ================================================= */}
      {/* STAT CARDS */}
      {/* ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<FiUsers />}
          iconClass="bg-[#F3E8EF] text-[#701A4D]"
        />

        <StatCard
          title="Active Users"
          value={activeUsers}
          icon={<FiUserCheck />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Inactive Users"
          value={inactiveUsers}
          icon={<FiUserX />}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Administrators"
          value={adminUsers}
          icon={<FiShield />}
          iconClass="bg-violet-50 text-violet-600"
        />

      </div>


      {/* ================================================= */}
      {/* USERS TABLE */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="border-b border-slate-100 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* SEARCH */}

            <div className="relative w-full lg:max-w-md">

              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search users..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#701A4D] focus:bg-white focus:ring-2 focus:ring-[#701A4D]/10"
              />

            </div>


            {/* ACTIONS */}

            <div className="flex items-center gap-3">

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "all"
                      | "active"
                      | "inactive",
                  )
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#701A4D]"
              >
                <option value="all">
                  All Users
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>

              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-xl bg-[#701A4D] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5A163D]"
              >
                <FiPlus size={16} />
                Add User
              </button>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  User
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  User ID
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center"
                  >

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <FiUser size={20} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No users found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or
                      filter.
                    </p>

                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition hover:bg-[#FAF7F9]"
                  >

                    {/* USER */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <UserAvatar user={user} />

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {user.full_name ||
                              "Unnamed User"}
                          </p>

                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <FiMail size={12} />
                            <span className="truncate">
                              {user.email}
                            </span>
                          </div>

                        </div>

                      </div>

                    </td>


                    {/* ROLE */}

                    <td className="px-6 py-4">

                      <RoleBadge
                        user={user}
                      />

                    </td>


                    {/* STATUS */}

                    <td className="px-6 py-4">

                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}

                    </td>


                    {/* ID */}

                    <td className="px-6 py-4">

                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
                        #{user.id}
                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td className="relative px-6 py-4 text-right">

                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(
                            openMenu ===
                              user.id
                              ? null
                              : user.id,
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <FiMoreVertical
                          size={18}
                        />
                      </button>

                      {openMenu ===
                        user.id && (
                        <div className="absolute right-6 top-12 z-20 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg">

                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                            onClick={() =>
                              setOpenMenu(
                                null,
                              )
                            }
                          >
                            <FiEdit2
                              size={14}
                            />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() =>
                              setOpenMenu(
                                null,
                              )
                            }
                          >
                            <FiTrash2
                              size={14}
                            />
                            Delete
                          </button>

                        </div>
                      )}

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <span>
            Showing{" "}
            <strong className="text-slate-700">
              {filteredUsers.length}
            </strong>{" "}
            of{" "}
            <strong className="text-slate-700">
              {totalUsers}
            </strong>{" "}
            users
          </span>

          <span className="text-xs text-slate-400">
            Feature Flag Management System
          </span>

        </div>

      </div>

    </div>
  );
}


/* ========================================================= */
/* PAGE HEADER */
/* ========================================================= */

function PageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#701A4D]">
          <FiUsers size={14} />
          User Management
        </div>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Users
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage users, roles, and access to the
          feature flag platform.
        </p>
      </div>

    </div>
  );
}


/* ========================================================= */
/* STAT CARD */
/* ========================================================= */

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ========================================================= */
/* USER AVATAR */
/* ========================================================= */

function UserAvatar({
  user,
}: {
  user: User;
}) {
  const name =
    user.full_name ||
    user.email ||
    "User";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3E8EF] text-sm font-bold text-[#701A4D]">
      {initials || "U"}
    </div>
  );
}


/* ========================================================= */
/* ROLE BADGE */
/* ========================================================= */

function RoleBadge({
  user,
}: {
  user: User;
}) {
  const roleName =
    getRoleName(user);

  const isAdmin =
    user.is_superuser ||
    roleName.toLowerCase() ===
      "admin";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-xs
        font-semibold
        ${
          isAdmin
            ? "bg-[#F3E8EF] text-[#701A4D]"
            : "bg-slate-100 text-slate-600"
        }
      `}
    >
      {isAdmin && (
        <FiShield size={12} />
      )}

      {roleName}
    </span>
  );
}


/* ========================================================= */
/* ROLE HELPER */
/* ========================================================= */

function getRoleName(
  user: User,
): string {
  if (
    typeof user.role ===
    "string"
  ) {
    return user.role;
  }

  if (
    user.role &&
    typeof user.role ===
      "object"
  ) {
    return user.role.name;
  }

  if (user.is_superuser) {
    return "Admin";
  }

  return "User";
}

export default UsersPage;