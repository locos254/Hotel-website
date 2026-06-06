import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, MessageSquare, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useListBookings, useCreateReview } from "@workspace/api-client-react";
import { toast } from "sonner";

const STORAGE_KEY = "ga_reviewed_bookings";

function getReviewedBookings(): number[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function markReviewed(id: number) {
  const arr = getReviewedBookings();
  if (!arr.includes(id)) { arr.push(id); localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
}

export default function ReviewPromptModal() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState<{ id: number; roomName?: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  const { data } = useListBookings(
    { status: "checked_out" },
    { query: { enabled: isAuthenticated, staleTime: 60_000, queryKey: ["listBookings", { status: "checked_out" }] } }
  );

  const createReview = useCreateReview();

  useEffect(() => {
    if (!isAuthenticated) return;
    const bookings = (data as { bookings?: { id: number; roomId?: number }[] })?.bookings
      ?? (Array.isArray(data) ? data : []);
    const reviewed = getReviewedBookings();
    const pending = bookings.find((b: { id: number }) => !reviewed.includes(b.id));
    if (!pending) return;

    const timer = setTimeout(() => {
      setTargetBooking({ id: pending.id });
      setOpen(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [data, isAuthenticated]);

  async function handleSubmit() {
    if (!targetBooking || rating === 0) return;
    try {
      await createReview.mutateAsync({
        data: {
          rating,
          comment: comment || "Great stay!",
          bookingId: targetBooking.id,
        },
      });
      markReviewed(targetBooking.id);
      setDone(true);
      setTimeout(() => { setOpen(false); setDone(false); setRating(0); setComment(""); }, 2000);
      toast.success("Thank you for your review! It will appear once approved.");
    } catch {
      toast.error("Could not submit review. Please try again.");
    }
  }

  function handleDismiss() {
    if (targetBooking) markReviewed(targetBooking.id);
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Gold accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

            <div className="p-6">
              {/* Close */}
              <button
                onClick={handleDismiss}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {done ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                    <Check className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="font-[family-name:var(--app-font-serif)] text-xl font-bold mb-1">Thank You!</h3>
                  <p className="text-muted-foreground text-sm">Your review has been submitted for approval.</p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--app-font-serif)] text-lg font-bold">How was your stay?</h3>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        Share your experience from booking #{targetBooking?.id} — it helps other guests
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Your Rating</p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onMouseEnter={() => setHovered(n)}
                          onMouseLeave={() => setHovered(0)}
                          onClick={() => setRating(n)}
                          className="p-0.5 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              n <= (hovered || rating)
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {(hovered || rating) > 0 && (
                      <p className="text-xs text-primary mt-1.5">
                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hovered || rating]}
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <div className="mb-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Your Review <span className="normal-case">(optional)</span></p>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your experience — the room, service, dining, or anything that stood out…"
                      rows={3}
                      className="bg-background resize-none text-sm"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-muted-foreground"
                      onClick={handleDismiss}
                    >
                      Maybe Later
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleSubmit}
                      disabled={rating === 0 || createReview.isPending}
                    >
                      {createReview.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting…</>
                      ) : (
                        "Submit Review"
                      )}
                    </Button>
                  </div>

                  {rating === 0 && (
                    <p className="text-center text-xs text-muted-foreground mt-2">Please select a star rating first</p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
