import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Admins from "./pages/Admins";
import RoomTypes from "./pages/RoomTypes";
import Rooms from "./pages/Rooms";
import RoomBookings from "./pages/RoomBookings";
import Halls from "./pages/Halls";
import HallBookings from "./pages/HallBookings";
import LawnCategories from "./pages/LawnCategories";
import Lawns from "./pages/Lawns";
import LawnBookings from "./pages/LawnBookings";
import Photoshoot from "./pages/Photoshoot";
import PhotoshootBookings from "./pages/PhotoshootBookings";
import Sports from "./pages/Sports";
import Accounts from "./pages/Accounts";
import AffiliatedClubs from "./pages/AffiliatedClubs";
import Notifications from "./pages/Notifications";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage"; 
import RoomMemberBooking from "./pages/test/RoomBookingMember"
import { userWho } from "../config/apis";
import ClubRequestForm from "./pages/test/ClubRequestForm";
import PermissionDenied from "./pages/PermissionDenied";
import Bookings from "./pages/Bookings";
import Content from "./pages/Content";

const queryClient = new QueryClient();

// Map routes to permission titles from your API
const ROUTE_TO_PERMISSION_MAP: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/members": "Members",
  "/accounts": "Accounts",
  "/admins": "Admins",
  "/rooms/types": "Room Types",
  "/rooms": "Rooms",
  "/bookings/rooms": "Room Bookings",
  "/halls": "Halls",
  "/bookings/halls": "Hall Bookings",
  "/lawns/categories": "Lawn Categories",
  "/lawns": "Lawns",
  "/bookings/lawns": "Lawn Bookings",
  "/photoshoot": "Photoshoot",
  "/bookings/photoshoot": "Photoshoot Bookings",
  "/sports": "Sports",
  "/affiliated-clubs": "Affiliated Clubs",
  "/notifications": "Notifications",
  "/calendar": "Calendar",
  "/contents": "Contents"
};

// All routes in order for redirect
const ALL_ROUTES = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/members", label: "Members" },
  { path: "/rooms", label: "Rooms" },
  { path: "/bookings/rooms", label: "Room Bookings" },
  { path: "/halls", label: "Halls" },
  { path: "/bookings/halls", label: "Hall Bookings" },
  { path: "/lawns", label: "Lawns" },
  { path: "/bookings/lawns", label: "Lawn Bookings" },
  { path: "/photoshoot", label: "Photoshoot" },
  { path: "/bookings/photoshoot", label: "Photoshoot Bookings" },
  { path: "/sports", label: "Sports" },
  { path: "/affiliated-clubs", label: "Affiliated Clubs" },
  { path: "/notifications", label: "Notifications" },
  { path: "/calendar", label: "Calendar" },
  { path: "/admins", label: "Admins" },
  { path: "/rooms/types", label: "Room Types" },
  { path: "/lawns/categories", label: "Lawn Categories" },
  { path: "/accounts", label: "Accounts" },
  { path: "/contents", label: "Contents" },
];

// Higher-order component to wrap pages with permission check
function withPermissions(Component: React.ComponentType, allowedRoles: string[] = []) {
  return function PermissionWrapper() {
    const location = useLocation();
    const { data: currentUser, isLoading } = useQuery({
      queryKey: ["currentUser"],
      queryFn: async () => {
        try {
          return await userWho();
        } catch (error) {
          return null;
        }
      },
      retry: 1
    });

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    // If no user, redirect to auth
    if (!currentUser) {
      return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
    }

    const userRole = currentUser.role?.toLowerCase() || 'restricted';
    const permissions = currentUser.permissions || [];

    // SUPER_ADMIN bypasses all permission checks
    if (userRole === 'super_admin') {
      return <Component />;
    }

    // For non-super admins, check if specific roles are required
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <Navigate to="/permission-denied" replace />;
    }

    // Get the permission title for this route
    const requiredPermission = ROUTE_TO_PERMISSION_MAP[location.pathname];
    
    // If no permission mapping exists, deny access
    if (!requiredPermission) {
      return <Navigate to="/permission-denied" replace />;
    }

    // Check if user has this permission
    if (!permissions.includes(requiredPermission)) {
      return <Navigate to="/permission-denied" replace />;
    }

    return <Component />;
  };
}

// Function to get first allowed route for a user
function getFirstAllowedRoute(currentUser: any): string {
  const userRole = currentUser.role?.toLowerCase() || 'restricted';
  const permissions = currentUser.permissions || [];

  // SUPER_ADMIN gets dashboard as first route
  if (userRole === 'super_admin') {
    return "/dashboard";
  }

  // Find the first route in ALL_ROUTES order that the user can access
  for (const route of ALL_ROUTES) {
    const requiredPermission = ROUTE_TO_PERMISSION_MAP[route.path];
    if (requiredPermission && permissions.includes(requiredPermission)) {
      return route.path;
    }
  }

  // Fallback to dashboard if no match found
  return "/dashboard";
}

