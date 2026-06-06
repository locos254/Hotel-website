import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Diamond, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin, Bell, Heart, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import ReviewPromptModal from "@/components/ReviewPromptModal";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms & Suites" },
];

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated, isAdmin, logout, user, token } = useAuth();
  const { settings } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isTransparent = location === "/" && !scrolled;

  const hotelName = settings?.hotelName ?? "Grand Azure";
  const hotelNameShort = hotelName.split(" ").slice(0, 2).join(" ");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Update document title
  useEffect(() => {
    if (settings?.hotelName) {
      document.title = settings.hotelName;
    }
  }, [settings?.hotelName]);

  // Poll for unread notifications count
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(Array.isArray(data) ? data.filter((n: { isRead: boolean }) => !n.isRead).length : 0);
        }
      } catch { /* ignore */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  const guestLinks = [
    { href: "/my-bookings", label: "My Bookings" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/loyalty", label: "Rewards" },
    { href: "/support", label: "Support" },
    { href: "/invoices", label: "Invoices" },
  ];

  const socialLinks = [
    { url: settings?.facebookUrl, Icon: Facebook },
    { url: settings?.twitterUrl, Icon: Twitter },
    { url: settings?.instagramUrl, Icon: Instagram },
    { url: settings?.youtubeUrl, Icon: Youtube },
    { url: settings?.linkedinUrl, Icon: Linkedin },
  ].filter(s => s.url);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isTransparent ? "bg-transparent" : "bg-background/95 backdrop-blur-md border-b border-border"}`}>
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={hotelName} className="w-8 h-8 object-contain" />
              ) : (
                <Diamond className="w-7 h-7 text-primary" />
              )}
              <div>
                <div className="font-[family-name:var(--app-font-serif)] text-lg font-bold leading-none text-foreground">{hotelNameShort}</div>
                <div className="text-[10px] tracking-[0.2em] text-primary uppercase">Hotel & Residences</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className={`text-sm tracking-wide transition-colors hover:text-primary ${location === l.href ? "text-primary" : "text-foreground/80"}`}>
                  {l.label}
                </Link>
              ))}
              {isAuthenticated && guestLinks.map(l => (
                <Link key={l.href} href={l.href} className={`text-sm tracking-wide transition-colors hover:text-primary ${location === l.href ? "text-primary" : "text-foreground/80"}`}>
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" className="text-sm tracking-wide text-primary hover:text-primary/80 font-medium transition-colors">
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link href="/notifications" className="relative p-2 text-foreground/70 hover:text-primary transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                  </Link>
                  <Link href="/wishlist" className="p-2 text-foreground/70 hover:text-primary transition-colors">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link href="/loyalty" className="p-2 text-foreground/70 hover:text-primary transition-colors">
                    <Star className="w-5 h-5" />
                  </Link>
                  <Link href="/profile">
                    <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-semibold cursor-pointer hover:bg-primary/30 transition-colors">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  </Link>
                  <Button variant="outline" size="sm" onClick={logout} className="border-primary/30 text-primary hover:bg-primary/10">Sign Out</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login"><Button variant="ghost" size="sm" className="text-foreground/80 hover:text-primary">Sign In</Button></Link>
                  <Link href="/register"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Reserve Now</Button></Link>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background/98 backdrop-blur-md border-t border-border"
            >
              <div className="px-6 py-4 space-y-2">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-foreground/80 hover:text-primary transition-colors border-b border-border/50">{l.label}</Link>
                ))}
                {isAuthenticated && (
                  <>
                    {guestLinks.map(l => (
                      <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-foreground/80 hover:text-primary transition-colors border-b border-border/50">
                        {l.label}{l.href === "/notifications" && unreadCount > 0 && <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                      </Link>
                    ))}
                    {isAdmin && <Link href="/admin" onClick={() => setMobileOpen(false)} className="block py-2.5 text-primary font-medium border-b border-border/50">Admin Panel</Link>}
                  </>
                )}
                <div className="pt-3">
                  {isAuthenticated ? (
                    <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left py-2 text-destructive text-sm">Sign Out</button>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full">Sign In</Button></Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)}><Button className="w-full bg-primary text-primary-foreground">Reserve Now</Button></Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>
      <ReviewPromptModal />

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt={hotelName} className="w-7 h-7 object-contain" />
                ) : (
                  <Diamond className="w-6 h-6 text-primary" />
                )}
                <div>
                  <div className="font-[family-name:var(--app-font-serif)] text-lg font-bold">{settings?.hotelName ?? "Grand Azure Hotel"}</div>
                  <div className="text-[10px] tracking-[0.2em] text-primary uppercase">& Residences</div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                {settings?.description ?? "Experience unparalleled luxury with premium amenities, exquisite rooms, and unmatched hospitality at the heart of Monaco."}
              </p>
              {socialLinks.length > 0 && (
                <div className="flex gap-3 mt-6">
                  {socialLinks.map(({ url, Icon }, i) => (
                    <a key={i} href={url!} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
              {socialLinks.length === 0 && (
                <div className="flex gap-4 mt-6">
                  {[Facebook, Twitter, Instagram].map((Icon, i) => (
                    <a key={i} href="#" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Icon className="w-4 h-4" /></a>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm tracking-wider uppercase text-primary mb-4">Quick Links</h4>
              <div className="space-y-2">
                {[{ href: "/rooms", label: "Rooms & Suites" }, { href: "/my-bookings", label: "My Bookings" }, { href: "/loyalty", label: "Rewards Program" }, { href: "/support", label: "Support" }].map((l) => (
                  <Link key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
                ))}
                {settings?.websiteUrl && (
                  <a href={settings.websiteUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Official Website</a>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm tracking-wider uppercase text-primary mb-4">Contact</h4>
              <div className="space-y-3">
                {settings?.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{settings.address}</span>
                  </div>
                )}
                {settings?.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <a href={`tel:${settings.phone}`} className="hover:text-primary transition-colors">{settings.phone}</a>
                  </div>
                )}
                {settings?.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <a href={`mailto:${settings.email}`} className="hover:text-primary transition-colors">{settings.email}</a>
                  </div>
                )}
                {settings?.checkInTime && (
                  <div className="text-xs text-muted-foreground/70 mt-2 space-y-0.5">
                    <p>Check-in: {settings.checkInTime}</p>
                    <p>Check-out: {settings.checkOutTime}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {settings?.hotelName ?? "Grand Azure Hotel"} & Residences. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
