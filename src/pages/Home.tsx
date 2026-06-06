import { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, ChevronDown, ChevronLeft, ChevronRight, Waves, Sparkles, UtensilsCrossed, Dumbbell, Bell, Briefcase, Car, Wine, Umbrella, Users, Calendar, Search, Tag, Shield, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListRooms, useListAmenities, useListReviews, useListGallery } from "@workspace/api-client-react";
import { useSettings } from "@/contexts/SettingsContext";

const iconMap: Record<string, React.ElementType> = {
  Waves, Sparkles, UtensilsCrossed, Dumbbell, Bell, Briefcase, Car, Wine, Umbrella, Users,
};

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

const DEFAULT_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80",
    tag: "Welcome",
    title: "Luxury",
    titleAccent: "Redefined",
    subtitle: "Experience unparalleled elegance at the heart of Monaco. Where world-class hospitality meets breathtaking Mediterranean views.",
  },
  {
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80",
    tag: "Signature Suites",
    title: "Where Every Detail",
    titleAccent: "Matters",
    subtitle: "From the finest linens to personalised butler service, every moment is crafted for perfection.",
  },
  {
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80",
    tag: "Monaco Riviera",
    title: "Azure Waters,",
    titleAccent: "Timeless Views",
    subtitle: "Wake up to panoramic vistas of the Mediterranean from your private balcony. Life as it should be.",
  },
];

