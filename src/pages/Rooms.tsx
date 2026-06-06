import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, BedDouble, Users, ArrowRight, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListRooms } from "@workspace/api-client-react";
import type { Room } from "@workspace/api-client-react";

type RoomType = "all" | "standard" | "deluxe" | "suite" | "presidential";

const roomImages: Record<string, string> = {
  standard: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600",
  deluxe: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
  suite: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600",
  presidential: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600",
};

function RoomCard({ room, index }: { room: Room; index: number }) {
  const imgSrc = room.imageUrl || roomImages[room.type] || roomImages.deluxe;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <Link href={`/rooms/${room.id}`}>
        <div className="group bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="relative h-60 overflow-hidden">
            <img src={imgSrc} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="bg-primary/90 text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full capitalize">{room.type}</span>
              {!room.isAvailable && (
                <span className="bg-destructive/90 text-destructive-foreground text-xs font-medium px-2.5 py-1 rounded-full">Unavailable</span>
              )}
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-3 text-white text-sm">

              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {room.capacity} guests</span>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-[family-name:var(--app-font-serif)] text-xl font-semibold mb-2">{room.name}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">{room.description}</p>

            {room.amenities && (room.amenities as string[]).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(room.amenities as string[]).slice(0, 4).map((a) => (
                  <span key={a} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{a}</span>
                ))}
                {(room.amenities as string[]).length > 4 && (
                  <span className="text-xs text-primary/60">+{(room.amenities as string[]).length - 4} more</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <span className="text-primary font-bold text-2xl">${room.pricePerNight}</span>
                <span className="text-muted-foreground text-sm"> / night</span>
              </div>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Book Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Rooms() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<RoomType>("all");
  const [sortBy, setSortBy] = useState("price_asc");
  const [showFilters, setShowFilters] = useState(false);

  const { data: rooms, isLoading } = useListRooms(
    type !== "all" ? { type } : undefined
  );

  const filtered = (rooms ?? []).filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === "price_asc") return Number(a.pricePerNight) - Number(b.pricePerNight);
    if (sortBy === "price_desc") return Number(b.pricePerNight) - Number(a.pricePerNight);
    if (sortBy === "capacity") return (b.capacity ?? 0) - (a.capacity ?? 0);
    return 0;
  });

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <div className="relative h-64 flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600" alt="Rooms" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Grand Azure</p>
          <h1 className="font-[family-name:var(--app-font-serif)] text-4xl md:text-5xl font-bold text-white">Rooms & Suites</h1>
          <p className="text-white/70 mt-3">Discover your perfect sanctuary</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Select value={type} onValueChange={(v) => setType(v as RoomType)}>
              <SelectTrigger className="w-full sm:w-44 bg-background">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
                <SelectItem value="presidential">Presidential</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-44 bg-background">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="capacity">Most Guests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Loading..." : `${filtered.length} room${filtered.length !== 1 ? "s" : ""} available`}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-primary text-primary" />
            5-star luxury property
          </div>
        </div>

        {/* Rooms grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="h-60 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <BedDouble className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No rooms found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((room, i) => (
              <RoomCard key={room.id} room={room} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