// Custom hook to check if current user can access a specific route
export function useCanAccessRoute(routePath: string): boolean {
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        return await userWho();
      } catch (error) {
        return null;
      }
    }
  });

  if (!currentUser) return false;

  const userRole = currentUser.role?.toLowerCase() || 'restricted';
  const permissions = currentUser.permissions || [];

  // SUPER_ADMIN can access everything
  if (userRole === 'super_admin') {
    return true;
  }

  // Get the permission title for this route
  const requiredPermission = ROUTE_TO_PERMISSION_MAP[routePath];
  
  // If no permission mapping exists, deny access
  if (!requiredPermission) {
    return false;
  }

  // Check if user has this permission
  return permissions.includes(requiredPermission);
}

// Hook to get user's role info
export function useUserRole() {
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        return await userWho();
      } catch (error) {
        return null;
      }
    }
  });

  if (!currentUser) return { isSuperAdmin: false, role: 'guest', permissions: [] };

  const userRole = currentUser.role?.toLowerCase() || 'restricted';
  const permissions = currentUser.permissions || [];

  return {
    isSuperAdmin: userRole === 'super_admin',
    role: userRole,
    permissions: permissions
  };
}

// Root redirect based on user role - redirects to first allowed route
function RootRedirect() {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: userWho,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  const firstAllowedRoute = getFirstAllowedRoute(currentUser);
  
  return <Navigate to={firstAllowedRoute} replace />;
}

// Create protected page components
const ProtectedDashboard = withPermissions(Dashboard);
const ProtectedMembers = withPermissions(Members);
const ProtectedAdmins = withPermissions(Admins, ['super_admin']);
const ProtectedRoomTypes = withPermissions(RoomTypes, ['super_admin']);
const ProtectedRooms = withPermissions(Rooms);
const ProtectedRoomBookings = withPermissions(RoomBookings);
const ProtectedHalls = withPermissions(Halls);
const ProtectedHallBookings = withPermissions(HallBookings);
const ProtectedLawnCategories = withPermissions(LawnCategories, ['super_admin']);
const ProtectedLawns = withPermissions(Lawns);
const ProtectedLawnBookings = withPermissions(LawnBookings);
const ProtectedPhotoshoot = withPermissions(Photoshoot);
const ProtectedPhotoshootBookings = withPermissions(PhotoshootBookings);
const ProtectedSports = withPermissions(Sports);
const ProtectedAccounts = withPermissions(Accounts);
const ProtectedAffiliatedClubs = withPermissions(AffiliatedClubs);
const ProtectedNotifications = withPermissions(Notifications);
const ProtectedCalendar = withPermissions(Calendar);
const ProtectedBookings = withPermissions(Bookings);
const ProtectedContents = withPermissions(Content);

// Permission Denied page doesn't need permissions check
function PermissionDeniedPage() {
  return <PermissionDenied />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public test routes */}
            <Route path="test/booking/room/member" element={<RoomMemberBooking/>}/>
            <Route path="test/affiliated/request" element={<ClubRequestForm/>}/>
            
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/permission-denied" element={<PermissionDeniedPage />} />
            
            {/* Root redirect - goes to first allowed route */}
            <Route path="/" element={<RootRedirect />} />

            {/* Protected Routes with Layout */}
            <Route path="/dashboard" element={
              <Layout>
                <ProtectedDashboard />
              </Layout>
            } />
            <Route path="/members" element={
              <Layout>
                <ProtectedMembers />
              </Layout>
            } />
            <Route path="/admins" element={
              <Layout>
                <ProtectedAdmins />
              </Layout>
            } />
            <Route path="/rooms/types" element={
              <Layout>
                <ProtectedRoomTypes />
              </Layout>
            } />
            <Route path="/rooms" element={
              <Layout>
                <ProtectedRooms />
              </Layout>
            } />
            <Route path="/bookings/rooms" element={
              <Layout>
                <ProtectedRoomBookings />
              </Layout>
            } />
            <Route path="/halls" element={
              <Layout>
                <ProtectedHalls />
              </Layout>
            } />
            <Route path="/bookings/halls" element={
              <Layout>
                <ProtectedHallBookings />
              </Layout>
            } />
            <Route path="/lawns/categories" element={
              <Layout>
                <ProtectedLawnCategories />
              </Layout>
            } />
            <Route path="/lawns" element={
              <Layout>
                <ProtectedLawns />
              </Layout>
            } />
            <Route path="/bookings/lawns" element={
              <Layout>
                <ProtectedLawnBookings />
              </Layout>
            } />
            <Route path="/photoshoot" element={
              <Layout>
                <ProtectedPhotoshoot />
              </Layout>
            } />
            <Route path="/bookings/photoshoot" element={
              <Layout>
                <ProtectedPhotoshootBookings />
              </Layout>
            } />
            <Route path="/sports" element={
              <Layout>
                <ProtectedSports />
              </Layout>
            } />
            <Route path="/accounts" element={
              <Layout>
                <ProtectedAccounts />
              </Layout>
            } />
            <Route path="/affiliated-clubs" element={
              <Layout>
                <ProtectedAffiliatedClubs />
              </Layout>
            } />
            <Route path="/notifications" element={
              <Layout>
                <ProtectedNotifications />
              </Layout>
            } />
            <Route path="/calendar" element={
              <Layout>
                <ProtectedCalendar />
              </Layout>
            } />

            <Route path="/bookings" element={
              <Layout>
                <ProtectedBookings />
              </Layout>
            } />
            <Route path="/contents" element={
              <Layout>
                <ProtectedContents />
              </Layout>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;