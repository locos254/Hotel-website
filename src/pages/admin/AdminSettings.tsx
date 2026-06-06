import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save, Loader2, Globe, Phone, Mail, MapPin, Clock, DollarSign,
  Shield, Bell, Image as ImageIcon, Link as LinkIcon, AlertTriangle,
  Users, FileText, Percent, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import type { HotelSettings } from "@workspace/api-client-react";
import ImageUpload from "@/components/ImageUpload";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "CHF", "JPY", "CAD", "AUD"];

const Section = ({ icon: Icon, title, children, delay = 0 }: { icon: React.ElementType; title: string; children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-card border border-border rounded-xl p-5 space-y-4"
  >
    <h2 className="font-semibold flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-primary" /> {title}
    </h2>
    {children}
  </motion.div>
);

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    hotelName: "",
    tagline: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    websiteUrl: "",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    currency: "USD",
    taxRate: "10.00",
    maxGuests: 6,
    cancellationPolicy: "",
    maintenanceMode: false,
    emailNotifications: true,
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    linkedinUrl: "",
    logoUrl: "",
    heroImageUrl: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        hotelName: settings.hotelName ?? "",
        tagline: settings.tagline ?? "",
        description: settings.description ?? "",
        address: settings.address ?? "",
        phone: settings.phone ?? "",
        email: settings.email ?? "",
        websiteUrl: (settings as HotelSettings & { websiteUrl?: string }).websiteUrl ?? "",
        checkInTime: settings.checkInTime ?? "15:00",
        checkOutTime: settings.checkOutTime ?? "11:00",
        currency: settings.currency ?? "USD",
        taxRate: String((settings as HotelSettings & { taxRate?: string }).taxRate ?? "10.00"),
        maxGuests: Number((settings as HotelSettings & { maxGuests?: number }).maxGuests ?? 6),
        cancellationPolicy: (settings as HotelSettings & { cancellationPolicy?: string }).cancellationPolicy ?? "",
        maintenanceMode: Boolean((settings as HotelSettings & { maintenanceMode?: boolean }).maintenanceMode),
        emailNotifications: (settings as HotelSettings & { emailNotifications?: boolean }).emailNotifications ?? true,
        facebookUrl: settings.facebookUrl ?? "",
        twitterUrl: settings.twitterUrl ?? "",
        instagramUrl: settings.instagramUrl ?? "",
        youtubeUrl: (settings as HotelSettings & { youtubeUrl?: string }).youtubeUrl ?? "",
        linkedinUrl: (settings as HotelSettings & { linkedinUrl?: string }).linkedinUrl ?? "",
        logoUrl: settings.logoUrl ?? "",
        heroImageUrl: settings.heroImageUrl ?? "",
      });
    }
  }, [settings]);

  const set = (k: string, v: string | boolean | number) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync({ data: form as Partial<HotelSettings> });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--app-font-serif)] text-2xl font-bold">Hotel Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure your hotel profile, policies, and operations</p>
        </div>
        {settings && (
          <p className="text-xs text-muted-foreground hidden sm:block">
            Last saved: {new Date((settings as HotelSettings & { updatedAt?: string }).updatedAt ?? "").toLocaleString()}
          </p>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Branding */}
        <Section icon={ImageIcon} title="Branding & Identity" delay={0}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Hotel Name</Label>
              <Input value={form.hotelName} onChange={e => set("hotelName", e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label>Tagline</Label>
              <Input value={form.tagline} onChange={e => set("tagline", e.target.value)} placeholder="Luxury Redefined" className="bg-background" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className="bg-background resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Logo Image</Label>
              <ImageUpload value={form.logoUrl} onChange={url => set("logoUrl", url)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hero Background Image</Label>
              <ImageUpload value={form.heroImageUrl} onChange={url => set("heroImageUrl", url)} />
            </div>
          </div>
        </Section>

        {/* Contact */}
        <Section icon={MapPin} title="Contact Details" delay={0.04}>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input value={form.address} onChange={e => set("address", e.target.value)} className="bg-background" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</Label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} className="bg-background" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1"><Globe className="w-3 h-3" /> Website URL</Label>
            <Input value={form.websiteUrl} onChange={e => set("websiteUrl", e.target.value)} placeholder="https://grandazurehotel.com" className="bg-background" />
          </div>
        </Section>

        {/* Operations */}
        <Section icon={Clock} title="Operations & Pricing" delay={0.08}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label>Check-in Time</Label>
              <Input type="time" value={form.checkInTime} onChange={e => set("checkInTime", e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label>Check-out Time</Label>
              <Input type="time" value={form.checkOutTime} onChange={e => set("checkOutTime", e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Currency</Label>
              <Select value={form.currency} onValueChange={v => set("currency", v)}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Users className="w-3 h-3" /> Max Guests/Room</Label>
              <Input type="number" min={1} max={20} value={form.maxGuests} onChange={e => set("maxGuests", Number(e.target.value))} className="bg-background" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1"><Percent className="w-3 h-3" /> Tax Rate (%)</Label>
            <div className="relative max-w-[160px]">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={form.taxRate}
                onChange={e => set("taxRate", e.target.value)}
                className="bg-background pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
            </div>
          </div>
        </Section>

        {/* Policies */}
        <Section icon={FileText} title="Policies" delay={0.12}>
          <div className="space-y-1.5">
            <Label>Cancellation Policy</Label>
            <Textarea
              value={form.cancellationPolicy}
              onChange={e => set("cancellationPolicy", e.target.value)}
              rows={3}
              placeholder="Describe your cancellation terms…"
              className="bg-background resize-none"
            />
            <p className="text-xs text-muted-foreground">Displayed to guests at booking checkout.</p>
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications" delay={0.16}>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">Send automated emails for bookings, cancellations, and support tickets</p>
            </div>
            <Switch checked={form.emailNotifications} onCheckedChange={v => set("emailNotifications", v)} />
          </div>
        </Section>

        {/* Social Media */}
        <Section icon={LinkIcon} title="Social Media" delay={0.20}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "facebookUrl", label: "Facebook" },
              { key: "instagramUrl", label: "Instagram" },
              { key: "twitterUrl", label: "Twitter / X" },
              { key: "youtubeUrl", label: "YouTube" },
              { key: "linkedinUrl", label: "LinkedIn" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input
                  value={form[key as keyof typeof form] as string}
                  onChange={e => set(key, e.target.value)}
                  placeholder="https://..."
                  className="bg-background"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Maintenance Mode */}
        <Section icon={AlertTriangle} title="System" delay={0.24}>
          <div className="flex items-center justify-between py-1 border border-destructive/20 rounded-xl px-4 bg-destructive/5">
            <div>
              <p className="text-sm font-medium text-destructive">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">When enabled, the public site shows a maintenance page to visitors</p>
            </div>
            <Switch
              checked={form.maintenanceMode}
              onCheckedChange={v => set("maintenanceMode", v)}
              className="data-[state=checked]:bg-destructive"
            />
          </div>
        </Section>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={updateSettings.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
            {updateSettings.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
            ) : saved ? (
              <><Check className="w-4 h-4 mr-2" />Saved!</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Save Settings</>
            )}
          </Button>
          {saved && <p className="text-sm text-green-500">All changes saved successfully.</p>}
        </div>
      </form>
    </div>
  );
}
