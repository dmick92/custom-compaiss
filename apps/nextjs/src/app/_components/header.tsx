"use client";

import Link from "next/link";
import { BookOpenIcon, InfoIcon, LifeBuoyIcon } from "lucide-react";

import Logo from "~/app/_components/logo";
import { ModeToggle } from "~/app/_components/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/app/_components/navigation-menu";
import UserMenu from "~/app/_components/user-menu";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { env } from "~/env";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  {
    label: "Plan",
    submenu: true,
    type: "description",
    items: [
      {
        href: "/plan/strategies",
        label: "Strategies",
        description: "Browse all strategies in the library.",
      },
      {
        href: "/plan/goals",
        label: "Goals",
        description: "Browse all goals in the library.",
      },
      {
        href: "/plan/processes",
        label: "Processes",
        description: "Browse all processes in the library.",
      },
    ],
  },
  {
    label: "Enact",
    submenu: true,
    type: "description",
    items: [
      {
        href: "/enact/projects",
        label: "Projects",
        description: "Browse all projects in the library.",
      },
      {
        href: "/enact/communications",
        label: "Communications",
        description: "Browse all communications in the library.",
      },
      {
        href: "/enact/tasks",
        label: "Tasks",
        description: "Browse all tasks in the library.",
      },
    ],
  },
  {
    label: "Review",
    submenu: true,
    type: "description",
    items: [
      {
        href: "/review/analysis",
        label: "Analysis",
        description: "Browse all analysis in the library.",
      },
      {
        href: "/review/reports",
        label: "Reports",
        description: "Browse all reports in the library.",
      },
      {
        href: "/review/dashboards",
        label: "Dashboards",
        description: "Browse all dashboards in the library.",
      },
    ],
  },
  {
    label: "Adapt",
    submenu: true,
    type: "description",
    items: [
      {
        href: "/adapt/marketplace",
        label: "Marketplace",
        description: "Browse all marketplace in the library.",
      },
      {
        href: "/adapt/optimize",
        label: "Optimize",
        description: "Browse all optimize in the library.",
      },
      {
        href: "/adapt/train",
        label: "Train",
        description: "Browse all train in the library.",
      },
    ],
  },
  // {
  //   label: "Pricing",
  //   submenu: true,
  //   type: "simple",
  //   items: [
  //     { href: "#", label: "Product A" },
  //     { href: "#", label: "Product B" },
  //     { href: "#", label: "Product C" },
  //     { href: "#", label: "Product D" },
  //   ],
  // },
  // {
  //   label: "About",
  //   submenu: true,
  //   type: "icon",
  //   items: [
  //     { href: "#", label: "Getting Started", icon: "BookOpenIcon" },
  //     { href: "#", label: "Tutorials", icon: "LifeBuoyIcon" },
  //     { href: "#", label: "About Us", icon: "InfoIcon" },
  //   ],
  // },
];

const devLinks = [
  {
    label: "Dev",
    submenu: true,
    type: "description",
    items: [
      {
        href: "/plan/process-designer",
        label: "Process Designer",
        description: "Design and manage custom processes. (TO BE REMOVED FROM MENU)",
      },
    ],
  },

];

