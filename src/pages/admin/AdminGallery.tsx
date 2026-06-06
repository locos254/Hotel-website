import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, X, Check, Loader2, Image as ImageIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useListGallery, useCreateGalleryItem, useDeleteGalleryItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { GalleryItem } from "@workspace/api-client-react";
import ImageUpload from "@/components/ImageUpload";

const CATS = ["interior", "rooms", "amenities", "dining", "exterior", "events"];
const GALLERY_KEY = ["/api/gallery"];

export default function AdminGallery() {
  const qc = useQueryClient();
  const { data: gallery, isLoading } = useListGallery();
  const createItem = useCreateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ imageUrl: "", title: "", category: "interior" });
  const [delId, setDelId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const items: GalleryItem[] = Array.isArray(gallery) ? (gallery as GalleryItem[]) : [];
  const filtered = filter === "all" ? items : items.filter(i => i.category === filter);

  function openCreate() {
    setEditItem(null);
    setForm({ imageUrl: "", title: "", category: "interior" });
    setOpen(true);
  }

  function openEdit(item: GalleryItem) {
    setEditItem(item);
    setForm({ imageUrl: item.imageUrl, title: item.title, category: item.category });
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.imageUrl) { toast.error("Please provide an image URL or upload a file"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("proofly_token");
      const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      if (editItem) {
        const res = await fetch(`/api/gallery/${editItem.id}`, {
          method: "PATCH",
          headers: h,
          body: JSON.stringify({ imageUrl: form.imageUrl, title: form.title, category: form.category }),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Image updated");
      } else {
        await createItem.mutateAsync({ data: { ...form, sortOrder: items.length + 1 } });
        toast.success("Image added");
      }
      qc.invalidateQueries({ queryKey: GALLERY_KEY });
      setOpen(false);
    } catch {
      toast.error("Failed to save image");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteItem.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: GALLERY_KEY });
      toast.success("Image removed");
      setDelId(null);
    } catch {
      toast.error("Failed to delete image");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--app-font-serif)] text-2xl font-bold">Gallery</h1>
          <p className="text-muted-foreground text-sm mt-1">{items.length} images</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Add Image
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...CATS].map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${filter === c ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>No gallery images {filter !== "all" ? `in "${filter}"` : "yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group relative rounded-xl overflow-hidden border border-border bg-card"
            >
              <div className="relative">
                <img src={item.imageUrl} alt={item.title} className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-primary/80 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {delId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-destructive/80 text-white"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDelId(null)} className="p-1.5 rounded-lg bg-black/60 text-white"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDelId(item.id)} className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-destructive/80 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Gallery Image" : "Add Gallery Image"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Image</Label>
              <ImageUpload value={form.imageUrl} onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={saving || createItem.isPending}>
                {(saving || createItem.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editItem ? "Save Changes" : "Add Image"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
