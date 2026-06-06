import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user, token, login } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${user!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, phone: phone || undefined }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      login(token!, updated);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    setSavingPw(true);
    try {
      const res = await fetch(`/api/users/${user!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: newPw }),
      });
      if (!res.ok) throw new Error("Password update failed");
      toast.success("Password updated successfully");
      setCurrentPw("");
      setNewPw("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="pt-24 min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-10">
            <h1 className="font-[family-name:var(--app-font-serif)] text-3xl font-bold mb-1">My Profile</h1>
            <p className="text-muted-foreground">Manage your Grand Azure account</p>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-10 p-6 bg-card border border-border rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary text-3xl font-bold font-[family-name:var(--app-font-serif)]">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-[family-name:var(--app-font-serif)] text-xl font-semibold">{user?.name}</h2>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize border border-primary/20">{user?.role}</span>
            </div>
          </div>

          {/* Profile form */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Personal Information
            </h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pname">Full Name</Label>
                <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pemail">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="pemail" value={user?.email} disabled className="bg-muted pl-9 cursor-not-allowed" />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pphone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="pphone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="bg-background pl-9" />
                </div>
              </div>
              <Button type="submit" disabled={savingProfile} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </form>
          </div>

          {/* Password form */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Change Password
            </h3>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newpw">New Password</Label>
                <div className="relative">
                  <Input
                    id="newpw"
                    type={showNew ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    required
                    className="bg-background pr-10"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={savingPw} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {savingPw ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Update Password
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
