import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2, Search, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useListBookings, useUpdateBooking, useDeleteBooking } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Booking } from "@workspace/api-client-react";

type StatusFilter = "all" | "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

const statusOpts: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
];

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  checked_in: "bg-green-500/10 text-green-600 border-green-500/20",
  checked_out: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const nextStatus: Record<string, string> = {
  pending: "confirmed",
  confirmed: "checked_in",
  checked_in: "checked_out",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminBookings() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [delId, setDelId] = useState<number | null>(null);

  const { data, isLoading } = useListBookings(status !== "all" ? { status } : undefined);
  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();

  const allBookings: Booking[] = (data as { bookings?: Booking[] })?.bookings
    ?? (Array.isArray(data) ? (data as Booking[]) : []);

  const filtered = allBookings.filter((b) =>
    (b as { userName?: string }).userName?.toLowerCase().includes(search.toLowerCase()) ||
    (b as { roomName?: string }).roomName?.toLowerCase().includes(search.toLowerCase()) ||
    String(b.id).includes(search)
  );

  async function handleStatusChange(id: number, newStatus: string) {
    try {
      await updateBooking.mutateAsync({ id, data: { status: newStatus as Booking["status"] } });
      qc.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast.success(`Booking ${newStatus.replace("_", " ")}`);
    } catch {
      toast.error("Failed to update booking");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteBooking.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast.success("Booking deleted");
      setDelId(null);
    } catch {
      toast.error("Failed to delete booking");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--app-font-serif)] text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground text-sm mt-1">{allBookings.length} total bookings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by guest, room or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-background" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-48 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOpts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["#", "Guest", "Room", "Check-in", "Check-out", "Guests", "Total", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const next = nextStatus[b.status];
                  return (
                    <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 text-xs text-muted-foreground">#{b.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{(b as { userName?: string }).userName || `User #${b.userId}`}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{(b as { roomName?: string }).roomName || `Room #${b.roomId}`}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{fmt(b.checkIn)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{fmt(b.checkOut)}</td>
                      <td className="px-4 py-3 text-sm text-center">{b.guests}</td>
                      <td className="px-4 py-3 text-sm font-medium text-primary whitespace-nowrap">${Number(b.totalPrice).toFixed(0)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize whitespace-nowrap ${statusBadge[b.status] ?? ""}`}>
                          {b.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {next && (
                            <button
                              onClick={() => handleStatusChange(b.id, next)}
                              className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
                            >
                              → {next.replace("_", " ")}
                            </button>
                          )}
                          {b.status !== "cancelled" && (
                            <button
                              onClick={() => handleStatusChange(b.id, "cancelled")}
                              className="text-xs px-2 py-1 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          {delId === b.id ? (
                            <div className="flex items-center gap-1 ml-1">
                              <button onClick={() => handleDelete(b.id)} className="p-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"><Check className="w-3 h-3" /></button>
                              <button onClick={() => setDelId(null)} className="p-1 rounded hover:bg-muted text-muted-foreground"><X className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <button onClick={() => setDelId(b.id)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground text-sm"><Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />No bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