function HeroCarousel() {
  const { settings } = useSettings();
  const [current, setCurrent] = useState(0);
  const [, setLocation] = useLocation();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [promo, setPromo] = useState("");

  // Build slides — replace first slide's image if admin set a hero image
  const heroSlides = DEFAULT_SLIDES.map((s, i) =>
    i === 0
      ? {
          ...s,
          image: settings?.heroImageUrl || s.image,
          tag: settings?.hotelName ? `Welcome to ${settings.hotelName}` : `Welcome to Grand Azure`,
        }
      : s
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % heroSlides.length), 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const prev = () => setCurrent(c => (c - 1 + heroSlides.length) % heroSlides.length);
  const next = () => setCurrent(c => (c + 1) % heroSlides.length);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    if (promo) params.set("promo", promo);
    setLocation(`/rooms?${params.toString()}`);
  };

  const slide = heroSlides[current];

  return (
    <section className="relative h-[100dvh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt="Grand Azure Hotel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button onClick={prev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Text */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full" style={{ marginBottom: "clamp(160px, 30vh, 260px)" }}>
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 text-primary text-sm tracking-[0.3em] uppercase mb-4 md:mb-6">
              <span className="w-6 md:w-8 h-px bg-primary" />
              {slide.tag}
              <span className="w-6 md:w-8 h-px bg-primary" />
            </div>
            <h1 className="font-[family-name:var(--app-font-serif)] text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-4 md:mb-6">
              {slide.title}{" "}
              <span className="text-primary italic">{slide.titleAccent}</span>
            </h1>
            <p className="text-white/80 text-base md:text-xl max-w-2xl mx-auto leading-relaxed hidden sm:block">{slide.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Booking search bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Dots above search bar */}
          <div className="flex justify-center gap-2 mb-4">
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`transition-all duration-300 rounded-full ${i === current ? "w-8 h-2 bg-primary" : "w-2 h-2 bg-white/40"}`} />
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="bg-background/95 backdrop-blur-md border border-border rounded-2xl p-3 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check In</p>
                  <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="bg-transparent text-sm font-medium text-foreground outline-none w-full" />
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check Out</p>
                  <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="bg-transparent text-sm font-medium text-foreground outline-none w-full" />
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Guests</p>
                  <select value={guests} onChange={e => setGuests(e.target.value)} className="bg-transparent text-sm font-medium text-foreground outline-none w-full">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5">
                <Tag className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Promo Code</p>
                  <input value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} placeholder="Optional" className="bg-transparent text-sm font-medium text-foreground outline-none w-full placeholder:text-muted-foreground placeholder:font-normal" />
                </div>
              </div>
              <Button onClick={handleSearch} className="col-span-2 md:col-span-1 bg-primary text-primary-foreground h-12 md:h-full rounded-xl font-semibold gap-2 text-sm">
                <Search className="w-4 h-4" />
                Search Rooms
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: rooms } = useListRooms();
  const { data: amenities } = useListAmenities();
  const { data: reviews } = useListReviews({ approved: true });
  const { data: gallery } = useListGallery();

  const featuredRooms = rooms?.slice(0, 3) ?? [];
  const featuredAmenities = amenities?.slice(0, 6) ?? [];

  return (
    <div className="overflow-hidden">
      <HeroCarousel />

      {/* Stats strip */}
      <section className="bg-primary/10 border-y border-primary/20 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "50+", label: "Luxury Rooms" },
            { value: "5★", label: "Rating" },
            { value: "20+", label: "Years of Excellence" },
            { value: "10,000+", label: "Happy Guests" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-[family-name:var(--app-font-serif)] text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Accommodation</p>
            <h2 className="font-[family-name:var(--app-font-serif)] text-4xl md:text-5xl font-bold">Rooms & Suites</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">Each room is a sanctuary of comfort and elegance, designed to exceed your every expectation.</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room, i) => (
              <FadeIn key={room.id} delay={i * 0.1}>
                <Link href={`/rooms/${room.id}`}>
                  <div className="group bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative h-56 overflow-hidden">
                      <img src={room.imageUrl || `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600`} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3"><span className="bg-primary/90 text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full capitalize">{room.type}</span></div>
                      <div className="absolute top-3 right-3"><span className="bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-full">{room.capacity} guests</span></div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-[family-name:var(--app-font-serif)] text-xl font-semibold mb-2">{room.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{room.description}</p>
                      <div className="flex items-center justify-between">
                        <div><span className="text-primary font-bold text-xl">${room.pricePerNight}</span><span className="text-muted-foreground text-sm"> / night</span></div>
                        <div className="flex items-center gap-1 text-primary text-sm">View Details <ArrowRight className="w-3 h-3" /></div>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="text-center mt-12">
            <Link href="/rooms"><Button variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary/10">View All Rooms & Suites<ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </FadeIn>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Why Grand Azure</p>
            <h2 className="font-[family-name:var(--app-font-serif)] text-4xl md:text-5xl font-bold">The Grand Azure Difference</h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Best Rate Guarantee", desc: "Book directly and receive our lowest guaranteed rates, every time." },
              { icon: Award, title: "Loyalty Rewards", desc: "Earn points with every stay. Unlock Bronze, Silver, Gold and Platinum benefits." },
              { icon: Clock, title: "Flexible Cancellation", desc: "Plans change. Enjoy free cancellation up to 24 hours before arrival." },
              { icon: Star, title: "5-Star Service", desc: "Our dedicated concierge team is available around the clock for your every need." },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all group text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">World-Class</p>
            <h2 className="font-[family-name:var(--app-font-serif)] text-4xl md:text-5xl font-bold">Hotel Amenities</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">Every detail curated for your ultimate comfort and pleasure.</p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAmenities.map((amenity, i) => {
              const Icon = iconMap[amenity.icon] || Sparkles;
              return (
                <FadeIn key={amenity.id} delay={i * 0.05}>
                  <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{amenity.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{amenity.description}</p>
                    <span className="text-xs text-primary/70 mt-3 inline-block">{amenity.category}</span>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      {gallery && gallery.length > 0 && (
        <section className="py-24 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="text-center mb-16">
              <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Visual Journey</p>
              <h2 className="font-[family-name:var(--app-font-serif)] text-4xl md:text-5xl font-bold">Our Gallery</h2>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.slice(0, 6).map((item, i) => (
                <FadeIn key={item.id} delay={i * 0.05}>
                  <div className={`relative overflow-hidden rounded-xl group ${i === 0 || i === 5 ? "md:row-span-2" : ""}`}>
                    <img src={item.imageUrl} alt={item.title} className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ minHeight: (i === 0 || i === 5) ? "300px" : "200px" }} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end">
                      <div className="p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-white/70 text-xs capitalize">{item.category}</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="text-center mb-16">
              <p className="text-primary text-sm tracking-[0.3em] uppercase mb-3">Guest Stories</p>
              <h2 className="font-[family-name:var(--app-font-serif)] text-4xl md:text-5xl font-bold">What Our Guests Say</h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.slice(0, 4).map((review, i) => (
                <FadeIn key={review.id} delay={i * 0.1}>
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex gap-1 mb-4">{Array.from({ length: review.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-primary text-primary" />)}</div>
                    <p className="text-foreground/80 italic leading-relaxed mb-6">"{review.comment}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm">
                        {(review as { userName?: string }).userName?.[0]?.toUpperCase() || "G"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{(review as { userName?: string }).userName || "Guest"}</p>
                        <p className="text-muted-foreground text-xs">{(review as { roomName?: string }).roomName || "Verified Guest"}</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loyalty CTA */}
      <section className="py-16 px-4 bg-primary/5 border-y border-primary/20">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-[family-name:var(--app-font-serif)] text-3xl md:text-4xl font-bold mb-3">Join Grand Azure Rewards</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">Earn 1 point for every $10 spent. Unlock exclusive perks, room upgrades, and more as you climb from Bronze to Platinum.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              {["🥉 Bronze", "🥈 Silver", "🥇 Gold", "💎 Platinum"].map(tier => (
                <span key={tier} className="bg-card border border-border rounded-full px-4 py-2 text-sm font-medium">{tier}</span>
              ))}
            </div>
            <Link href="/register" className="inline-block mt-8">
              <Button size="lg" className="bg-primary text-primary-foreground">Join Now — It's Free</Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80" alt="Hotel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Limited Availability</p>
            <h2 className="font-[family-name:var(--app-font-serif)] text-4xl md:text-5xl font-bold text-white mb-6">Begin Your Grand Azure Experience</h2>
            <p className="text-white/70 text-lg mb-10">Reserve your room today and discover why we are Monaco's most celebrated luxury hotel.</p>
            <Link href="/rooms">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-10 h-12">
                Reserve Your Suite <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
