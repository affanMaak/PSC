import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import logo from "@/assets/psc_logo_gold.png";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BedDouble,
  Building2,
  Trees,
  Camera,
  Trophy,
  ChevronDown,
  Wallet,
  Building,
  CalendarDays,
  Bell,
  Lock
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { userWho } from "../../config/apis";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Members", url: "/members", icon: Users },
  { title: "Accounts", url: "/accounts", icon: Wallet },
  { title: "Admins", url: "/admins", icon: UserCog },
  {
    title: "Rooms",
    icon: BedDouble,
    items: [
      { title: "Room Types", url: "/rooms/types" },
      { title: "Manage Rooms", url: "/rooms" },
      { title: "Room Bookings", url: "/bookings/rooms" },
    ],
  },
  {
    title: "Halls",
    icon: Building2,
    items: [
      { title: "Manage Halls", url: "/halls" },
      { title: "Hall Bookings", url: "/bookings/halls" },
    ],
  },
  {
    title: "Lawns",
    icon: Trees,
    items: [
      { title: "Lawn Categories", url: "/lawns/categories" },
      { title: "Manage Lawns", url: "/lawns" },
      { title: "Lawn Bookings", url: "/bookings/lawns" },
    ],
  },
  {
    title: "Photoshoot",
    icon: Camera,
    items: [
      { title: "Manage Photoshoot", url: "/photoshoot" },
      { title: "Photoshoot Bookings", url: "/bookings/photoshoot" },
    ],
  },
  { title: "Sports", url: "/sports", icon: Trophy },
  { title: "Affiliated Clubs", url: "/affiliated-clubs", icon: Building },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: userWho,
    enabled: true
  });

  if (!currentUser) return null;

  const hasPermission = (title: string) => {
    if (currentUser.role === "SUPER_ADMIN") return true;
    return currentUser.permissions?.includes(title);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="px-3">
          <SidebarGroupLabel className="text-sidebar-foreground text-lg font-bold px-4 py-6 mb-2 flex items-center justify-start">
            {open ? (
              <img src={logo} alt="Peshawar Services" className="h-12 w-auto" />
            ) : (
              <img src={logo} alt="PS" className="h-8 w-auto" />
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                if (item.items) {
                  const isActive = item.items.some(sub => location.pathname === sub.url);
                  return (
                    <Collapsible key={item.title} defaultOpen={isActive} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title} className={`py-2 ${isActive ? "bg-sidebar-accent" : ""}`}>
                            {item.icon && <item.icon className="h-5 w-5" />}
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4 space-y-1">
                            {item.items.map(subItem => {
                              const allowed = hasPermission(subItem.title);
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink
                                      to={allowed ? subItem.url : "#"}
                                      className={`hover:bg-sidebar-accent/50 flex items-center justify-between py-1 ${!allowed ? "opacity-50 cursor-not-allowed" : ""}`}
                                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    >
                                      <span>{subItem.title}</span>
                                      {!allowed && <Lock className="h-4 w-4 ml-2" />}
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                const allowed = hasPermission(item.title);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={allowed ? item.url : "#"}
                        className={`hover:bg-sidebar-accent/50 py-2 flex items-center ${!allowed ? "opacity-50 cursor-not-allowed" : ""}`}
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                        <span>{item.title}</span>
                        {!allowed && <Lock className="h-4 w-4 ml-2" />}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
