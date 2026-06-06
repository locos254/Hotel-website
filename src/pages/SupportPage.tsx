import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, Plus, ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Ticket {
  id: number; subject: string; message: string;
  status: string; priority: string; adminReply: string | null;
  repliedAt: string | null; createdAt: string;
}

const statusBadge: Record<string, string> = {
  open: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  closed: "bg-muted text-muted-foreground border-border",
};

export default function SupportPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: "", message: "", priority: "medium" });
  const [saving, setSaving] = useState(false);
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/support-tickets", { headers: h });
    if (res.ok) setTickets(await res.json());
    setLoading(false);
  };

  useState(() => { load(); });

  const submit = async () => {
    if (!form.subject || !form.message) { toast.error("Subject and message required"); return; }
    setSaving(true);
    const res = await fetch("/api/support-tickets", { method: "POST", headers: h, body: JSON.stringify(form) });
    if (res.ok) {
      toast.success("Ticket submitted! We'll respond within 24 hours.");
      setShowForm(false);
      setForm({ subject: "", message: "", priority: "medium" });
      load();
    } else toast.error("Failed to submit ticket");
    setSaving(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--app-font-serif)] text-3xl font-bold">Support</h1>
            <p className="text-muted-foreground text-sm mt-1">We're here to help — 24/7 concierge support</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" />New Ticket
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold">New Support Request</h3>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of your issue" />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Message</Label>
                <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your issue in detail..." rows={4} />
              </div>
              <div className="flex gap-3">
                <Button onClick={submit} disabled={saving} className="bg-primary text-primary-foreground">
                  <Send className="w-4 h-4 mr-1" />{saving ? "Submitting..." : "Submit Ticket"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : tickets.length === 0 && !showForm ? (
          <div className="text-center py-20">
            <LifeBuoy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No tickets yet. How can we help?</p>
            <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground">Open a Ticket</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => (
              <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <LifeBuoy className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${statusBadge[t.status]}`}>{t.status.replace("_", " ")}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded === t.id ? "rotate-180" : ""}`} />
                  </div>
                </div>
                <AnimatePresence>
                  {expanded === t.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
                      <div className="p-4 space-y-3">
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Your message</p>
                          <p className="text-sm leading-relaxed">{t.message}</p>
                        </div>
                        {t.adminReply ? (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                            <p className="text-xs text-primary mb-1">Staff reply · {t.repliedAt ? new Date(t.repliedAt).toLocaleDateString() : ""}</p>
                            <p className="text-sm leading-relaxed">{t.adminReply}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Awaiting response from our team...</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
