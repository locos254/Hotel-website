import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, BedDouble, Users, Maximize2, Star, Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useGetRoom, useListReviews, useCreateBooking } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";

const roomImages: Record<string, string[]> = {
  standard: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
    "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800",
  ],
  deluxe: [
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800",
  ],
  suite: [
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
    "https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800",
    "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800",
  ],
  presidential: [
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
  ],
};

function getDaysBetween(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return Math.max(0, Math.ceil((db.getTime() - da.getTime()) / 86400000));
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getDayAfterTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeImg, setActiveImg] = useState(0);
  const [checkIn, setCheckIn] = useState(getTomorrow());
  const [checkOut, setCheckOut] = useState(getDayAfterTomorrow());
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [booked, setBooked] = useState(false);

  const { data: room, isLoading } = useGetRoom(Number(id));
  const { data: reviews } = useListReviews({ roomId: Number(id), approved: true });
  const createBooking = useCreateBooking();

  if (isLoading || !room) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (false) return (
    <div className="min-h-screen flex items-center justify-center pt-20 text-muted-foreground">
      Room not found.
    </div>
  );

  const images = room.imageUrl
    ? [room.imageUrl, ...(roomImages[room.type] ?? []).slice(0, 2)]
    : roomImages[room.type] ?? roomImages.deluxe;

  const nights = getDaysBetween(checkIn, checkOut);
  const totalPrice = nights * Number(room.pricePerNight);

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!room) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to make a reservation");
      navigate("/login");
      return;
    }
    if (nights < 1) {
      toast.error("Check-out must be after check-in");
      return;
    }
    try {
      await createBooking.mutateAsync({
        data: {
          roomId: room.id,
          checkIn: new Date(checkIn).toISOString(),
          checkOut: new Date(checkOut).toISOString(),
          guests,
          specialRequests: specialRequests || undefined,
        },
      });
      setBooked(true);
      toast.success("Reservation confirmed! We'll see you soon.");
    } catch {
      toast.error("Booking failed. Please try again.");
    }
  }

  return (
    <div className="pt-20 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button onClick={() => navigate("/rooms")} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Rooms
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left - Room info */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="relative rounded-2xl overflow-hidden mb-3">
              <motion.img
                key={activeImg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                src={images[activeImg]}
                alt={room.name}
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full capitalize">{room.type}</span>
              </div>
            </div>
            <div className="flex gap-2 mb-8">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-80"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Details */}
            <h1 className="font-[family-name:var(--app-font-serif)] text-3xl md:text-4xl font-bold mb-4">{room.name}</h1>

            <div className="flex flex-wrap gap-6 mb-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><BedDouble className="w-4 h-4 text-primary" /> {room.capacity} guests max</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Up to {room.capacity} guests</span>
              <span className="flex items-center gap-2"><Maximize2 className="w-4 h-4 text-primary" /> {room.floor ? `Floor ${room.floor}` : "Multiple floors"}</span>
              {reviews && reviews.length > 0 && (
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} ({reviews.length} reviews)
                </span>
              )}
            </div>

            <p className="text-foreground/80 leading-relaxed mb-8">{room.description}</p>

            {/* Amenities */}
            {room.amenities && (room.amenities as string[]).length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4">Room Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(room.amenities as string[]).map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Guest Reviews</h3>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex gap-1 mb-2">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-sm text-foreground/80 italic">"{review.comment}"</p>
                      <p className="text-xs text-muted-foreground mt-2">{(review as { userName?: string }).userName || "Guest"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                {booked ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-[family-name:var(--app-font-serif)] text-xl font-bold mb-2">Reservation Confirmed!</h3>
                    <p className="text-muted-foreground text-sm mb-6">Your booking is confirmed. We look forward to welcoming you.</p>
                    <Link href="/my-bookings">
                      <Button className="w-full bg-primary text-primary-foreground">View My Bookings</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <span className="text-primary font-bold text-3xl">${room.pricePerNight}</span>
                      <span className="text-muted-foreground"> / night</span>
                    </div>

                    <form onSubmit={handleBooking} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="checkin" className="text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Check-in
                          </Label>
                          <Input
                            id="checkin"
                            type="date"
                            value={checkIn}
                            min={getTomorrow()}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="bg-background text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="checkout" className="text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Check-out
                          </Label>
                          <Input
                            id="checkout"
                            type="date"
                            value={checkOut}
                            min={checkIn}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="bg-background text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="guests" className="text-xs flex items-center gap-1">
                          <Users className="w-3 h-3" /> Guests
                        </Label>
                        <Input
                          id="guests"
                          type="number"
                          min={1}
                          max={room.capacity}
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="bg-background"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="requests" className="text-xs">Special Requests <span className="text-muted-foreground">(optional)</span></Label>
                        <Textarea
                          id="requests"
                          placeholder="Any special requirements..."
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          rows={3}
                          className="bg-background text-sm resize-none"
                        />
                      </div>

                      {nights > 0 && (
                        <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>${room.pricePerNight} × {nights} night{nights !== 1 ? "s" : ""}</span>
                            <span>${(Number(room.pricePerNight) * nights).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2">
                            <span>Total</span>
                            <span className="text-primary">${totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                        disabled={createBooking.isPending || !room.isAvailable}
                      >
                        {createBooking.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {!room.isAvailable ? "Currently Unavailable" : "Reserve This Room"}
                      </Button>

                      {!isAuthenticated && (
                        <p className="text-center text-xs text-muted-foreground">
                          <Link href="/login" className="text-primary hover:underline">Sign in</Link> to complete your reservation
                        </p>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
