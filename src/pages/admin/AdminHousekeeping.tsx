import { useState } from "react";
import { motion } from "framer-motion";
import { BedDouble, CheckCircle2, AlertTriangle, Wrench, RefreshCw, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type HKStatus = "clean" | "dirty" | "in_progress" | "maintenance" | "inspecting";

interface HKRecord {
  id: number; roomId: number; status: HKStatus; assignedTo: number | null; notes: string | null;
  lastCleaned: string | null; updatedAt: string; roomName: string | null; roomNumber: string | null;
  roomType: string | null; assigneeName: string | null;
}

const statusConfig: Record<HKStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  clean: { label: "Clean", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
  dirty: { label: "Dirty", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  in_progress: { label: "In Progress", icon: Loader2, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
  maintenance: { label: "Maintenance", icon: Wrench, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  inspecting: { label: "Inspecting", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
};

export default function AdminHousekeeping() {
  const [rooms, setRooms] = useState<HKRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const token = localStorage.getItem("proofly_token");
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/housekeeping", { headers: h });
    const data = await res.json();
    if (Array.isArray(data) && data.length === 0) {
      // Initialize records if empty
      await fetch("/api/housekeeping/init", { method: "POST", headers: h });
      const res2 = await fetch("/api/housekeeping", { headers: h });
      setRooms(await res2.json());
    } else {
      setRooms(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  useState(() => { load(); });

  const updateRoom = async (roomId: number, status: HKStatus, notes?: string) => {
    setUpdating(roomId);
    const res = await fetch(`/api/housekeeping/${roomId}`, { method: "PATCH", headers: h, body: JSON.stringify({ status, notes }) });
    if (res.ok) { toast.success("Status updated"); load(); } else toast.error("Failed");
    setUpdating(null);
  };

  const counts = Object.keys(statusConfig).reduce((acc, s) => {
    acc[s] = rooms.filter(r => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--app-font-serif)]">Housekeeping</h1>
          <p className="text-muted-foreground text-sm mt-1">Track room cleaning and maintenance status</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className={`rounded-xl p-3 border ${cfg.bg} text-center`}>
            <cfg.icon className={`w-5 h-5 mx-auto mb-1 ${cfg.color}`} />
            <p className={`text-lg font-bold ${cfg.color}`}>{counts[key] ?? 0}</p>
            <p className="text-xs text-muted-foreground">{cfg.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => {
            const cfg = statusConfig[room.status];
            return (
              <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{room.roomName ?? `Room ${room.roomId}`}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{room.roomType} · #{room.roomNumber}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                    <cfg.icon className="w-3 h-3" />{cfg.label}
                  </span>
                </div>
                {room.notes && <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2">{room.notes}</p>}
                {room.lastCleaned && <p className="text-xs text-muted-foreground">Last cleaned: {new Date(room.lastCleaned).toLocaleString()}</p>}
                <div className="flex gap-2 pt-1">
                  <Select defaultValue={room.status} onValueChange={(v) => updateRoom(room.roomId, v as HKStatus)}>
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([k, c]) => (
                        <SelectItem key={k} value={k}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {updating === room.roomId && <Loader2 className="w-4 h-4 animate-spin text-primary mt-2" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
