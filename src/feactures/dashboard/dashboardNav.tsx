import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  UserCircle,
  CalendarCheck,
  Compass,
  MessageSquare,
  PlusCircle,
  List,
  Sparkles,
  BarChart2,
  Users,
  GitPullRequestIcon,
  UserPlus,
} from "lucide-react"
import type { AuthRole } from "../auth/context/AuthContext"

export type SidebarNavItem = {
  label: string
  to: string
  Icon: LucideIcon
}

export type SidebarGroup = { heading: string; items: SidebarNavItem[] }

export function getDashboardNav(role: AuthRole): SidebarGroup[] {
  const profile: SidebarGroup = {
    heading: "Account",
    items: [{ label: "Profile", to: "/dashboard/profile", Icon: UserCircle }],
  }

  if (role === "GUEST") {
    return [
      {
        heading: "Guest",
        items: [
          { label: "Overview",       to: "/dashboard/overview",      Icon: LayoutDashboard },
          { label: "My bookings",    to: "/dashboard/bookings",      Icon: CalendarCheck   },
          { label: "Book a listing", to: "/dashboard/find-stay",     Icon: Compass         },
          { label: "AI assistant",   to: "/dashboard/assistant",     Icon: MessageSquare   },
          { label: "Become a Host",  to: "/dashboard/become-host",   Icon: UserPlus        },
        ],
      },
      profile,
    ]
  }

  if (role === "HOST") {
    return [
      {
        heading: "Host",
        items: [
          { label: "Overview",         to: "/dashboard/overview",       Icon: LayoutDashboard },
          { label: "My listings",      to: "/dashboard/my-listings",    Icon: List            },
          { label: "Create listing",   to: "/dashboard/listings/new",   Icon: PlusCircle      },
          { label: "Booking requests", to: "/dashboard/requests",       Icon: CalendarCheck   },
          { label: "Reviews",          to: "/dashboard/reviews",        Icon: MessageSquare   },
        ],
      },
      profile,
    ]
  }

  // ADMIN — first item is the default landing page
  return [
    {
      heading: "Admin",
      items: [
        { label: "Stats overview",  to: "/dashboard/admin/stats",          Icon: BarChart2          },
        { label: "All users",       to: "/dashboard/admin/users",          Icon: Users              },
        { label: "Host Requests",   to: "/dashboard/admin/host-requests",  Icon: GitPullRequestIcon },
      ],
    },
    profile,
  ]
}