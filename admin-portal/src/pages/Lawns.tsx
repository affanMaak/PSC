import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  FileDown,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportLawnsReport } from "@/lib/pdfExport";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLawn,
  getLawns,
  updateLawn,
  deleteLawn,
  getLawnCategories,
} from "../../config/apis";

interface LawnCategory {
  id: number;
  category: string;
}

interface LawnForm {
  lawnCategoryId: string;
  description: string;
  minGuests: string;
  maxGuests: string;
  memberCharges: string;
  guestCharges: string;
  isOutOfService: boolean;
  outOfServiceReason: string;
  outOfServiceUntil: string;
  images: File[];
}

const initialFormState: LawnForm = {
  lawnCategoryId: "",
  description: "",
  minGuests: "",
  maxGuests: "",
  memberCharges: "",
  guestCharges: "",
  isOutOfService: false,
  outOfServiceReason: "",
  outOfServiceUntil: "",
  images: [],
};

// FIXED: Move StatusToggle outside the main component to prevent recreation
const StatusToggle = React.memo(function StatusToggle({
  isOutOfService,
  onToggle,
  reason,
  until,
  onReasonChange,
  onDateChange,
}: {
  isOutOfService: boolean;
  onToggle: (v: boolean) => void;
  reason: string;
  until: string;
  onReasonChange: (v: string) => void;
  onDateChange: (v: string) => void;
}) {
  return (
    <div className="space-y-6 p-6 rounded-xl border bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950/40 dark:to-teal-950/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className={`h-5 w-5 ${!isOutOfService ? "text-green-600" : "text-muted-foreground"}`} />
            Availability Status
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isOutOfService
              ? "This lawn is currently unavailable for booking"
              : "This lawn is active and available for booking"}
          </p>
        </div>

        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-3">
            <Label className={`font-medium text-lg ${!isOutOfService ? "text-green-600" : "text-muted-foreground"}`}>
              Active
            </Label>
            <Switch checked={!isOutOfService} onCheckedChange={(c) => c && onToggle(false)} />
          </div>
          <div className="flex items-center gap-3">
            <Label className={`font-medium text-lg ${isOutOfService ? "text-orange-600" : "text-muted-foreground"}`}>
              Out of Service
            </Label>
            <Switch checked={isOutOfService} onCheckedChange={onToggle} />
          </div>
        </div>
      </div>

      {isOutOfService && (
        <div className="p-6 border-2 border-orange-300 rounded-xl bg-orange-50/80 backdrop-blur">
          <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-4">
            <XCircle className="h-5 w-5" /> Out of Service Details
          </h4>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label>Reason for Maintenance</Label>
              <Textarea
                placeholder="e.g. Renovation, water damage, landscaping..."
                className="mt-2"
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
              />
            </div>
            <div>
              <Label>Available Again On</Label>
              <Input
                type="date"
                className="mt-2"
                value={until}
                onChange={(e) => onDateChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default function Lawns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editLawn, setEditLawn] = useState<any>(null);
  const [deleteLawnItem, setDeleteLawnItem] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [form, setForm] = useState<LawnForm>(initialFormState);
  const [editForm, setEditForm] = useState<any>({
    ...initialFormState,
    id: "",
    existingImages: [],
    newImages: [],
  });

  const { data: lawns = [], isLoading: isLoadingLawns } = useQuery({
    queryKey: ["lawns"],
    queryFn: getLawns,
  });

  const { data: lawnCategories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["lawnCategories"],
    queryFn: getLawnCategories,
  });

  const createMutation = useMutation({
    mutationFn: createLawn,
    onSuccess: () => {
      toast({ title: "Lawn created successfully" });
      queryClient.invalidateQueries({ queryKey: ["lawns"] });
      setIsAddOpen(false);
      setForm(initialFormState);
    },
    onError: () => toast({ title: "Failed to create lawn", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: updateLawn,
    onSuccess: () => {
      toast({ title: "Lawn updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["lawns"] });
      setEditLawn(null);
    },
    onError: () => toast({ title: "Failed to update lawn", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLawn,
    onSuccess: () => {
      toast({ title: "Lawn deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["lawns"] });
      setDeleteLawnItem(null);
    },
    onError: () => toast({ title: "Failed to delete lawn", variant: "destructive" }),
  });

  const categories = useMemo(() => {
    const cats = lawns.map((l: any) => l.lawnCategory?.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [lawns]);

  const filteredLawns = useMemo(() => {
    return categoryFilter === "ALL"
      ? lawns
      : lawns.filter((l: any) => l.lawnCategory?.category === categoryFilter);
  }, [lawns, categoryFilter]);

  useEffect(() => {
    if (editLawn) {
      setEditForm({
        id: editLawn.id,
        lawnCategoryId: editLawn.lawnCategoryId?.toString() || "",
        description: editLawn.description || "",
        minGuests: editLawn.minGuests?.toString() || "",
        maxGuests: editLawn.maxGuests?.toString() || "",
        memberCharges: editLawn.memberCharges?.toString() || "",
        guestCharges: editLawn.guestCharges?.toString() || "",
        isOutOfService: editLawn.isOutOfService || false,
        outOfServiceReason: editLawn.outOfServiceReason || "",
        outOfServiceUntil: editLawn.outOfServiceUntil?.split("T")[0] || "",
        existingImages: (editLawn.images || []).map((img: any) => img.publicId || img.url || img),
        newImages: [],
        images: [],
      });
    }
  }, [editLawn]);

  const handleCreate = useCallback(() => {
    if (!form.lawnCategoryId || !form.minGuests || !form.maxGuests) {
      toast({ title: "Category, Min & Max Guests are required", variant: "destructive" });
      return;
    }

    const fd = new FormData();
    fd.append("lawnCategoryId", form.lawnCategoryId);
    fd.append("description", form.description);
    fd.append("minGuests", form.minGuests);
    fd.append("maxGuests", form.maxGuests);
    fd.append("memberCharges", form.memberCharges || "0");
    fd.append("guestCharges", form.guestCharges || "0");
    fd.append("isOutOfService", String(form.isOutOfService));
    if (form.isOutOfService) {
      fd.append("outOfServiceReason", form.outOfServiceReason);
      fd.append("outOfServiceUntil", form.outOfServiceUntil);
    }
    form.images.forEach((file) => fd.append("files", file));
    createMutation.mutate(fd);
  }, [form, createMutation, toast]);

  const handleUpdate = useCallback(() => {
    const fd = new FormData();
    fd.append("id", editForm.id);
    fd.append("lawnCategoryId", editForm.lawnCategoryId);
    fd.append("description", editForm.description);
    fd.append("minGuests", editForm.minGuests);
    fd.append("maxGuests", editForm.maxGuests);
    fd.append("memberCharges", editForm.memberCharges);
    fd.append("guestCharges", editForm.guestCharges);
    fd.append("isOutOfService", String(editForm.isOutOfService));
    if (editForm.isOutOfService) {
      fd.append("outOfServiceReason", editForm.outOfServiceReason);
      fd.append("outOfServiceUntil", editForm.outOfServiceUntil);
    }
    editForm.existingImages.forEach((pid: string) => fd.append("existingimgs", pid));
    editForm.newImages.forEach((file: File) => fd.append("files", file));
    updateMutation.mutate(fd);
  }, [editForm, updateMutation]);

  return (
    <div className="space-y-8 ">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Manage Lawns</h1>
          <p className="text-muted-foreground">Configure outdoor event spaces</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => exportLawnsReport(lawns)}>
            <FileDown className="h-4 w-4 mr-2" /> Export PDF
          </Button>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ADD DIALOG */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-5 w-5" /> Add Lawn
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Add New Lawn</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-6">
                {/* All other fields (category, guests, charges, description, images) */}
                <div>
                  <Label>Lawn Category *</Label>
                  {isLoadingCategories ? (
                    <div className="h-10 bg-muted animate-pulse rounded-md mt-2" />
                  ) : (
                    <Select value={form.lawnCategoryId} onValueChange={(v) => setForm(prev => ({ ...prev, lawnCategoryId: v }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select lawn category" />
                      </SelectTrigger>
                      <SelectContent>
                        {lawnCategories.map((cat: LawnCategory) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><Label>Min Guests *</Label><Input type="number" value={form.minGuests} onChange={e => setForm(prev => ({ ...prev, minGuests: e.target.value }))} placeholder="100" /></div>
                  <div><Label>Max Guests *</Label><Input type="number" value={form.maxGuests} onChange={e => setForm(prev => ({ ...prev, maxGuests: e.target.value }))} placeholder="600" /></div>
                  <div><Label>Member Charges (PKR)</Label><Input type="number" value={form.memberCharges} onChange={e => setForm(prev => ({ ...prev, memberCharges: e.target.value }))} placeholder="35000" /></div>
                  <div><Label>Guest Charges (PKR)</Label><Input type="number" value={form.guestCharges} onChange={e => setForm(prev => ({ ...prev, guestCharges: e.target.value }))} placeholder="45000" /></div>
                </div>

                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={4} placeholder="Beautiful green lawn..." /></div>

                <div>
                  <Label>Images (Max 5)</Label>
                  <ImageUpload
                    images={form.images.map(f => URL.createObjectURL(f))}
                    onChange={files => setForm(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 5) }))}
                    onRemove={i => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                    maxImages={5}
                  />
                </div>

                {/* FIXED STATUS TOGGLE – ADD */}
                <StatusToggle
                  isOutOfService={form.isOutOfService}
                  onToggle={(v) => setForm(prev => ({ ...prev, isOutOfService: v }))}
                  reason={form.outOfServiceReason}
                  until={form.outOfServiceUntil}
                  onReasonChange={(v) => setForm(prev => ({ ...prev, outOfServiceReason: v }))}
                  onDateChange={(v) => setForm(prev => ({ ...prev, outOfServiceUntil: v }))}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Lawn"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* TABLE */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isLoadingLawns ? (
            <div className="flex justify-center py-32"><Loader2 className="h-12 w-12 animate-spin" /></div>
          ) : filteredLawns.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground text-lg">No lawns found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Member Rate</TableHead>
                  <TableHead>Guest Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLawns.map((lawn: any) => (
                  <TableRow key={lawn.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold">{lawn.lawnCategory?.category || "—"}</TableCell>
                    <TableCell className="max-w-md truncate">{lawn.description}</TableCell>
                    <TableCell>{lawn.minGuests} - {lawn.maxGuests}</TableCell>
                    <TableCell>PKR {Number(lawn.memberCharges).toLocaleString()}</TableCell>
                    <TableCell>PKR {Number(lawn.guestCharges).toLocaleString()}</TableCell>
                    <TableCell>
                      {lawn.isOutOfService ? (
                        <Badge variant="destructive" className="font-medium">Out of Service</Badge>
                      ) : (
                        <Badge className="bg-emerald-600 text-white font-medium">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditLawn(lawn)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteLawnItem(lawn)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* EDIT DIALOG */}
      <Dialog open={!!editLawn} onOpenChange={() => setEditLawn(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Lawn</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            {/* All edit fields (same as add) */}
            <div>
              <Label>Lawn Category *</Label>
              <Select value={editForm.lawnCategoryId} onValueChange={v => setEditForm(prev => ({ ...prev, lawnCategoryId: v }))}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {lawnCategories.map((cat: LawnCategory) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><Label>Min Guests</Label><Input type="number" value={editForm.minGuests} onChange={e => setEditForm(prev => ({ ...prev, minGuests: e.target.value }))} /></div>
              <div><Label>Max Guests</Label><Input type="number" value={editForm.maxGuests} onChange={e => setEditForm(prev => ({ ...prev, maxGuests: e.target.value }))} /></div>
              <div><Label>Member Charges</Label><Input type="number" value={editForm.memberCharges} onChange={e => setEditForm(prev => ({ ...prev, memberCharges: e.target.value }))} /></div>
              <div><Label>Guest Charges</Label><Input type="number" value={editForm.guestCharges} onChange={e => setEditForm(prev => ({ ...prev, guestCharges: e.target.value }))} /></div>
            </div>

            <div><Label>Description</Label><Textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} rows={4} /></div>

            <div>
              <Label>Current Images</Label>
              <div className="flex flex-wrap gap-3 mt-3">
                {editLawn?.images?.map((img: any, i: number) => (
                  <img key={i} src={img.url || img} alt="lawn" className="h-28 w-28 object-cover rounded-lg border shadow" />
                ))}
              </div>
            </div>

            <div>
              <Label>Add New Images (Max 5)</Label>
              <ImageUpload
                images={editForm.newImages.map((f: File) => URL.createObjectURL(f))}
                onChange={files => setEditForm(prev => ({ ...prev, newImages: [...prev.newImages, ...files].slice(0, 5) }))}
                onRemove={i => setEditForm(prev => ({ ...prev, newImages: prev.newImages.filter((_: any, idx: number) => idx !== i) }))}
                maxImages={5}
              />
            </div>

            {/* FIXED STATUS TOGGLE – EDIT */}
            <StatusToggle
              isOutOfService={editForm.isOutOfService}
              onToggle={(v) => setEditForm(prev => ({ ...prev, isOutOfService: v }))}
              reason={editForm.outOfServiceReason}
              until={editForm.outOfServiceUntil}
              onReasonChange={(v) => setEditForm(prev => ({ ...prev, outOfServiceReason: v }))}
              onDateChange={(v) => setEditForm(prev => ({ ...prev, outOfServiceUntil: v }))}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLawn(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Lawn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={!!deleteLawnItem} onOpenChange={() => setDeleteLawnItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Lawn</DialogTitle></DialogHeader>
          <p className="py-6">Are you sure you want to delete this lawn? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLawnItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteLawnItem.id)}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}