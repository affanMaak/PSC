import { useState } from "react";
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
  Trash2,
  PencilLine,
  FileDown,
  Image as ImageIcon,
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
import { useToast } from "@/hooks/use-toast";
import { exportRoomTypesReport } from "@/lib/pdfExport";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRoomType,
  deleteRoomType,
  getRoomTypes,
  updateRoomType,
} from "../../config/apis";
import { ImageUpload } from "@/components/ImageUpload";

interface RoomType {
  id: string;
  type: string;
  priceMember: number;
  priceGuest: number;
  images?: { url: string; publicId: string }[];
}

export default function RoomTypes() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editType, setEditType] = useState<RoomType | null>(null);
  const [deleteType, setDeleteType] = useState<RoomType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Separate image states for Add and Edit
  const [addImages, setAddImages] = useState<File[]>([]);
  const [addPreviewImages, setAddPreviewImages] = useState<string[]>([]);

  const [editImages, setEditImages] = useState<File[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editPreviewImages, setEditPreviewImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    type: "",
    priceMember: "",
    priceGuest: "",
  });

  const [editFormData, setEditFormData] = useState({
    type: "",
    priceMember: "",
    priceGuest: "",
  });

  // --- Queries ---
  const { data: roomTypes = [] } = useQuery({
    queryKey: ["roomTypes"],
    queryFn: getRoomTypes,
  });

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => createRoomType(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
      toast({ title: "Room type added" });
      setIsAddOpen(false);
      resetAddForm();
    },
    onError: () =>
      toast({ title: "Failed to add room type", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateRoomType(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
      toast({ title: "Room type updated" });
      setEditType(null);
      resetEditForm();
    },
    onError: () =>
      toast({ title: "Failed to update room type", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRoomType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
      toast({ title: "Room type deleted" });
      setDeleteType(null);
    },
    onError: () =>
      toast({ title: "Failed to delete room type", variant: "destructive" }),
  });

  // --- Form Reset Functions ---
  const resetAddForm = () => {
    setFormData({
      type: "",
      priceMember: "",
      priceGuest: "",
    });
    setAddImages([]);
    setAddPreviewImages([]);
  };

  const resetEditForm = () => {
    setEditFormData({
      type: "",
      priceMember: "",
      priceGuest: "",
    });
    setEditImages([]);
    setEditExistingImages([]);
    setEditPreviewImages([]);
  };

  // --- Image Handlers for Add Dialog ---
  const handleAddImageAdd = (files: File[]) => {
    const totalImages = addPreviewImages.length + files.length;
    if (totalImages > 5) {
      toast({
        title: "Maximum 5 images allowed per room type",
        variant: "destructive",
      });
      return;
    }
    setAddImages((prev) => [...prev, ...files]);
    setAddPreviewImages((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleAddImageRemove = (index: number) => {
    setAddImages((prev) => prev.filter((_, i) => i !== index));
    setAddPreviewImages((prev) => prev.filter((_, i) => i !== index));

    // Clean up object URLs
    URL.revokeObjectURL(addPreviewImages[index]);
  };

  // --- Image Handlers for Edit Dialog ---
  const handleEditImageAdd = (files: File[]) => {
    const totalImages = editPreviewImages.length + files.length;
    if (totalImages > 5) {
      toast({
        title: "Maximum 5 images allowed per room type",
        variant: "destructive",
      });
      return;
    }
    setEditImages((prev) => [...prev, ...files]);
    setEditPreviewImages((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleEditImageRemove = (index: number) => {
    const isOldImage = index < (editType?.images?.length || 0);

    if (isOldImage && editType) {
      // Remove from existing images (by publicId)
      const oldImg: any = editType.images![index];
      setEditExistingImages((prev) =>
        prev.filter((id) => id !== oldImg.publicId)
      );
    } else {
      // Remove from new images
      const newIndex = index - (editType?.images?.length || 0);
      setEditImages((prev) => prev.filter((_, i) => i !== newIndex));
    }

    // Remove from preview and clean up URL
    const removedUrl = editPreviewImages[index];
    setEditPreviewImages((prev) => prev.filter((_, i) => i !== index));

    // Only revoke URLs for new images (not existing ones)
    if (!isOldImage) {
      URL.revokeObjectURL(removedUrl);
    }
  };

  // --- Form Data Builders ---
  const buildAddFormData = () => {
    const fd = new FormData();
    fd.append("type", formData.type);
    fd.append("priceMember", formData.priceMember);
    fd.append("priceGuest", formData.priceGuest);

    // Add images
    addImages.forEach((file) => fd.append("files", file));

    return fd;
  };

  const buildEditFormData = () => {
    const fd = new FormData();
    fd.append("type", editFormData.type);
    fd.append("priceMember", editFormData.priceMember);
    fd.append("priceGuest", editFormData.priceGuest);

    // Add new images
    editImages.forEach((file) => fd.append("files", file));

    // Add existing images that should be kept
    editExistingImages.forEach((publicId) =>
      fd.append("existingimgs", publicId)
    );

    return fd;
  };

  // --- Form Handlers ---
  const handleAdd = () => {
    if (!formData.type || !formData.priceMember || !formData.priceGuest) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }

    // Validate numeric values
    if (
      isNaN(Number(formData.priceMember)) ||
      isNaN(Number(formData.priceGuest))
    ) {
      toast({ title: "Prices must be valid numbers", variant: "destructive" });
      return;
    }

    const fd = buildAddFormData();
    console.log("Submitting Add FormData:", {
      type: formData.type,
      priceMember: formData.priceMember,
      priceGuest: formData.priceGuest,
      imageCount: addImages.length,
    });

    createMutation.mutate(fd);
  };

  const handleEdit = (type: RoomType) => {
    setEditType(type);
    setEditFormData({
      type: type.type,
      priceMember: type.priceMember.toString(),
      priceGuest: type.priceGuest.toString(),
    });

    // Set existing images for editing
    const fullImages = type.images || [];
    setEditExistingImages(fullImages.map((img: any) => img.publicId));
    setEditPreviewImages(fullImages.map((img: any) => img.url));
    setEditImages([]);
  };

  const handleUpdate = () => {
    if (!editType) return;

    if (
      !editFormData.type ||
      !editFormData.priceMember ||
      !editFormData.priceGuest
    ) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }

    // Validate numeric values
    if (
      isNaN(Number(editFormData.priceMember)) ||
      isNaN(Number(editFormData.priceGuest))
    ) {
      toast({ title: "Prices must be valid numbers", variant: "destructive" });
      return;
    }

    const fd = buildEditFormData();
    console.log("Submitting Edit FormData:", {
      id: editType.id,
      type: editFormData.type,
      priceMember: editFormData.priceMember,
      priceGuest: editFormData.priceGuest,
      existingImages: editExistingImages.length,
      newImages: editImages.length,
    });

    updateMutation.mutate({
      id: editType.id,
      formData: fd,
    });
  };

  const closeAddDialog = () => {
    setIsAddOpen(false);
    resetAddForm();
  };

  const closeEditDialog = () => {
    setEditType(null);
    resetEditForm();
  };

  return (
    <div className="space-y-6 animate-fade-in overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Room Types
          </h2>
          <p className="text-muted-foreground">
            Manage room categories, pricing and images
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportRoomTypesReport(roomTypes)}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" /> Export PDF
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Room Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Room Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <Label>Type Name *</Label>
                  <Input
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, type: e.target.value }))
                    }
                    placeholder="e.g., Deluxe Room, Suite"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Member Price (PKR) *</Label>
                    <Input
                      type="number"
                      value={formData.priceMember}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          priceMember: e.target.value,
                        }))
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Guest Price (PKR) *</Label>
                    <Input
                      type="number"
                      value={formData.priceGuest}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          priceGuest: e.target.value,
                        }))
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Image Upload Section for Add */}
                <div>
                  <Label>Room Type Images (Max 5)</Label>
                  <div className="mt-2">
                    <ImageUpload
                      images={addPreviewImages}
                      onChange={handleAddImageAdd}
                      maxImages={5}
                      onRemove={handleAddImageRemove}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload images that represent this room type. Maximum 5
                    images allowed.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeAddDialog}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Room Type"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Member Price</TableHead>
                <TableHead>Guest Price</TableHead>
                <TableHead>Images</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomTypes.map((type: RoomType) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.type}</TableCell>
                  <TableCell>PKR {type.priceMember}</TableCell>
                  <TableCell>PKR {type.priceGuest}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {type.images?.slice(0, 3)?.map((img: any, i: number) => (
                        <img
                          key={i}
                          src={img.url}
                          alt={type.type}
                          className="w-10 h-10 object-cover rounded border"
                        />
                      ))}
                      {type.images && type.images.length > 3 && (
                        <div className="w-10 h-10 rounded border flex items-center justify-center text-xs text-muted-foreground bg-muted">
                          +{type.images.length - 3}
                        </div>
                      )}
                      {(!type.images || type.images.length === 0) && (
                        <div className="w-10 h-10 rounded border flex items-center justify-center text-xs text-muted-foreground bg-muted">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        onClick={() => handleEdit(type)}
                        variant="ghost"
                      >
                        <PencilLine className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteType(type)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editType} onOpenChange={closeEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Room Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label>Type Name *</Label>
              <Input
                value={editFormData.type}
                onChange={(e) =>
                  setEditFormData((p) => ({ ...p, type: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Member Price (PKR) *</Label>
                <Input
                  type="number"
                  value={editFormData.priceMember}
                  onChange={(e) =>
                    setEditFormData((p) => ({
                      ...p,
                      priceMember: e.target.value,
                    }))
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label>Guest Price (PKR) *</Label>
                <Input
                  type="number"
                  value={editFormData.priceGuest}
                  onChange={(e) =>
                    setEditFormData((p) => ({
                      ...p,
                      priceGuest: e.target.value,
                    }))
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Image Upload Section for Edit */}
            <div>
              <Label>Room Type Images (Max 5)</Label>
              <div className="mt-2">
                <ImageUpload
                  images={editPreviewImages}
                  onChange={handleEditImageAdd}
                  maxImages={5}
                  onRemove={handleEditImageRemove}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {editPreviewImages.length}/5 images. Existing images will be
                kept unless removed.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Room Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteType} onOpenChange={() => setDeleteType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room Type</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{deleteType?.type}</strong>?
            This action cannot be undone and will remove all associated images.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteType(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteType && deleteMutation.mutate(deleteType.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
