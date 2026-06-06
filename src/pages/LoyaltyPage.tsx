import { useState } from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LoyaltyData {
  points: number; totalEarned: number; tier: string;
  transactions: { id: number; type: string; points: number; description: string; createdAt: string }[];
}

const tierConfig: Record<string, { label: string; color: string; bg: string; border: string; min: number; max: number; perks: string[] }> = {
  bronze: { label: "Bronze", color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30", min: 0, max: 499, perks: ["Access to member rates", "Birthday bonus points", "Early check-in request"] },
  silver: { label: "Silver", color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/30", min: 500, max: 1999, perks: ["10% bonus points on bookings", "Free room upgrade (subject to availability)", "Late checkout until 1pm", "Welcome amenity"] },
  gold: { label: "Gold", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", min: 2000, max: 4999, perks: ["25% bonus points", "Guaranteed room upgrade", "Free airport transfer", "Priority check-in", "Complimentary breakfast"] },
  platinum: { label: "Platinum", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30", min: 5000, max: Infinity, perks: ["50% bonus points", "Suite upgrade guaranteed", "Personal concierge", "Spa access included", "All dining included", "Exclusive lounge access"] },
};

const txTypeColor: Record<string, string> = { earn: "text-green-500", redeem: "text-red-400", expire: "text-muted-foreground", bonus: "text-primary" };

export default function LoyaltyPage() {
  const { token } = useAuth();
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  useState(async () => {
    const res = await fetch("/api/loyalty", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setData(await res.json());
    setLoading(false);
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const tier = data?.tier ?? "bronze";
  const cfg = tierConfig[tier] ?? tierConfig.bronze;
  const tiers = ["bronze", "silver", "gold", "platinum"];
  const nextTier = tiers[tiers.indexOf(tier) + 1];
  const nextCfg = nextTier ? tierConfig[nextTier] : null;
  const progressToNext = nextCfg ? Math.min(100, (((data?.totalEarned ?? 0) - cfg.min) / (nextCfg.min - cfg.min)) * 100) : 100;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-[family-name:var(--app-font-serif)] text-3xl font-bold">Loyalty Rewards</h1>
          <p className="text-muted-foreground text-sm mt-1">Earn points with every stay and unlock exclusive benefits</p>
        </div>

        {/* Current tier card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border p-6 ${cfg.bg} ${cfg.border}`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className={`w-5 h-5 ${cfg.color}`} />
                <span className={`font-semibold text-lg capitalize ${cfg.color}`}>{cfg.label} Member</span>
              </div>
              <p className="text-muted-foreground text-sm">Grand Azure Rewards</p>
            </div>
            <div className="text-right">
              <p className={`text-4xl font-bold ${cfg.color}`}>{(data?.points ?? 0).toLocaleString()}</p>
              <p className="text-muted-foreground text-xs mt-0.5">Available Points</p>
            </div>
          </div>

          {nextCfg && (
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{data?.totalEarned?.toLocaleString() ?? 0} pts earned</span>
                <span>{nextCfg.min.toLocaleString()} pts for {nextCfg.label}</span>
              </div>
              <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressToNext}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full rounded-full ${cfg.color.replace("text-", "bg-")}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{Math.max(0, nextCfg.min - (data?.totalEarned ?? 0)).toLocaleString()} points until {nextCfg.label}</p>
            </div>
          )}
        </motion.div>

        {/* Perks */}
        <div>
          <h2 className="font-semibold mb-4">Your {cfg.label} Benefits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cfg.perks.map(perk => (
              <div key={perk} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                <Award className={`w-4 h-4 shrink-0 ${cfg.color}`} />
                <span className="text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier ladder */}
        <div>
          <h2 className="font-semibold mb-4">All Tiers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tiers.map(t => {
              const c = tierConfig[t];
              const isCurrentOrPast = tiers.indexOf(t) <= tiers.indexOf(tier);
              return (
                <div key={t} className={`rounded-xl border p-3 text-center transition-all ${t === tier ? `${c.bg} ${c.border}` : isCurrentOrPast ? "bg-card border-border opacity-60" : "bg-card border-border opacity-40"}`}>
                  <Star className={`w-5 h-5 mx-auto mb-1 ${c.color}`} />
                  <p className={`font-semibold text-sm ${c.color}`}>{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.min.toLocaleString()}+ pts</p>
                  {t === tier && <span className="text-xs font-medium text-primary">Current</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction history */}
        {data?.transactions && data.transactions.length > 0 && (
          <div>
            <h2 className="font-semibold mb-4">Points History</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="divide-y divide-border">
                {data.transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <TrendingUp className={`w-4 h-4 ${txTypeColor[tx.type] ?? "text-muted-foreground"}`} />
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground capitalize">{tx.type} · {new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${tx.points > 0 ? "text-green-500" : "text-red-400"}`}>
                      {tx.points > 0 ? "+" : ""}{tx.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
