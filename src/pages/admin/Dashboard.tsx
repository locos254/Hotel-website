import { motion } from "framer-motion";
import { BedDouble, Calendar, Users, DollarSign, TrendingUp, Star, Clock, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useGetDashboardStats, useGetRecentBookings, useGetRevenueStats } from "@workspace/api-client-react";
import type { Booking } from "@workspace/api-client-react";

function StatCard({ icon: Icon, label, value, sub, color = "primary" }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-3xl font-bold mt-1 text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10`}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  checked_in: "bg-green-500/10 text-green-600 border-green-500/20",
  checked_out: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminDashboard() {
  const { data: stats } = useGetDashboardStats();
  const { data: recentBookings } = useGetRecentBookings({ limit: 8 });
  const { data: revenueData } = useGetRevenueStats();

  const bookings: Booking[] = (recentBookings as { bookings?: Booking[] })?.bookings
    ?? (Array.isArray(recentBookings) ? (recentBookings as Booking[]) : []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--app-font-serif)] text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, overview of Grand Azure Hotel</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={stats ? `$${Number(stats.totalRevenue).toLocaleString()}` : "—"}
          sub="All time"
        />
        <StatCard
          icon={Calendar}
          label="Total Bookings"
          value={stats?.totalBookings ?? "—"}
          sub={`${stats?.pendingBookings ?? 0} pending`}
        />
        <StatCard
          icon={BedDouble}
          label="Rooms"
          value={stats?.totalRooms ?? "—"}
          sub={`${stats?.availableRooms ?? 0} available`}
        />
        <StatCard
          icon={Users}
          label="Registered Users"
          value={stats?.totalUsers ?? "—"}
          sub="Total accounts"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Checked In" value={stats?.checkedInBookings ?? "—"} sub="Currently in house" />
        <StatCard icon={Star} label="Avg. Rating" value={stats ? `${Number(stats.averageRating ?? 0).toFixed(1)} ★` : "—"} sub="Guest reviews" />
        <StatCard icon={Clock} label="Revenue Today" value={stats ? `$${Number(stats.revenueToday ?? 0).toLocaleString()}` : "—"} sub="Today's earnings" />
      </div>

      {/* Charts */}
      {revenueData && Array.isArray(revenueData) && revenueData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold mb-4">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold mb-4">Bookings Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent bookings */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Recent Bookings</h2>
          <span className="text-xs text-muted-foreground">Latest 8</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Guest</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Room</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Check-in</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Check-out</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Total</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm">{(b as { userName?: string }).userName || `User #${b.userId}`}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{(b as { roomName?: string }).roomName || `Room #${b.roomId}`}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(b.checkIn)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(b.checkOut)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-primary">${Number(b.totalPrice).toFixed(0)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${statusBadge[b.status] ?? statusBadge.pending}`}>
                      {b.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
