import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";

import Home from "@/pages/Home";
import Rooms from "@/pages/Rooms";
import RoomDetail from "@/pages/RoomDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MyBookings from "@/pages/MyBookings";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import Wishlist from "@/pages/Wishlist";
import LoyaltyPage from "@/pages/LoyaltyPage";
import SupportPage from "@/pages/SupportPage";
import InvoicePage from "@/pages/InvoicePage";
import NotFound from "@/pages/not-found";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminRooms from "@/pages/admin/AdminRooms";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminAmenities from "@/pages/admin/AdminAmenities";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminHousekeeping from "@/pages/admin/AdminHousekeeping";
import AdminPromoCodes from "@/pages/admin/AdminPromoCodes";
import AdminActivityLogs from "@/pages/admin/AdminActivityLogs";
import AdminSupportTickets from "@/pages/admin/AdminSupportTickets";
import AdminLoyalty from "@/pages/admin/AdminLoyalty";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (adminOnly && !isAdmin) return <Redirect to="/" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={() => <PublicLayout><Home /></PublicLayout>} />
      <Route path="/rooms" component={() => <PublicLayout><Rooms /></PublicLayout>} />
      <Route path="/rooms/:id" component={() => <PublicLayout><RoomDetail /></PublicLayout>} />
      <Route path="/login" component={() => <PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" component={() => <PublicLayout><Register /></PublicLayout>} />

      {/* Guest portal */}
      <Route path="/my-bookings" component={() => <PublicLayout><ProtectedRoute component={MyBookings} /></PublicLayout>} />
      <Route path="/profile" component={() => <PublicLayout><ProtectedRoute component={Profile} /></PublicLayout>} />
      <Route path="/notifications" component={() => <PublicLayout><ProtectedRoute component={Notifications} /></PublicLayout>} />
      <Route path="/wishlist" component={() => <PublicLayout><ProtectedRoute component={Wishlist} /></PublicLayout>} />
      <Route path="/loyalty" component={() => <PublicLayout><ProtectedRoute component={LoyaltyPage} /></PublicLayout>} />
      <Route path="/support" component={() => <PublicLayout><ProtectedRoute component={SupportPage} /></PublicLayout>} />
      <Route path="/invoices" component={() => <PublicLayout><ProtectedRoute component={InvoicePage} /></PublicLayout>} />

      {/* Admin */}
      <Route path="/admin" component={() => <AdminLayout><ProtectedRoute component={AdminDashboard} adminOnly /></AdminLayout>} />
      <Route path="/admin/rooms" component={() => <AdminLayout><ProtectedRoute component={AdminRooms} adminOnly /></AdminLayout>} />
      <Route path="/admin/bookings" component={() => <AdminLayout><ProtectedRoute component={AdminBookings} adminOnly /></AdminLayout>} />
      <Route path="/admin/users" component={() => <AdminLayout><ProtectedRoute component={AdminUsers} adminOnly /></AdminLayout>} />
      <Route path="/admin/reviews" component={() => <AdminLayout><ProtectedRoute component={AdminReviews} adminOnly /></AdminLayout>} />
      <Route path="/admin/gallery" component={() => <AdminLayout><ProtectedRoute component={AdminGallery} adminOnly /></AdminLayout>} />
      <Route path="/admin/amenities" component={() => <AdminLayout><ProtectedRoute component={AdminAmenities} adminOnly /></AdminLayout>} />
      <Route path="/admin/settings" component={() => <AdminLayout><ProtectedRoute component={AdminSettings} adminOnly /></AdminLayout>} />
      <Route path="/admin/payments" component={() => <AdminLayout><ProtectedRoute component={AdminPayments} adminOnly /></AdminLayout>} />
      <Route path="/admin/housekeeping" component={() => <AdminLayout><ProtectedRoute component={AdminHousekeeping} adminOnly /></AdminLayout>} />
      <Route path="/admin/promo-codes" component={() => <AdminLayout><ProtectedRoute component={AdminPromoCodes} adminOnly /></AdminLayout>} />
      <Route path="/admin/activity-logs" component={() => <AdminLayout><ProtectedRoute component={AdminActivityLogs} adminOnly /></AdminLayout>} />
      <Route path="/admin/support-tickets" component={() => <AdminLayout><ProtectedRoute component={AdminSupportTickets} adminOnly /></AdminLayout>} />
      <Route path="/admin/loyalty" component={() => <AdminLayout><ProtectedRoute component={AdminLoyalty} adminOnly /></AdminLayout>} />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster richColors position="top-right" />
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
