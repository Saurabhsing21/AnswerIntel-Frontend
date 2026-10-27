import { type Icon, ChartLine, ChatsCircle, ClockCounterClockwise, Gear, House, ListChecks, Users, UsersThree } from "@phosphor-icons/react";

/** The app's sections, grouped by the question each answers: how am I doing, why does AI skip me, and what do I fix.
 * One icon family (Phosphor, regular weight) everywhere. */
export const NAV = [
  {
    label: "Results",
    items: [
      { href: "", label: "Overview", icon: House },
      { href: "/reports", label: "Reports", icon: ChartLine },
    ],
  },
  {
    label: "Why you're missing",
    items: [
      { href: "/prompts", label: "Buyer questions", icon: ChatsCircle },
      { href: "/competitors", label: "Competitors & sources", icon: Users },
    ],
  },
  {
    label: "Fix it",
    items: [{ href: "/opportunities", label: "To-do", icon: ListChecks }],
  },
] as const;

/** Project pages people need now and then. They live in the account menu, not the main nav. */
export const ACCOUNT_NAV = [
  { href: "/scans", label: "Scan history", icon: ClockCounterClockwise },
  { href: "/settings", label: "Project settings", icon: Gear },
  { href: "/billing", label: "Plan & people", icon: UsersThree },
] as const;

export type NavItem = { href: string; label: string; icon: Icon };
