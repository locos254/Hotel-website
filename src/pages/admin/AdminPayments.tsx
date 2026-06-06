import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, CheckCircle2, Clock, XCircle, RefreshCw, Search, TrendingUp, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Payment {
  id: number; bookingId: number; userId: number; amount: number; currency: string;
  status: "pending" | "paid" | "failed" | "refunded"; method: string; paymentRef: string;
  paystackRef: string | null; promoCode: string | null; discountAmount: number;
  paidAt: string | null; createdAt: string; userName: string | null; userEmail: string | null;
}

const statusBadge: Record<string, string> = {
  paid: "bg-green-500/10 text-green-500 border border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  failed: "bg-red-500/10 text-red-500 border border-red-500/20",
  refunded: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, refunded: 0, count: 0, paidCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("proofly_token");
  const h = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    const [p, s] = await Promise.all([
      fetch("/api/payments", { headers: h }).then(r => r.json()),
      fetch("/api/payments/stats", { headers: h }).then(r => r.json()),
    ]);
    setPayments(Array.isArray(p) ? p : []);
    setStats(s);
    setLoading(false);
  };

  useState(() => { load(); });

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/payments/${id}`, { method: "PATCH", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) { toast.success("Payment updated"); load(); } else toast.error("Failed to update");
  };

  const filtered = payments.filter(p =>
    (p.userEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.paymentRef ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: "Total Revenue", value: `$${stats.paid.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-green-500" },
    { label: "Pending", value: `$${stats.pending.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: Clock, color: "text-yellow-500" },
    { label: "Refunded", value: `$${stats.refunded.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: RefreshCw, color: "text-blue-400" },
    { label: "Paid Transactions", value: stats.paidCount, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--app-font-serif)]">Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">Track and manage all payment transactions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(c => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-xs">{c.label}</p>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <p className="text-xl font-bold">{c.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, email, ref..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  {["Ref", "Guest", "Booking", "Amount", "Discount", "Method", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.paymentRef?.slice(-8)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.userName ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{p.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">#{p.bookingId}</td>
                    <td className="px-4 py-3 font-semibold text-primary">${p.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {p.discountAmount > 0 ? <span className="text-green-500">-${p.discountAmount.toFixed(2)}{p.promoCode ? ` (${p.promoCode})` : ""}</span> : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground text-xs"><CreditCard className="w-3 h-3 inline mr-1" />{p.method}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {p.status === "pending" && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-green-500 hover:text-green-400" onClick={() => updateStatus(p.id, "paid")}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {p.status === "paid" && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-400 hover:text-blue-300" onClick={() => updateStatus(p.id, "refunded")}>
                            <RefreshCw className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {p.status === "pending" && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-300" onClick={() => updateStatus(p.id, "failed")}>
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No payments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
