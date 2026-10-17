import { ChartLine, ClockCounterClockwise, Flask, Gear, Hash, House, Lightbulb, Link as LinkIcon, Users, UsersThree } from "@phosphor-icons/react";

/** The app's sections. One icon family (Phosphor, regular weight) everywhere. */
export const NAV = [
  {
    label: "General",
    items: [
      { href: "", label: "Overview", icon: House },
      { href: "/prompts", label: "Prompts", icon: Hash },
      { href: "/competitors", label: "Competitors", icon: Users },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/sources", label: "Sources", icon: LinkIcon },
      { href: "/opportunities", label: "Opportunities", icon: Lightbulb },
    ],
  },
  {
    label: "Track",
    items: [
      { href: "/experiments", label: "Experiments", icon: Flask },
      { href: "/reports", label: "Reports", icon: ChartLine },
      { href: "/scans", label: "Scan history", icon: ClockCounterClockwise },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/settings", label: "Settings", icon: Gear },
      { href: "/team", label: "Team", icon: UsersThree },
    ],
  },
] as const;
