import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Tag, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface PromoCode {
  id: number; code: string; description: string | null; discountType: "percentage" | "fixed";
  discountValue: string; minBookingAmount: string | null; maxDiscountAmount: string | null;
  maxUses: number | null; usedCount: number; expiresAt: string | null; isActive: boolean; createdAt: string;
}

type FormState = { code: string; description: string; discountType: "percentage" | "fixed"; discountValue: string; minBookingAmount: string; maxDiscountAmount: string; maxUses: string; expiresAt: string; isActive: boolean };
const blank: FormState = { code: "", description: "", discountType: "percentage", discountValue: "", minBookingAmount: "", maxDiscountAmount: "", maxUses: "", expiresAt: "", isActive: true };

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("proofly_token");
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/promo-codes", { headers: h });
    setCodes(await res.json());
    setLoading(false);
  };

  useState(() => { load(); });

  const save = async () => {
    if (!form.code || !form.discountValue) { toast.error("Code and discount value required"); return; }
    setSaving(true);
    const body = {
      code: form.code, description: form.description || null, discountType: form.discountType,
      discountValue: parseFloat(form.discountValue), isActive: form.isActive,
      minBookingAmount: form.minBookingAmount ? parseFloat(form.minBookingAmount) : null,
      maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
    };
    const url = editId ? `/api/promo-codes/${editId}` : "/api/promo-codes";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: h, body: JSON.stringify(body) });
    if (res.ok) { toast.success(editId ? "Updated" : "Created"); setShowForm(false); setEditId(null); setForm(blank); load(); }
    else { const d = await res.json(); toast.error(d.error ?? "Failed"); }
    setSaving(false);
  };

  const del = async (id: number) => {
    if (!confirm("Delete this promo code?")) return;
    await fetch(`/api/promo-codes/${id}`, { method: "DELETE", headers: h });
    toast.success("Deleted"); load();
  };

  const toggle = async (code: PromoCode) => {
    await fetch(`/api/promo-codes/${code.id}`, { method: "PATCH", headers: h, body: JSON.stringify({ isActive: !code.isActive }) });
    load();
  };

  const startEdit = (c: PromoCode) => {
    setForm({ code: c.code, description: c.description ?? "", discountType: c.discountType as "percentage" | "fixed", discountValue: c.discountValue, minBookingAmount: c.minBookingAmount ?? "", maxDiscountAmount: c.maxDiscountAmount ?? "", maxUses: c.maxUses?.toString() ?? "", expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "", isActive: c.isActive });
    setEditId(c.id); setShowForm(true);
  };

  const setF = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--app-font-serif)]">Promo Codes</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage discount codes and promotions</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm(blank); }} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" />New Code
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">{editId ? "Edit Promo Code" : "Create Promo Code"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Code *</Label>
              <Input value={form.code} onChange={e => setF("code", e.target.value.toUpperCase())} placeholder="SUMMER20" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setF("description", e.target.value)} placeholder="Summer sale discount" />
            </div>
            <div className="space-y-1.5">
              <Label>Discount Type</Label>
              <Select value={form.discountType} onValueChange={v => setF("discountType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Discount Value *</Label>
              <Input type="number" value={form.discountValue} onChange={e => setF("discountValue", e.target.value)} placeholder={form.discountType === "percentage" ? "20" : "50"} />
            </div>
            <div className="space-y-1.5">
              <Label>Min Booking Amount ($)</Label>
              <Input type="number" value={form.minBookingAmount} onChange={e => setF("minBookingAmount", e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label>Max Discount Cap ($)</Label>
              <Input type="number" value={form.maxDiscountAmount} onChange={e => setF("maxDiscountAmount", e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label>Max Uses</Label>
              <Input type="number" value={form.maxUses} onChange={e => setF("maxUses", e.target.value)} placeholder="Unlimited" />
            </div>
            <div className="space-y-1.5">
              <Label>Expires At</Label>
              <Input type="date" value={form.expiresAt} onChange={e => setF("expiresAt", e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground">{saving ? "Saving..." : "Save"}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                {["Code", "Discount", "Uses", "Min Amount", "Expires", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {codes.map(c => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      <span className="font-mono font-semibold">{c.code}</span>
                    </div>
                    {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    {c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`}
                    {c.maxDiscountAmount && <span className="text-xs text-muted-foreground ml-1">(max ${c.maxDiscountAmount})</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.minBookingAmount ? `$${c.minBookingAmount}` : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(c)} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>
                      {c.isActive ? <><CheckCircle2 className="w-3 h-3" />Active</> : <><XCircle className="w-3 h-3" />Inactive</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(c)}><Edit2 className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => del(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {codes.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No promo codes yet. Create your first one!</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
