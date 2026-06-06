import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, BedDouble, DollarSign, Megaphone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: number; userId: number | null; title: string; message: string;
  type: "booking" | "payment" | "system" | "promotion" | "reminder";
  isRead: boolean; link: string | null; createdAt: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  booking: { icon: BedDouble, color: "text-primary", bg: "bg-primary/10" },
  payment: { icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
  system: { icon: Bell, color: "text-blue-400", bg: "bg-blue-400/10" },
  promotion: { icon: Megaphone, color: "text-purple-400", bg: "bg-purple-400/10" },
  reminder: { icon: Clock, color: "text-orange-400", bg: "bg-orange-400/10" },
};

export default function Notifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/notifications", { headers: h });
    if (res.ok) setNotifications(await res.json());
    setLoading(false);
  };

  useState(() => { load(); });

  const markRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH", headers: h });
    setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH", headers: h });
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--app-font-serif)] text-3xl font-bold">Notifications</h1>
            {unread > 0 && <p className="text-muted-foreground text-sm mt-1">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4 mr-1" />Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => {
              const cfg = typeConfig[n.type] ?? typeConfig.system;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${n.isRead ? "bg-card border-border opacity-60" : "bg-card border-primary/20 shadow-sm hover:border-primary/40"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm ${n.isRead ? "text-foreground/70" : ""}`}>{n.title}</p>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
