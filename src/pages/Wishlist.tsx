import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart, BedDouble, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WishlistItem {
  id: number; userId: number; roomId: number; createdAt: string;
  room: { id: number; name: string; type: string; pricePerNight: string; imageUrl: string | null; capacity: number; floor: number } | null;
}

export default function Wishlist() {
  const { token } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/wishlists", { headers: h });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useState(() => { load(); });

  const remove = async (roomId: number) => {
    await fetch(`/api/wishlists/${roomId}`, { method: "DELETE", headers: h });
    toast.success("Removed from wishlist");
    setItems(i => i.filter(x => x.roomId !== roomId));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--app-font-serif)] text-3xl font-bold">Saved Rooms</h1>
          <p className="text-muted-foreground text-sm mt-1">Your wishlist — {items.length} saved {items.length === 1 ? "room" : "rooms"}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No saved rooms yet</p>
            <Link href="/rooms"><Button className="bg-primary text-primary-foreground">Browse Rooms</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => {
              const room = item.room;
              if (!room) return null;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/40 transition-all hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <img src={room.imageUrl ?? `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400`} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3"><span className="bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full capitalize">{room.type}</span></div>
                    <button onClick={() => remove(room.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-destructive/80 flex items-center justify-center hover:bg-destructive transition-colors">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{room.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span><BedDouble className="w-3 h-3 inline mr-1" />{room.capacity} guests</span>
                      <span>Floor {room.floor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-bold">${parseFloat(room.pricePerNight).toFixed(0)}<span className="text-muted-foreground font-normal text-xs">/night</span></p>
                      <Link href={`/rooms/${room.id}`}><Button size="sm" className="bg-primary text-primary-foreground h-8 text-xs">Book<ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
