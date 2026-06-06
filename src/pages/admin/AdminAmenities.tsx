import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, Loader2, Sparkles, Waves, UtensilsCrossed, Dumbbell, Bell, Briefcase, Car, Wine, Umbrella, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useListAmenities, useCreateAmenity, useUpdateAmenity, useDeleteAmenity } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Amenity } from "@workspace/api-client-react";

const ICONS = ["Waves", "Sparkles", "UtensilsCrossed", "Dumbbell", "Bell", "Briefcase", "Car", "Wine", "Umbrella", "Users"];
const CATS = ["Recreation", "Wellness", "Dining", "Business", "Service"];
const iconMap: Record<string, React.ElementType> = { Waves, Sparkles, UtensilsCrossed, Dumbbell, Bell, Briefcase, Car, Wine, Umbrella, Users };

const empty = { name: "", icon: "Sparkles", description: "", category: "Wellness" };

export default function AdminAmenities() {
  const qc = useQueryClient();
  const { data: amenities, isLoading } = useListAmenities();
  const createAmenity = useCreateAmenity();
  const updateAmenity = useUpdateAmenity();
  const deleteAmenity = useDeleteAmenity();

  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Amenity | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [delId, setDelId] = useState<number | null>(null);

  const list: Amenity[] = Array.isArray(amenities) ? (amenities as Amenity[]) : [];

  function openCreate() { setEditItem(null); setForm({ ...empty }); setOpen(true); }
  function openEdit(a: Amenity) {
    setEditItem(a);
    setForm({ name: a.name, icon: a.icon, description: a.description ?? "", category: a.category ?? "Wellness" });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editItem) {
        await updateAmenity.mutateAsync({ id: editItem.id, data: form });
        toast.success("Amenity updated");
      } else {
        await createAmenity.mutateAsync({ data: form });
        toast.success("Amenity added");
      }
      qc.invalidateQueries({ queryKey: ["/api/amenities"] });
      setOpen(false);
    } catch {
      toast.error("Failed to save amenity");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteAmenity.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: ["/api/amenities"] });
      toast.success("Amenity deleted");
      setDelId(null);
    } catch {
      toast.error("Failed to delete amenity");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--app-font-serif)] text-2xl font-bold">Amenities</h1>
          <p className="text-muted-foreground text-sm mt-1">{list.length} amenities</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Add Amenity
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((a, i) => {
            const Icon = iconMap[a.icon] ?? Sparkles;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{a.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>
                      <span className="text-xs text-primary/70 mt-1 inline-block">{a.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {delId === a.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDelId(null)} className="p-1.5 rounded hover:bg-muted text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setDelId(a.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem ? "Edit Amenity" : "Add Amenity"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ICONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createAmenity.isPending || updateAmenity.isPending}>
                {(createAmenity.isPending || updateAmenity.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editItem ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
