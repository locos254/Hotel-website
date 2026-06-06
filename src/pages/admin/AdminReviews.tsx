import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Loader2, Check, X, Trash2, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useListReviews, useUpdateReview, useDeleteReview } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Review } from "@workspace/api-client-react";

type Filter = "all" | "approved" | "pending";

export default function AdminReviews() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [delId, setDelId] = useState<number | null>(null);

  const { data: reviews, isLoading } = useListReviews(
    filter !== "all" ? { approved: filter === "approved" } : undefined
  );
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const list: Review[] = Array.isArray(reviews) ? (reviews as Review[]) : [];

  async function toggleApproval(r: Review) {
    try {
      await updateReview.mutateAsync({ id: r.id, data: { isApproved: !r.isApproved } });
      qc.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast.success(r.isApproved ? "Review hidden" : "Review approved");
    } catch {
      toast.error("Failed to update review");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteReview.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast.success("Review deleted");
      setDelId(null);
    } catch {
      toast.error("Failed to delete review");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--app-font-serif)] text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground text-sm mt-1">{list.length} reviews</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <SelectTrigger className="w-44 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
          No reviews found
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${r.isApproved ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"}`}>
                      {r.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-foreground/80 italic text-sm leading-relaxed mb-3">"{r.comment}"</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{(r as { userName?: string }).userName || "Guest"}</span>
                    {(r as { roomName?: string }).roomName && <span>Room: {(r as { roomName?: string }).roomName}</span>}
                    <span>{new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleApproval(r)}
                    className={`p-2 rounded-lg transition-colors ${r.isApproved ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20" : "bg-green-500/10 text-green-600 hover:bg-green-500/20"}`}
                    title={r.isApproved ? "Hide review" : "Approve review"}
                  >
                    {r.isApproved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {delId === r.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDelId(null)} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDelId(r.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
