import { useState } from "react";
import { motion } from "framer-motion";
import { Star, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface LoyaltyAccount {
  id: number; userId: number; points: number; totalEarned: number; tier: string;
  updatedAt: string; userName: string | null; userEmail: string | null;
}

const tierConfig: Record<string, { color: string; bg: string; next: string; nextAt: number }> = {
  bronze: { color: "text-amber-600", bg: "bg-amber-600/10", next: "Silver", nextAt: 500 },
  silver: { color: "text-slate-400", bg: "bg-slate-400/10", next: "Gold", nextAt: 2000 },
  gold: { color: "text-yellow-400", bg: "bg-yellow-400/10", next: "Platinum", nextAt: 5000 },
  platinum: { color: "text-purple-400", bg: "bg-purple-400/10", next: "—", nextAt: Infinity },
};

export default function AdminLoyalty() {
  const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjust, setShowAdjust] = useState<number | null>(null);
  const [adjustForm, setAdjustForm] = useState({ points: "", description: "", type: "bonus" });

  const token = localStorage.getItem("proofly_token");
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/loyalty/all", { headers: h });
    setAccounts(await res.json());
    setLoading(false);
  };

  useState(() => { load(); });

  const adjust = async (userId: number) => {
    if (!adjustForm.points || !adjustForm.description) { toast.error("Points and description required"); return; }
    const res = await fetch("/api/loyalty/adjust", { method: "POST", headers: h, body: JSON.stringify({ userId, points: parseInt(adjustForm.points), description: adjustForm.description, type: adjustForm.type }) });
    if (res.ok) { toast.success("Points adjusted"); setShowAdjust(null); setAdjustForm({ points: "", description: "", type: "bonus" }); load(); }
    else toast.error("Failed");
  };

  const tierCounts = Object.keys(tierConfig).reduce((acc, t) => { acc[t] = accounts.filter(a => a.tier === t).length; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--app-font-serif)]">Loyalty Program</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage guest loyalty points and tiers</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(tierConfig).map(([tier, cfg]) => (
          <div key={tier} className={`${cfg.bg} border border-border rounded-xl p-4 text-center`}>
            <Star className={`w-5 h-5 mx-auto mb-1 ${cfg.color}`} />
            <p className={`text-2xl font-bold ${cfg.color}`}>{tierCounts[tier] ?? 0}</p>
            <p className="text-xs text-muted-foreground capitalize mt-1">{tier} Members</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Tier Requirements</p>
        <div className="flex gap-6">
          <span>🥉 Bronze: 0–499 pts</span>
          <span>🥈 Silver: 500–1999 pts</span>
          <span>🥇 Gold: 2000–4999 pts</span>
          <span>💎 Platinum: 5000+ pts</span>
        </div>
        <p className="mt-2">Points earned: 1 pt per $10 paid</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                {["Member", "Tier", "Points", "Total Earned", "Next Tier", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.map(a => {
                const cfg = tierConfig[a.tier] ?? tierConfig.bronze;
                const remaining = cfg.nextAt === Infinity ? null : cfg.nextAt - a.totalEarned;
                return (
                  <tr key={a.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <p className="font-medium">{a.userName}</p>
                      <p className="text-xs text-muted-foreground">{a.userEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${cfg.bg} ${cfg.color}`}>{a.tier}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">{a.points.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.totalEarned.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{remaining !== null ? `${remaining} pts to ${cfg.next}` : "Max tier"}</td>
                    <td className="px-4 py-3">
                      {showAdjust === a.userId ? (
                        <div className="space-y-2 min-w-[240px]">
                          <Input type="number" placeholder="Points (negative to deduct)" value={adjustForm.points} onChange={e => setAdjustForm(f => ({ ...f, points: e.target.value }))} className="h-7 text-xs" />
                          <Input placeholder="Reason" value={adjustForm.description} onChange={e => setAdjustForm(f => ({ ...f, description: e.target.value }))} className="h-7 text-xs" />
                          <Select value={adjustForm.type} onValueChange={v => setAdjustForm(f => ({ ...f, type: v }))}>
                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="bonus">Bonus</SelectItem><SelectItem value="earn">Earn</SelectItem><SelectItem value="redeem">Redeem</SelectItem></SelectContent>
                          </Select>
                          <div className="flex gap-1"><Button size="sm" className="h-7 text-xs" onClick={() => adjust(a.userId)}>Save</Button><Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAdjust(null)}>Cancel</Button></div>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAdjust(a.userId)}><Plus className="w-3 h-3 mr-1" />Adjust</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {accounts.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No loyalty accounts yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
