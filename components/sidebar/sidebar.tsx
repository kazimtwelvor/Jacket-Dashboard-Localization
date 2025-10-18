"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import type { Store } from "@prisma/client";
import {
  LayoutDashboard,
  LayoutTemplate,
  ShoppingBag,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ImageIcon,
  ShoppingCart,
  Star,
  Layers,
  Users,
  Images,
  DollarSign,
  FileText,
  FileType,
  ClipboardList,
  Ticket,
  TestTube,
  Globe,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useStoreModal } from "@/hooks/use-store-modal";
import Link from "next/link";
import { debugLog, logProps } from "@/lib/debug-utils";
import StoreSwitcher from "./store-switcher";

interface SidebarProps {
  className?: string;
  items: Store[];
  memberStores?: Record<string, any>[];
}

export const Sidebar = ({
  className,
  items = [],
  memberStores = [],
}: SidebarProps) => {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const storeModal = useStoreModal();

  useEffect(() => {
    logProps("Sidebar", {
      ownedStoresCount: items.length,
      memberStoresCount: memberStores.length,
      ownedStores: items.map((store) => ({ id: store.id, name: store.name })),
      memberStores: memberStores.map((store) => ({
        id: store.id,
        name: store.name,
        role: store.role,
      })),
    });
  }, [items, memberStores]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "70px" : "240px"
    );
  }, [isCollapsed]);

  const routes = [
    {
      category: "Dashboard",
      items: [
        {
          href: `/${params?.storeId}`,
          label: "Overview",
          icon: LayoutDashboard,
          active: pathname === `/${params?.storeId}`,
        },
      ],
    },
    {
      category: "Content",
      items: [
        {
          href: `/${params?.storeId}/pages`,
          label: "Pages",
          icon: LayoutTemplate,
          active: pathname?.includes(`/${params?.storeId}/pages`),
        },
        {
          href: `/${params?.storeId}/blog`,
          label: "Blog",
          icon: FileText,
          active: pathname?.includes(`/${params?.storeId}/blog`),
        },
        {
          href: `/${params?.storeId}/category-page`,
          label: "Category Pages",
          icon: FileType,
          active: pathname?.includes(`/${params?.storeId}/category-page`),
        },
      ],
    },
    {
      category: "Products",
      items: [
        {
          href: `/${params?.storeId}/products`,
          label: "Products",
          icon: Package,
          active: pathname?.includes(`/${params?.storeId}/products`),
        },
        {
          href: `/${params?.storeId}/attributes`,
          label: "Attributes",
          icon: Layers,
          active:
            pathname?.includes(`/${params?.storeId}/attributes`) ||
            pathname?.includes(`/${params?.storeId}/categories`) ||
            pathname?.includes(`/${params?.storeId}/sizes`) ||
            pathname?.includes(`/${params?.storeId}/colors`),
        },
        {
          href: `/${params?.storeId}/images`,
          label: "Image Gallery",
          icon: Images,
          active: pathname?.includes(`/${params?.storeId}/images`),
        },
        {
          href: `/${params?.storeId}/draft`,
          label: "Draft",
          icon: FileText,
          active: pathname?.includes(`/${params?.storeId}/draft`),
        },
      ],
    },
    {
      category: "Sales",
      items: [
        {
          href: `/${params?.storeId}/orders`,
          label: "Orders",
          icon: ShoppingCart,
          active: pathname?.includes(`/${params?.storeId}/orders`),
        },
        {
          href: `/${params?.storeId}/reviews`,
          label: "Reviews",
          icon: Star,
          active: pathname?.includes(`/${params?.storeId}/reviews`),
        },

        {
          href: `/${params?.storeId}/forms`,
          label: "Forms",
          icon: ClipboardList,
          active: pathname?.includes(`/${params?.storeId}/forms`),
        },
        {
          href: `/${params?.storeId}/vouchers`,
          label: "Vouchers",
          icon: Ticket,
          active: pathname?.includes(`/${params?.storeId}/vouchers`),
        },
      ],
    },
    {
      category: "System",
      items: [
        {
          href: `/${params?.storeId}/settings`,
          label: "Settings",
          icon: Settings,
          active: pathname?.includes(`/${params?.storeId}/settings`),
        },
        {
          href: `/${params?.storeId}/countries`,
          label: "Countries",
          icon: Globe,
          active: pathname?.includes(`/${params?.storeId}/countries`),
        },
        {
          href: `/${params?.storeId}/settings/members`,
          label: "Team Members",
          icon: Users,
          active: pathname?.includes(`/${params?.storeId}/settings/members`),
        },

        {
          href: `/${params?.storeId}/settings/payments`,
          label: "Payments",
          icon: DollarSign,
          active: pathname?.includes(`/${params?.storeId}/settings/payments`),
        },
      ],
    },
    {
      category: "Testing",
      items: [
        {
          href: `/${params?.storeId}/testing/404-checker`,
          label: "404 Checker",
          icon: TestTube,
          active: pathname?.includes(`/${params?.storeId}/testing`),
        },
      ],
    },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const allStores = [
    ...items.map((store) => ({
      id: store.id,
      name: store.name,
      role: "Owner",
    })),
    ...memberStores.map((store) => ({
      id: store.id,
      name: store.name,
      role: store.role || "Member",
    })),
  ];

  debugLog("Sidebar", "Rendering with stores", {
    ownedStores: items.length,
    memberStores: memberStores.length,
    allStores: allStores.length,
  });

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 md:hidden text-white bg-[#243552] hover:bg-[#2d4266]"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full transition-all duration-300 ease-in-out border-r",
          "bg-gradient-to-b from-[#1a2942] to-[#121f34] border-[#2a3a56] shadow-lg",
          isCollapsed ? "w-[70px]" : "w-[240px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Store Switcher */}
          <div
            className={cn(
              "p-4 flex items-center border-b border-[#2a3a56]",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            {!isCollapsed && <StoreSwitcher items={allStores} />}
            {isCollapsed && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-[#243552] border-[#3a4d6b] text-white hover:bg-[#2d4266] hover:border-[#4a5d7b] transition-all"
                  >
                    <ShoppingBag className="h-4 w-4 text-[#4cc9f0]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  className="w-[200px] p-0 bg-[#243552] border-[#3a4d6b] shadow-xl"
                >
                  <Command className="bg-[#243552]">
                    <CommandList>
                      <CommandInput
                        placeholder="Search store..."
                        className="bg-[#243552] text-white placeholder-[#8a9cb8]"
                      />
                      <CommandEmpty className="text-[#8a9cb8]">
                        No store found.
                      </CommandEmpty>
                      <CommandGroup heading="Stores" className="text-[#8a9cb8]">
                        {allStores.map((store) => (
                          <CommandItem
                            key={store.id}
                            onSelect={() => router.push(`/${store.id}`)}
                            className="text-sm text-white hover:bg-[#2d4266] aria-selected:bg-[#2d4266]"
                          >
                            {store.name}
                            {store.id === params?.storeId && (
                              <span className="ml-auto text-[#4cc9f0]">✓</span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandSeparator className="bg-[#3a4d6b]" />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            storeModal.onOpen();
                          }}
                          className="text-white hover:bg-[#2d4266]"
                        >
                          <ShoppingBag className="mr-2 h-4 w-4 text-[#4cc9f0]" />
                          Create Store
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex text-[#8a9cb8] hover:text-white hover:bg-[#2d4266] transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-6 px-2">
              {routes.map((section, index) => (
                <div key={index} className="space-y-2">
                  {!isCollapsed && (
                    <h3 className="px-4 text-xs font-semibold text-[#8a9cb8] uppercase tracking-wider">
                      {section.category}
                    </h3>
                  )}
                  <ul className="space-y-1">
                    {section.items.map((route) => (
                      <li key={route.href}>
                        <Link
                          href={route.href}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                            route.active
                              ? "bg-gradient-to-r from-[#4361ee] to-[#4cc9f0] text-white shadow-md"
                              : "text-[#cbd5e1] hover:bg-[#243552] hover:text-white",
                            isCollapsed && "justify-center px-2"
                          )}
                        >
                          <route.icon
                            className={cn(
                              "h-5 w-5",
                              isCollapsed ? "mr-0" : "mr-3"
                            )}
                          />
                          {!isCollapsed && <span>{route.label}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* User Section */}
          <div
            className={cn(
              "border-t border-[#2a3a56] p-4",
              isCollapsed ? "flex justify-center" : "flex items-center"
            )}
          >
            <div className="bg-[#243552] rounded-full p-1 border border-[#3a4d6b] shadow-md">
              <UserButton afterSignOutUrl="/" />
            </div>
            {!isCollapsed && (
              <div className="ml-3 space-y-1">
                <p className="text-sm font-medium leading-none text-white">
                  Account
                </p>
                <p className="text-xs text-[#8a9cb8]">Manage your account</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
