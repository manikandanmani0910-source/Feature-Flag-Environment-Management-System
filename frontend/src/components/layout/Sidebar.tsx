import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiFlag,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiMapPin,
  FiSettings,
  FiShield,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import { NavLink } from "react-router-dom";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const mainMenu: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <FiGrid />,
  },
  {
    label: "Feature Flags",
    path: "/feature-flags",
    icon: <FiFlag />,
  },
  {
    label: "Environments",
    path: "/environments",
    icon: <FiLayers />,
  },
  {
    label: "Rollouts",
    path: "/rollouts",
    icon: <FiActivity />,
  },
  {
    label: "Assignments",
    path: "/assignments",
    icon: <FiUsers />,
  },
  {
    label: "Schedules",
    path: "/schedules",
    icon: <FiClock />,
  },
];

const monitoringMenu: MenuItem[] = [
  {
    label: "Feature Usage",
    path: "/usage",
    icon: <FiZap />,
  },
  {
    label: "Evaluations",
    path: "/evaluations",
    icon: <FiCheckCircle />,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: <FiBarChart2 />,
  },
  {
    label: "Audit Logs",
    path: "/audit-logs",
    icon: <FiShield />,
  },
];

const systemMenu: MenuItem[] = [
  {
    label: "Users",
    path: "/users",
    icon: <FiUsers />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <FiSettings />,
  },
];

export function Sidebar({
  collapsed = false,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed
        left-0
        top-0
        z-50
        flex
        h-screen
        flex-col
        border-r
        border-[#5A163D]
        bg-[#3B1028]
        text-white
        shadow-xl
        transition-all
        duration-300
        ${collapsed ? "w-[78px]" : "w-64"}
      `}
    >
      {/* ------------------------------------------------ */}
      {/* LOGO */}
      {/* ------------------------------------------------ */}

      <div
        className={`
          flex
          h-[76px]
          shrink-0
          items-center
          border-b
          border-white/10
          ${collapsed ? "justify-center px-3" : "px-5"}
        `}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#701A4D]
              text-sm
              font-bold
              text-pink-100
              shadow-lg
              shadow-black/20
            "
          >
            FF
          </div>

          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold tracking-wide text-white">
                Feature Flags
              </h1>

              <p className="mt-0.5 text-[11px] text-pink-200/60">
                Management System
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* NAVIGATION */}
      {/* ------------------------------------------------ */}

      <div className="flex-1 overflow-y-auto px-3 py-5">

        {/* MAIN */}
        <SidebarSection
          title="MAIN"
          collapsed={collapsed}
        />

        <div className="space-y-1">
          {mainMenu.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* MONITORING */}
        <div className="mt-7">
          <SidebarSection
            title="MONITORING"
            collapsed={collapsed}
          />

          <div className="space-y-1">
            {monitoringMenu.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>

        {/* SYSTEM */}
        <div className="mt-7">
          <SidebarSection
            title="SYSTEM"
            collapsed={collapsed}
          />

          <div className="space-y-1">
            {systemMenu.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* LOCATION */}
      {/* ------------------------------------------------ */}

      {!collapsed && (
        <div className="border-t border-white/10 p-3">
          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              bg-[#4A1234]
              px-3
              py-3
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-[#701A4D]
                text-pink-200
              "
            >
              <FiMapPin size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-pink-200/50">
                Location
              </p>

              <p className="truncate text-sm font-medium text-white">
                Chennai, India
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* COLLAPSED LOCATION */}
      {/* ------------------------------------------------ */}

      {collapsed && (
        <div className="border-t border-white/10 p-3">
          <div
            title="Chennai, India"
            className="
              flex
              h-11
              items-center
              justify-center
              rounded-xl
              bg-[#4A1234]
              text-pink-200
            "
          >
            <FiMapPin size={18} />
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* LOGOUT */}
      {/* ------------------------------------------------ */}

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          className={`
            flex
            w-full
            items-center
            rounded-xl
            px-3
            py-3
            text-sm
            text-pink-100/70
            transition
            duration-200
            hover:bg-[#5A163D]
            hover:text-white
            ${collapsed ? "justify-center" : "gap-3"}
          `}
          title={collapsed ? "Logout" : undefined}
        >
          <FiLogOut size={18} />

          {!collapsed && (
            <span>Logout</span>
          )}
        </button>
      </div>

      {/* ------------------------------------------------ */}
      {/* COLLAPSE BUTTON */}
      {/* ------------------------------------------------ */}

      <button
        type="button"
        onClick={onToggle}
        className="
          absolute
          -right-3
          top-[82px]
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          border
          border-[#7A2855]
          bg-[#4A1234]
          text-pink-200
          shadow-md
          transition
          hover:bg-[#701A4D]
          hover:text-white
        "
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <FiChevronRight size={15} />
        ) : (
          <FiChevronLeft size={15} />
        )}
      </button>
    </aside>
  );
}

/* ===================================================== */
/* SIDEBAR SECTION */
/* ===================================================== */

function SidebarSection({
  title,
  collapsed,
}: {
  title: string;
  collapsed: boolean;
}) {
  if (collapsed) {
    return (
      <div className="mb-3 h-px bg-white/10" />
    );
  }

  return (
    <div className="mb-3 px-3">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-pink-200/40">
        {title}
      </p>
    </div>
  );
}

/* ===================================================== */
/* SIDEBAR LINK */
/* ===================================================== */

function SidebarLink({
  item,
  collapsed,
}: {
  item: MenuItem;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `
        group
        flex
        items-center
        rounded-xl
        px-3
        py-3
        text-sm
        transition-all
        duration-200
        ${
          collapsed
            ? "justify-center"
            : "gap-3"
        }
        ${
          isActive
            ? "bg-[#701A4D] font-semibold text-white shadow-md shadow-black/10"
            : "text-pink-100/70 hover:bg-[#5A163D] hover:text-white"
        }
        `
      }
    >
      {({ isActive }) => (
        <>
          {/* ICON */}
          <span
            className={`
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-[17px]
              transition
              ${
                isActive
                  ? "bg-[#8C2862] text-pink-100"
                  : "bg-[#4A1234] text-pink-200/70 group-hover:bg-[#701A4D] group-hover:text-pink-100"
              }
            `}
          >
            {item.icon}
          </span>

          {!collapsed && (
            <>
              <span className="flex-1 truncate">
                {item.label}
              </span>

              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-pink-200" />
              )}
            </>
          )}
        </>
      )}
    </NavLink>
  );
}

export default Sidebar;