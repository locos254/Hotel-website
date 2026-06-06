import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, BedDouble, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useListRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Room } from "@workspace/api-client-react";
import ImageUpload from "@/components/ImageUpload";

const ROOMS_KEY = ["/api/rooms"];
type RoomType = "standard" | "deluxe" | "suite" | "presidential";

const emptyForm = {
  name: "", type: "deluxe" as RoomType, pricePerNight: "", description: "", capacity: 2, floor: 1, imageUrl: "", isAvailable: true, amenities: ""
};

export default function AdminRooms() {
  const qc = useQueryClient();
  const { data: rooms, isLoading } = useListRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [open, setOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [delId, setDelId] = useState<number | null>(null);

  function openCreate() {
    setEditRoom(null);
    setForm({ ...emptyForm });
    setOpen(true);
  }

  function openEdit(room: Room) {
    setEditRoom(room);
    setForm({
      name: room.name,
      type: room.type as RoomType,
      pricePerNight: String(room.pricePerNight),
      description: room.description ?? "",
      capacity: room.capacity ?? 2,
      floor: room.floor ?? 1,
      imageUrl: room.imageUrl ?? "",
      isAvailable: room.isAvailable ?? true,
      amenities: Array.isArray(room.amenities) ? (room.amenities as string[]).join(", ") : "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      type: form.type,
      pricePerNight: Number(form.pricePerNight),
      description: form.description || "",
      capacity: form.capacity,
      floor: form.floor || undefined,
      imageUrl: form.imageUrl || "",
      isAvailable: form.isAvailable,
      amenities: form.amenities ? form.amenities.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      if (editRoom) {
        await updateRoom.mutateAsync({ id: editRoom.id, data: payload });
        toast.success("Room updated");
      } else {
        await createRoom.mutateAsync({ data: payload });
        toast.success("Room created");
      }
      qc.invalidateQueries({ queryKey: ROOMS_KEY });
      setOpen(false);
    } catch {
      toast.error("Failed to save room");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteRoom.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: ROOMS_KEY });
      toast.success("Room deleted");
      setDelId(null);
    } catch {
      toast.error("Failed to delete room");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--app-font-serif)] text-2xl font-bold">Rooms</h1>
          <p className="text-muted-foreground text-sm mt-1">{rooms?.length ?? 0} rooms registered</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Add Room
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Room", "Type", "Price/Night", "Capacity", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(rooms ?? []).map((room, i) => (
                <motion.tr key={room.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                        {room.imageUrl ? (
                          <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><BedDouble className="w-5 h-5 text-muted-foreground/40" /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{room.name}</p>
                        <p className="text-xs text-muted-foreground">Floor {room.floor ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{room.type}</span></td>
                  <td className="px-4 py-3 text-sm font-medium text-primary">${room.pricePerNight}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{room.capacity} guests</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${room.isAvailable ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                      {room.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(room)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {delId === room.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(room.id)} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDelId(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDelId(room.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Room Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as RoomType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="presidential">Presidential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Price per Night ($)</Label>
                <Input type="number" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} required min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Capacity</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} min="1" />
              </div>
              <div className="space-y-1.5">
                <Label>Floor</Label>
                <Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })} min="1" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Room Image</Label>
              <ImageUpload value={form.imageUrl} onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Amenities <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
              <Input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="King Bed, Ocean View, Mini Bar..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isAvailable} onCheckedChange={(v) => setForm({ ...form, isAvailable: v })} />
              <Label>Available for booking</Label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={createRoom.isPending || updateRoom.isPending}>
                {(createRoom.isPending || updateRoom.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editRoom ? "Save Changes" : "Create Room"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
