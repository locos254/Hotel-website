import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, BedDouble, Users, Clock, CheckCircle2, XCircle, Loader2, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListBookings, useDeleteBooking } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Booking } from "@workspace/api-client-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  confirmed: { label: "Confirmed", variant: "default", icon: CheckCircle2 },
  checked_in: { label: "Checked In", variant: "default", icon: CheckCircle2 },
  checked_out: { label: "Completed", variant: "secondary", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

const roomImages: Record<string, string> = {
  standard: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400",
  deluxe: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
  suite: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400",
  presidential: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function nightsBetween(a: string, b: string) {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function MyBookings() {
  const [cancelId, setCancelId] = useState<number | null>(null);
  const { data, isLoading } = useListBookings();
  const deleteBooking = useDeleteBooking();
  const qc = useQueryClient();

  const bookings: Booking[] = (data as { bookings?: Booking[] })?.bookings ?? (Array.isArray(data) ? (data as Booking[]) : []);

  async function handleCancel(id: number) {
    try {
      await deleteBooking.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast.success("Booking cancelled successfully");
      setCancelId(null);
    } catch {
      toast.error("Failed to cancel booking");
    }
  }

  return (
    <div className="pt-24 min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <h1 className="font-[family-name:var(--app-font-serif)] text-3xl md:text-4xl font-bold mb-2">My Reservations</h1>
            <p className="text-muted-foreground">Track and manage your Grand Azure stays</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-24 bg-card border border-border rounded-2xl">
              <BedDouble className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-[family-name:var(--app-font-serif)] text-xl font-semibold mb-2">No Reservations Yet</h3>
              <p className="text-muted-foreground mb-8">Discover our stunning rooms and suites for your next stay.</p>
              <Link href="/rooms">
                <Button className="bg-primary text-primary-foreground">
                  Explore Rooms <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.map((booking, i) => {
                const status = statusConfig[booking.status] ?? statusConfig.pending;
                const StatusIcon = status.icon;
                const nights = nightsBetween(booking.checkIn, booking.checkOut);
                const roomImg = (booking as { roomType?: string }).roomType
                  ? roomImages[(booking as { roomType?: string }).roomType!]
                  : roomImages.deluxe;
                const canCancel = ["pending", "confirmed"].includes(booking.status);

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-36 h-36 sm:h-auto shrink-0 overflow-hidden">
                        <img
                          src={roomImg || roomImages.deluxe}
                          alt={(booking as { roomName?: string }).roomName || "Room"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="font-[family-name:var(--app-font-serif)] text-xl font-semibold">
                              {(booking as { roomName?: string }).roomName || "Room"}
                            </h3>
                            <p className="text-muted-foreground text-xs mt-0.5">Booking #{booking.id}</p>
                          </div>
                          <Badge variant={status.variant} className="shrink-0 flex items-center gap-1 text-xs">
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary shrink-0" />
                            <div>
                              <p className="text-[11px] uppercase tracking-wide">Check-in</p>
                              <p className="font-medium text-foreground">{formatDate(booking.checkIn)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary shrink-0" />
                            <div>
                              <p className="text-[11px] uppercase tracking-wide">Check-out</p>
                              <p className="font-medium text-foreground">{formatDate(booking.checkOut)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4 text-primary shrink-0" />
                            <div>
                              <p className="text-[11px] uppercase tracking-wide">Guests</p>
                              <p className="font-medium text-foreground">{booking.guests}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Tag className="w-4 h-4 text-primary shrink-0" />
                            <div>
                              <p className="text-[11px] uppercase tracking-wide">{nights} Night{nights !== 1 ? "s" : ""}</p>
                              <p className="font-medium text-primary">${Number(booking.totalPrice).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-3 italic">
                            "{booking.specialRequests}"
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <Link href={`/rooms/${booking.roomId}`}>
                            <Button variant="outline" size="sm" className="text-xs border-primary/20 text-primary hover:bg-primary/10">
                              View Room
                            </Button>
                          </Link>
                          {canCancel && (
                            cancelId === booking.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Confirm cancel?</span>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={() => handleCancel(booking.id)}
                                  disabled={deleteBooking.isPending}
                                >
                                  {deleteBooking.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes, Cancel"}
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setCancelId(null)}>Keep</Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-destructive hover:bg-destructive/10"
                                onClick={() => setCancelId(booking.id)}
                              >
                                Cancel Booking
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
