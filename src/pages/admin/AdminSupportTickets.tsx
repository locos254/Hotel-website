import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, RefreshCw, ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Ticket {
  id: number; userId: number; subject: string; message: string;
  status: "open" | "in_progress" | "resolved" | "closed"; priority: "low" | "medium" | "high" | "urgent";
  adminReply: string | null; repliedAt: string | null; createdAt: string;
  userName: string | null; userEmail: string | null;
}

const statusBadge: Record<string, string> = {
  open: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  closed: "bg-muted text-muted-foreground border-border",
};
const priorityBadge: Record<string, string> = {
  low: "text-muted-foreground", medium: "text-blue-400", high: "text-orange-400", urgent: "text-red-400",
};

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [replyStatus, setReplyStatus] = useState<Record<number, string>>({});

  const token = localStorage.getItem("proofly_token");
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/support-tickets", { headers: h });
    setTickets(await res.json());
    setLoading(false);
  };

  useState(() => { load(); });

  const sendReply = async (id: number) => {
    if (!reply.trim()) return;
    const status = replyStatus[id] ?? "in_progress";
    const res = await fetch(`/api/support-tickets/${id}`, { method: "PATCH", headers: h, body: JSON.stringify({ adminReply: reply, status }) });
    if (res.ok) { toast.success("Reply sent"); setReply(""); setExpanded(null); load(); }
    else toast.error("Failed to send reply");
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/support-tickets/${id}`, { method: "PATCH", headers: h, body: JSON.stringify({ status }) });
    toast.success("Status updated"); load();
  };

  const counts = { open: tickets.filter(t => t.status === "open").length, in_progress: tickets.filter(t => t.status === "in_progress").length, resolved: tickets.filter(t => t.status === "resolved").length };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--app-font-serif)]">Support Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage guest support requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{ label: "Open", value: counts.open, color: "text-yellow-500" }, { label: "In Progress", value: counts.in_progress, color: "text-blue-400" }, { label: "Resolved", value: counts.resolved, color: "text-green-500" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <LifeBuoy className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.userName ?? "—"} · {t.userEmail}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium capitalize ${priorityBadge[t.priority]}`}>{t.priority}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${statusBadge[t.status]}`}>{t.status.replace("_", " ")}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded === t.id ? "rotate-180" : ""}`} />
                </div>
              </div>
              <AnimatePresence>
                {expanded === t.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
                    <div className="p-4 space-y-4">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Guest message</p>
                        <p className="text-sm">{t.message}</p>
                      </div>
                      {t.adminReply && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                          <p className="text-xs text-primary mb-1">Your reply · {t.repliedAt ? new Date(t.repliedAt).toLocaleDateString() : ""}</p>
                          <p className="text-sm">{t.adminReply}</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Select value={replyStatus[t.id] ?? t.status} onValueChange={v => setReplyStatus(s => ({ ...s, [t.id]: v }))}>
                            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          {!t.adminReply && <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "closed")}>Close without reply</Button>}
                        </div>
                        <Textarea placeholder="Write your reply..." value={expanded === t.id ? reply : ""} onChange={e => setReply(e.target.value)} rows={3} className="text-sm" />
                        <Button size="sm" onClick={() => sendReply(t.id)} className="bg-primary text-primary-foreground">
                          <Send className="w-3.5 h-3.5 mr-1" />Send Reply
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          {tickets.length === 0 && <div className="text-center py-16 text-muted-foreground">No support tickets yet</div>}
        </div>
      )}
    </div>
  );
}
