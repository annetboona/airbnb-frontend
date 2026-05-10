import type { RegistrationRole, UserRole } from "../../feactures/auth/types";


export interface RoleNavItem {
  label: string;
  path: string;
}


export interface RoleOption {
  value: RegistrationRole;
  label: string;
  description: string;
}


export const roleOptions: RoleOption[] = [
  {
    value: "guest",
    label: "Guest",
    description: "Browse stays and review bookings.",
  },
  {
    value: "host",
    label: "Host",
    description: "Manage listings and approve reservations.",
  },
];


export const publicNavigation: RoleNavItem[] = [
  { label: "Home", path: "/" },
  { label: "Listings", path: "/listings" },
];


export const roleNavigation: Record<UserRole, RoleNavItem[]> = {
  guest: [
    { label: "Home", path: "/" },
    { label: "Listings", path: "/listings" },
    { label: "Bookings", path: "/dashboard" },
  ],
  host: [
    { label: "Home", path: "/" },
    { label: "Listings", path: "/listings" },
    { label: "My Listings", path: "/dashboard" },
  ],
  admin: [
    { label: "Home", path: "/" },
    { label: "Listings", path: "/listings" },
    { label: "Admin Dashboard", path: "/dashboard" },
  ],
};


export const roleDashLabels: Record<UserRole, string> = {
  guest: "Bookings",
  host: "My Listings",
  admin: "Admin Dashboard",
};


export const roleSummaries: Record<UserRole, string> = {
  guest: "Review your booking history and jump back into the listings you saved.",
  host: "Manage your listings, approve requests, and keep your inventory up to date.",
  admin: "Monitor booking health, occupancy, and platform-wide performance.",
};


export function getNavigationItems(role: UserRole | null) {
  return role ? roleNavigation[role] : publicNavigation;
}


export function getDashboardLabel(role: UserRole | null) {
  return role ? roleDashLabels[role] : "Dashboard";
}


export function getRoleSummary(role: UserRole | null) {
  return role ? roleSummaries[role] : "Sign in to switch the interface to a role-aware experience.";
}
