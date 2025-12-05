import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import RoomMemberBooking from "./pages/test/RoomBookingMember.tsx"
import { userWho } from "../config/apis.ts";
import ClubRequestForm from "./pages/test/ClubRequestForm.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: userWho,
    enabled: true,
    retry: 1
  });

  if (isLoading) return null; // or a loader component

  // If user not logged in → redirect to /auth
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Otherwise, allow access
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="test/booking/room/member" element={<RoomMemberBooking/>}/>
            <Route path="test/affiliated/request" element={<ClubRequestForm/>}/>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Members />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admins"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Admins />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/types"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RoomTypes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Rooms />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/rooms"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RoomBookings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/halls"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Halls />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/halls"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HallBookings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lawns/categories"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LawnCategories />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lawns"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Lawns />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/lawns"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LawnBookings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/photoshoot"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Photoshoot />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/photoshoot"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PhotoshootBookings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Sports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Accounts />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/affiliated-clubs"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AffiliatedClubs />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Calendar />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
