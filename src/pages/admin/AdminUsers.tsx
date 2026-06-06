import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, Trash2, X, Check, ShieldCheck, User, UserPlus,
  Mail, Phone, Calendar, BookOpen, ChevronDown, MoreHorizontal,
  TrendingUp, Users, Crown, UserCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useListUsers, useDeleteUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { User as UserType } from "@workspace/api-client-react";

const USERS_KEY = ["/api/users"];

function StatCard({ icon: Icon, label, value, sub, color = "primary" }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color === "primary" ? "bg-primary/10" : color === "green" ? "bg-green-500/10" : color === "amber" ? "bg-amber-500/10" : "bg-blue-500/10"}`}>
        <Icon className={`w-5 h-5 ${color === "primary" ? "text-primary" : color === "green" ? "text-green-500" : color === "amber" ? "text-amber-500" : "text-blue-500"}`} />
      </div>
      <div className="font-[family-name:var(--app-font-serif)] text-2xl font-bold">{value}</div>
      <div className="text-muted-foreground text-sm mt-0.5">{label}</div>
      {sub && <div className="text-xs text-primary mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const { data, isLoading } = useListUsers();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [delId, setDelId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", phone: "", role: "user" });
  const [creating, setCreating] = useState(false);
  const [roleChanging, setRoleChanging] = useState<number | null>(null);

  const token = localStorage.getItem("proofly_token");
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const users: UserType[] = (data as { users?: UserType[] })?.users
    ?? (Array.isArray(data) ? (data as UserType[]) : []);

  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  }), [users, search, roleFilter]);

  // Stats
  const now = new Date();
  const thisMonth = users.filter(u => {
    const d = new Date(u.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const admins = users.filter(u => u.role === "admin");
  const guests = users.filter(u => u.role === "user");

  async function handleDelete(id: number) {
    try {
      await deleteUser.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("User deleted");
      setDelId(null);
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch {
      toast.error("Cannot delete this user");
    }
  }

  async function handleRoleChange(userId: number, newRole: "user" | "admin") {
    setRoleChanging(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: h,
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success(`Role changed to ${newRole}`);
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch {
      toast.error("Failed to change role");
    } finally {
      setRoleChanging(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed");
      }
      // If admin role requested, update after register
      if (newUser.role === "admin") {
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newUser.email, password: newUser.password }),
        });
        if (loginRes.ok) {
          const { user } = await loginRes.json();
          await fetch(`/api/users/${user.id}`, {
            method: "PATCH",
            headers: h,
            body: JSON.stringify({ role: "admin" }),
          });
        }
      }
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("User created successfully");
      setShowCreate(false);
      setNewUser({ name: "", email: "", password: "", phone: "", role: "user" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--app-font-serif)] text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} registered accounts</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <UserPlus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={users.length} color="primary" />
        <StatCard icon={TrendingUp} label="New This Month" value={thisMonth.length} sub={`+${thisMonth.length} this month`} color="green" />
        <StatCard icon={UserCheck} label="Guests" value={guests.length} color="blue" />
        <StatCard icon={Crown} label="Admins" value={admins.length} color="amber" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "user", "admin"] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border capitalize ${roleFilter === r ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {r === "all" ? "All" : r === "user" ? "Guests" : "Admins"}
              <span className="ml-1.5 text-xs opacity-60">
                {r === "all" ? users.length : r === "user" ? guests.length : admins.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["User", "Contact", "Role", "Joined", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 hover:bg-muted/20 cursor-pointer"
                  onClick={() => setSelectedUser(u)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">#{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground/60">{u.phone ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <Select
                      value={u.role}
                      onValueChange={v => handleRoleChange(u.id, v as "user" | "admin")}
                      disabled={roleChanging === u.id}
                    >
                      <SelectTrigger className={`w-28 h-7 text-xs border ${u.role === "admin" ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground"}`}>
                        <div className="flex items-center gap-1">
                          {roleChanging === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : u.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Guest</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    {delId === u.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDelId(null)} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDelId(u.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-sm">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={o => !o && setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                  {selectedUser.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border capitalize ${selectedUser.role === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>
                    {selectedUser.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-muted/30 rounded-xl p-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground">{selectedUser.email}</span>
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground">{selectedUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Joined {new Date(selectedUser.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">User ID #{selectedUser.id}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Change Role</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedUser.role === "user" ? "default" : "outline"}
                    className={selectedUser.role === "user" ? "bg-primary text-primary-foreground" : ""}
                    onClick={() => handleRoleChange(selectedUser.id, "user")}
                    disabled={selectedUser.role === "user" || roleChanging === selectedUser.id}
                  >
                    <User className="w-3.5 h-3.5 mr-1.5" /> Guest
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedUser.role === "admin" ? "default" : "outline"}
                    className={selectedUser.role === "admin" ? "bg-primary text-primary-foreground" : ""}
                    onClick={() => handleRoleChange(selectedUser.id, "admin")}
                    disabled={selectedUser.role === "admin" || roleChanging === selectedUser.id}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                    {roleChanging === selectedUser.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Admin"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedUser(null)}>Close</Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => { setDelId(selectedUser.id); setSelectedUser(null); }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} required minLength={8} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input value={newUser.phone} onChange={e => setNewUser(u => ({ ...u, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={v => setNewUser(u => ({ ...u, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Guest</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={creating}>
                {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Create User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