export default function Header() {
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                size="icon"
                variant="ghost"
              >
                <svg
                  className="pointer-events-none"
                  fill="none"
                  height={16}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width={16}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Menu</title>
                  <path
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                    d="M4 12L20 12"
                  />
                  <path
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                    d="M4 12H20"
                  />
                  <path
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                    d="M4 12H20"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem className="w-full" key={index}>
                      {link.submenu ? (
                        <>
                          <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                            {link.label}
                          </div>
                          <ul>
                            {link.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <NavigationMenuLink
                                  className="py-1.5"
                                  href={item.href}
                                >
                                  {item.label}
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <NavigationMenuLink className="py-1.5" href={link.href}>
                          {link.label}
                        </NavigationMenuLink>
                      )}
                      {/* Add separator between different types of items */}
                      {index < navigationLinks.length - 1 &&
                        // Show separator if:
                        // 1. One is submenu and one is simple link OR
                        // 2. Both are submenus but with different types
                        ((!link.submenu &&
                          navigationLinks[index + 1]?.submenu) ??
                          (link.submenu &&
                            !navigationLinks[index + 1]?.submenu) ??
                          (link.submenu &&
                            navigationLinks[index + 1]?.submenu &&
                            link.type !==
                            navigationLinks[index + 1]?.type)) && (
                          <div
                            aria-hidden="true"
                            aria-label="Separator"
                            aria-orientation="horizontal"
                            aria-valuenow={0}
                            className="bg-border -mx-1 my-1 h-px w-full"
                            role="separator"
                            tabIndex={-1}
                          />
                        )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Link className="text-primary hover:text-primary/90" href="/">
              <Logo />
            </Link>
            {/* Navigation menu */}
            <NavigationMenu className="max-md:hidden" viewport={false}>
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    {link.submenu ? (
                      <>
                        <NavigationMenuTrigger className="text-muted-foreground hover:text-primary bg-transparent px-2 py-1.5 font-medium *:[svg]:-me-0.5 *:[svg]:size-3.5">
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="data-[motion=from-end]:slide-in-from-right-16! data-[motion=from-start]:slide-in-from-left-16! data-[motion=to-end]:slide-out-to-right-16! data-[motion=to-start]:slide-out-to-left-16! z-50 p-1">
                          <ul
                            className={cn(
                              link.type === "description"
                                ? "min-w-64"
                                : "min-w-48",
                            )}
                          >
                            {link.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <NavigationMenuLink
                                  className="py-1.5"
                                  href={item.href}
                                >
                                  {/* Display icon if present */}
                                  {link.type === "icon" && "icon" in item && (
                                    <div className="flex items-center gap-2">
                                      {item.icon === "BookOpenIcon" && (
                                        <BookOpenIcon
                                          aria-hidden="true"
                                          className="text-foreground opacity-60"
                                          size={16}
                                        />
                                      )}
                                      {item.icon === "LifeBuoyIcon" && (
                                        <LifeBuoyIcon
                                          aria-hidden="true"
                                          className="text-foreground opacity-60"
                                          size={16}
                                        />
                                      )}
                                      {item.icon === "InfoIcon" && (
                                        <InfoIcon
                                          aria-hidden="true"
                                          className="text-foreground opacity-60"
                                          size={16}
                                        />
                                      )}
                                      <span>{item.label}</span>
                                    </div>
                                  )}

                                  {/* Display label with description if present */}
                                  {link.type === "description" &&
                                    "description" in item ? (
                                    <div className="space-y-1">
                                      <div className="font-medium">
                                        {item.label}
                                      </div>
                                      <p className="text-muted-foreground line-clamp-2 text-xs">
                                        {item.description}
                                      </p>
                                    </div>
                                  ) : (
                                    // Display simple label if not icon or description type
                                    !link.type ||
                                    (link.type !== "icon" &&
                                      link.type !== "description" && (
                                        <span>{item.label}</span>
                                      ))
                                  )}
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink
                        className="text-muted-foreground hover:text-primary py-1.5 font-medium"
                        href={link.href}
                      >
                        {link.label}
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          {env.NODE_ENV === "development" && (
            <NavigationMenu className="max-md:hidden" viewport={false}>
              <NavigationMenuList className="gap-2">
                {devLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>

                    <>
                      <NavigationMenuTrigger className="text-muted-foreground hover:text-primary bg-transparent px-2 py-1.5 font-medium *:[svg]:-me-0.5 *:[svg]:size-3.5">
                        {link.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="data-[motion=from-end]:slide-in-from-right-16! data-[motion=from-start]:slide-in-from-left-16! data-[motion=to-end]:slide-out-to-right-16! data-[motion=to-start]:slide-out-to-left-16! z-50 p-1">
                        <ul
                          className={cn(
                            link.type === "description"
                              ? "min-w-64"
                              : "min-w-48",
                          )}
                        >
                          {link.items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <NavigationMenuLink
                                className="py-1.5"
                                href={item.href}
                              >
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {item.label}
                                  </div>
                                  <p className="text-muted-foreground line-clamp-2 text-xs">
                                    {item.description}
                                  </p>
                                </div>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
