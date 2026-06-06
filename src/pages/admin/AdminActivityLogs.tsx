import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, RefreshCw, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Log {
  id: number; userId: number | null; action: string; entity: string | null; entityId: number | null;
  details: string | null; ipAddress: string | null; userAgent: string | null; createdAt: string;
  userName: string | null; userEmail: string | null;
}

const actionColor: Record<string, string> = {
  create: "text-green-500", update: "text-blue-400", delete: "text-red-400",
  login: "text-primary", logout: "text-muted-foreground", housekeeping_update: "text-orange-400",
};

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("proofly_token");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/activity-logs?limit=200", { headers: { Authorization: `Bearer ${token}` } });
    setLogs(await res.json());
    setLoading(false);
  };

  useState(() => { load(); });

  const filtered = logs.filter(l =>
    (l.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (l.action ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (l.entity ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--app-font-serif)]">Activity Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Audit trail of all system actions</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  {["Time", "User", "Action", "Entity", "Details", "IP"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(log => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {log.userName ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs font-medium">{log.userName}</p>
                            <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                          </div>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">System</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Activity className={`w-3.5 h-3.5 ${actionColor[log.action.split("_")[0]] ?? "text-muted-foreground"}`} />
                        <span className={`text-xs font-mono font-medium ${actionColor[log.action.split("_")[0]] ?? "text-foreground"}`}>{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{log.entity ?? "—"}{log.entityId ? ` #${log.entityId}` : ""}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{log.details ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{log.ipAddress ?? "—"}</td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No activity logs yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
