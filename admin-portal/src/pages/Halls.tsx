import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle,
  XCircle,
  FileDown,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportHallsReport } from "@/lib/pdfExport";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createHall as createHallApi,
  updateHall as updateHallApi,
  getHalls,
  deleteHall as deleteHallApi,
} from "../../config/apis";

export default function Halls() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editHall, setEditHall] = useState<any>(null);
  const [deleteHallData, setDeleteHallData] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Add Form State
  const [form, setForm] = useState({
    name: "",
    capacity: "",
    chargesMembers: "",
    chargesGuests: "",
    description: "",
    isActive: true,
    isOutOfService: false,
    outOfServiceReason: "",
    outOfServiceUntil: "",
    images: [] as File[],
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    capacity: "",
    chargesMembers: "",
    chargesGuests: "",
    description: "",
    isActive: true,
    isOutOfService: false,
    outOfServiceReason: "",
    outOfServiceUntil: "",
    existingImages: [] as string[],
    newImages: [] as File[],
  });

  const { data: halls = [], isLoading } = useQuery<any[]>({
    queryKey: ["halls"],
    queryFn: getHalls,
  });

  const createMutation = useMutation({
    mutationFn: createHallApi,
    onSuccess: () => {
      toast({ title: "Hall created successfully" });
      queryClient.invalidateQueries({ queryKey: ["halls"] });
      setIsAddOpen(false);
      resetAddForm();
    },
    onError: () =>
      toast({ title: "Failed to create hall", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: updateHallApi,
    onSuccess: () => {
      toast({ title: "Hall updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["halls"] });
      setEditHall(null);
    },
    onError: () =>
      toast({ title: "Failed to update hall", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHallApi,
    onSuccess: () => {
      toast({ title: "Hall deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["halls"] });
      setDeleteHallData(null);
    },
    onError: () =>
      toast({ title: "Failed to delete hall", variant: "destructive" }),
  });

  const filteredHalls = halls?.filter((hall: any) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "ACTIVE") return hall.isActive && !hall.isOutOfService;
    if (statusFilter === "INACTIVE")
      return !hall.isActive || hall.isOutOfService;
    return true;
  });

  const resetAddForm = () => {
    setForm({
      name: "",
      capacity: "",
      chargesMembers: "",
      chargesGuests: "",
      description: "",
      isActive: true,
      isOutOfService: false,
      outOfServiceReason: "",
      outOfServiceUntil: "",
      images: [],
    });
  };

  useEffect(() => {
    if (editHall) {
      setEditForm({
        name: editHall.name || "",
        capacity: editHall.capacity || "",
        chargesMembers: editHall.chargesMembers || "",
        chargesGuests: editHall.chargesGuests || "",
        description: editHall.description || "",
        isActive: editHall.isActive || false,
        isOutOfService: editHall.isOutOfService || false,
        outOfServiceReason: editHall.outOfServiceReason || "",
        outOfServiceUntil: editHall.outOfServiceUntil?.split("T")[0] || "",
        existingImages:
          editHall.images?.map((img: any) => img.publicId || img.url || img) ||
          [],
        newImages: [],
      });
    }
  }, [editHall]);

  const handleCreateHall = () => {
    if (!form.name || !form.capacity) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("capacity", form.capacity);
    fd.append("chargesMembers", form.chargesMembers || "0");
    fd.append("chargesGuests", form.chargesGuests || "0");
    fd.append("description", form.description);
    fd.append("isActive", String(form.isActive && !form.isOutOfService));
    fd.append("isOutOfService", String(form.isOutOfService));
    fd.append("outOfServiceReason", form.outOfServiceReason);
    fd.append("outOfServiceUntil", form.outOfServiceUntil);
    form.images.forEach((file) => fd.append("files", file));
    createMutation.mutate(fd);
  };

  const handleUpdateHall = () => {
    if (!editHall) return;
    const fd = new FormData();
    fd.append("id", String(editHall.id));
    fd.append("name", editForm.name);
    fd.append("capacity", editForm.capacity);
    fd.append("chargesMembers", editForm.chargesMembers);
    fd.append("chargesGuests", editForm.chargesGuests);
    fd.append("description", editForm.description);
    fd.append(
      "isActive",
      String(editForm.isActive && !editForm.isOutOfService)
    );
    fd.append("isOutOfService", String(editForm.isOutOfService));
    fd.append("outOfServiceReason", editForm.outOfServiceReason);
    fd.append("outOfServiceUntil", editForm.outOfServiceUntil);
    editForm.existingImages.forEach((pid) => fd.append("existingimgs", pid));
    editForm.newImages.forEach((file) => fd.append("files", file));
    updateMutation.mutate(fd);
  };

  const handleDeleteHall = () => {
    if (deleteHallData) deleteMutation.mutate(deleteHallData.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Halls</h2>
          <p className="text-muted-foreground">
            Manage event halls and their availability
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => exportHallsReport(halls)}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Halls</SelectItem>
              <SelectItem value="ACTIVE">Active Only</SelectItem>
              <SelectItem value="INACTIVE">
                Inactive / Out of Service
              </SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Hall
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Hall</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Hall Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Main Auditorium"
                    />
                  </div>
                  <div>
                    <Label>Capacity *</Label>
                    <Input
                      type="number"
                      value={form.capacity}
                      onChange={(e) =>
                        setForm({ ...form, capacity: e.target.value })
                      }
                      placeholder="300"
                    />
                  </div>
                  <div>
                    <Label>Member Charges (PKR)</Label>
                    <Input
                      type="number"
                      value={form.chargesMembers}
                      onChange={(e) =>
                        setForm({ ...form, chargesMembers: e.target.value })
                      }
                      placeholder="25000"
                    />
                  </div>
                  <div>
                    <Label>Guest Charges (PKR)</Label>
                    <Input
                      type="number"
                      value={form.chargesGuests}
                      onChange={(e) =>
                        setForm({ ...form, chargesGuests: e.target.value })
                      }
                      placeholder="35000"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Luxurious hall with AC, sound system..."
                  />
                </div>
                <div>
                  <Label>Hall Images (Max 5)</Label>
                  <ImageUpload
                    images={form.images.map((f) => URL.createObjectURL(f))}
                    onChange={(files) =>
                      setForm((prev) => ({
                        ...prev,
                        images: [...prev.images, ...files].slice(0, 5),
                      }))
                    }
                    onRemove={(i) =>
                      setForm((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, idx) => idx !== i),
                      }))
                    }
                    maxImages={5}
                  />
                </div>

                {/* Alternative Switches */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div>
                      <Label className="text-base font-medium">
                        Hall Availability Status
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {form.isOutOfService
                          ? "Out of Service (Not Available)"
                          : form.isActive
                          ? "Active & Available for Booking"
                          : "Inactive (Hidden from users)"}
                      </p>
                    </div>
                    <div className="flex gap-8 items-center">
                      <div className="flex items-center gap-3">
                        <Label>Active</Label>
                        <Switch
                          checked={form.isActive && !form.isOutOfService}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setForm({
                                ...form,
                                isActive: true,
                                isOutOfService: false,
                              });
                            } else {
                              setForm({ ...form, isActive: false });
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Label>Out of Service</Label>
                        <Switch
                          checked={form.isOutOfService}
                          onCheckedChange={(checked) => {
                            setForm({
                              ...form,
                              isOutOfService: checked,
                              isActive: checked ? false : form.isActive,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {form.isOutOfService && (
                    <div className="space-y-4 p-6 border-2 border-orange-300 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-300">
                        Out of Service Details
                      </h4>
                      <div>
                        <Label>Reason</Label>
                        <Textarea
                          value={form.outOfServiceReason}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              outOfServiceReason: e.target.value,
                            })
                          }
                          placeholder="Renovation, AC repair, etc."
                        />
                      </div>
                      <div>
                        <Label>Available Again On</Label>
                        <Input
                          type="date"
                          value={form.outOfServiceUntil}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              outOfServiceUntil: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddOpen(false);
                    resetAddForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateHall}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Hall"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading halls...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Member Rate</TableHead>
                  <TableHead>Guest Rate</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHalls.map((hall: any) => (
                  <TableRow key={hall.id}>
                    <TableCell className="font-medium">{hall.name}</TableCell>
                    <TableCell>{hall.capacity} guests</TableCell>
                    <TableCell>
                      PKR {Number(hall.chargesMembers).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      PKR {Number(hall.chargesGuests).toLocaleString()}
                    </TableCell>
                    <TableCell className="grid grid-cols-2">
                      {hall.images ? hall.images?.slice(0, 5).map((img: any, idx: number) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt="hall"
                        className="w-12 h-12 rounded object-cover border"
                      />
                    )): "-"}
                    </TableCell>
                    <TableCell>
                      {hall.isOutOfService ? (
                        <Badge variant="destructive">Out of Service</Badge>
                      ) : hall.isActive ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" /> Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditHall(hall)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteHallData(hall)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog - Same Alternative Logic */}
      <Dialog open={!!editHall} onOpenChange={() => setEditHall(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hall: {editHall?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) =>
                    setEditForm({ ...editForm, capacity: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Member Charges</Label>
                <Input
                  type="number"
                  value={editForm.chargesMembers}
                  onChange={(e) =>
                    setEditForm({ ...editForm, chargesMembers: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Guest Charges</Label>
                <Input
                  type="number"
                  value={editForm.chargesGuests}
                  onChange={(e) =>
                    setEditForm({ ...editForm, chargesGuests: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label>Current Images</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {editHall?.images?.map((img: any, i: number) => (
                  <img
                    key={i}
                    src={img.url || img}
                    alt="hall"
                    className="h-24 w-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Add New Images</Label>
              <ImageUpload
                images={editForm.newImages.map((f) => URL.createObjectURL(f))}
                onChange={(files) =>
                  setEditForm((prev) => ({
                    ...prev,
                    newImages: [...prev.newImages, ...files].slice(0, 5),
                  }))
                }
                onRemove={(i) =>
                  setEditForm((prev) => ({
                    ...prev,
                    newImages: prev.newImages.filter((_, idx) => idx !== i),
                  }))
                }
                maxImages={5}
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div>
                  <Label className="text-base font-medium">Hall Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {editForm.isOutOfService
                      ? "Out of Service"
                      : editForm.isActive
                      ? "Active & Available"
                      : "Inactive"}
                  </p>
                </div>
                <div className="flex gap-8 items-center">
                  <div className="flex items-center gap-3">
                    <Label>Active</Label>
                    <Switch
                      checked={editForm.isActive && !editForm.isOutOfService}
                      onCheckedChange={(checked) => {
                        if (checked)
                          setEditForm({
                            ...editForm,
                            isActive: true,
                            isOutOfService: false,
                          });
                        else setEditForm({ ...editForm, isActive: false });
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label>Out of Service</Label>
                    <Switch
                      checked={editForm.isOutOfService}
                      onCheckedChange={(checked) => {
                        setEditForm({
                          ...editForm,
                          isOutOfService: checked,
                          isActive: checked ? false : editForm.isActive,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {editForm.isOutOfService && (
                <div className="space-y-4 p-6 border-2 border-orange-300 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300">
                    Out of Service Details
                  </h4>
                  <div>
                    <Label>Reason</Label>
                    <Textarea
                      value={editForm.outOfServiceReason}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          outOfServiceReason: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Available From</Label>
                    <Input
                      type="date"
                      value={editForm.outOfServiceUntil}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          outOfServiceUntil: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditHall(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateHall}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Hall"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteHallData}
        onOpenChange={() => setDeleteHallData(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Hall</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete{" "}
            <strong>{deleteHallData?.name}</strong>? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteHallData(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteHall}
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
