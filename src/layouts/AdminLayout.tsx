import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BedDouble, Calendar, Users, Star, Image, Sparkles, Settings,
  LogOut, Diamond, Menu, X, ChevronRight, DollarSign, Home, Tag, Activity,
  LifeBuoy, Award, Wrench
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Reservations",
    items: [
      { href: "/admin/bookings", label: "Bookings", icon: Calendar },
      { href: "/admin/payments", label: "Payments", icon: DollarSign },
      { href: "/admin/housekeeping", label: "Housekeeping", icon: Wrench },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/admin/rooms", label: "Rooms", icon: BedDouble },
      { href: "/admin/amenities", label: "Amenities", icon: Sparkles },
      { href: "/admin/gallery", label: "Gallery", icon: Image },
    ],
  },
  {
    label: "Guests",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/support-tickets", label: "Support", icon: LifeBuoy },
      { href: "/admin/loyalty", label: "Loyalty", icon: Award },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/promo-codes", label: "Promo Codes", icon: Tag },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/activity-logs", label: "Activity Logs", icon: Activity },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-sidebar-border shrink-0">
        <Link href="/admin" onClick={onClose} className="flex items-center gap-3">
          <Diamond className="w-6 h-6 text-primary" />
          <div>
            <div className="font-[family-name:var(--app-font-serif)] font-bold text-sidebar-foreground leading-none">Grand Azure</div>
            <div className="text-[9px] tracking-[0.2em] text-primary uppercase mt-0.5">Admin Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60 px-3 mb-1">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = href === "/admin" ? location === "/admin" : location.startsWith(href);
                return (
                  <Link key={href} href={href} onClick={onClose}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer group ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}>
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground"}`} />
                      <span className="flex-1">{label}</span>
                      {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg bg-sidebar-accent/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-sidebar-foreground transition-colors py-1.5 rounded-md hover:bg-sidebar-accent">
              <Home className="w-3.5 h-3.5" />View Site
            </button>
          </Link>
          <button onClick={logout} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors py-1.5 rounded-md hover:bg-destructive/10">
            <LogOut className="w-3.5 h-3.5" />Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar — fixed */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-sidebar border-r border-sidebar-border flex-col fixed top-0 left-0 bottom-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-60 bg-sidebar border-r border-sidebar-border flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <span className="font-semibold text-sidebar-foreground">Menu</span>
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content area — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-4 px-4 h-14 border-b border-border bg-card sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-foreground hover:text-primary transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-[family-name:var(--app-font-serif)] font-semibold text-sm">Grand Azure Admin</span>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
