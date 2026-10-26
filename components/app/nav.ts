import { ChartLine, ChatsCircle, ClockCounterClockwise, Gear, House, ListChecks, Users, UsersThree } from "@phosphor-icons/react";

/** The app's sections. The first group follows what people want after a scan: how am I doing, what did AI say
 * (and why), who beats me, and what to do next. One icon family (Phosphor, regular weight) everywhere. */
export const NAV = [
  {
    label: "Your AI visibility",
    items: [
      { href: "", label: "Overview", icon: House },
      { href: "/prompts", label: "Answers", icon: ChatsCircle },
      { href: "/competitors", label: "Competitors", icon: Users },
      { href: "/opportunities", label: "To-do", icon: ListChecks },
    ],
  },
  {
    label: "More",
    items: [
      { href: "/reports", label: "Reports", icon: ChartLine },
      { href: "/scans", label: "Scan history", icon: ClockCounterClockwise },
      { href: "/settings", label: "Settings", icon: Gear },
      { href: "/billing", label: "Plan & people", icon: UsersThree },
    ],
  },
] as const;
