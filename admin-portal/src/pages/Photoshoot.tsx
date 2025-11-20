import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, FileDown, Plus, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { exportPhotoshootReport } from "@/lib/pdfExport";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createPhotoshoot as createPhotoShootApi, 
  updatePhotoshoot as updatePhotoShootApi, 
  deletePhotoshoot as deletePhotoshootApi, 
  getPhotoshoots 
} from "../../config/apis";
import { Badge } from "@/components/ui/badge";

interface PhotoshootForm {
  description: string;
  memberCharges: string;
  guestCharges: string;
}

const initialFormState: PhotoshootForm = {
  description: "",
  memberCharges: "",
  guestCharges: "",
};

export default function Photoshoot() {
  const [editPhotoshoot, setEditPhotoshoot] = useState<any>(null);
  const [deletePhotoshoot, setDeletePhotoshoot] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<PhotoshootForm>(initialFormState);
  const [editForm, setEditForm] = useState<PhotoshootForm>(initialFormState);

  const { data: photoshoots = [], isLoading: isLoadingPhotoshoots } = useQuery({
    queryKey: ["photoshoots"],
    queryFn: getPhotoshoots,
  });

  const createMutation = useMutation({
    mutationFn: createPhotoShootApi,
    onSuccess: () => {
      toast({ title: "Photoshoot package created successfully" });
      queryClient.invalidateQueries({ queryKey: ["photoshoots"] });
      setIsAddOpen(false);
      setForm(initialFormState);
    },
    onError: () => toast({ title: "Failed to create photoshoot package", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: updatePhotoShootApi,
    onSuccess: () => {
      toast({ title: "Photoshoot package updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["photoshoots"] });
      setEditPhotoshoot(null);
    },
    onError: () => toast({ title: "Failed to update photoshoot package", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePhotoshootApi,
    onSuccess: () => {
      toast({ title: "Photoshoot package deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["photoshoots"] });
      setDeletePhotoshoot(null);
    },
    onError: () => toast({ title: "Failed to delete photoshoot package", variant: "destructive" }),
  });

  const handleCreate = () => {
    if (!form.description || !form.memberCharges || !form.guestCharges) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      description: form.description,
      memberCharges: parseFloat(form.memberCharges),
      guestCharges: parseFloat(form.guestCharges),
    });
  };

  const handleUpdate = () => {
    if (!editForm.description || !editForm.memberCharges || !editForm.guestCharges) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }

    updateMutation.mutate({
      id: editPhotoshoot.id,
      description: editForm.description,
      memberCharges: parseFloat(editForm.memberCharges),
      guestCharges: parseFloat(editForm.guestCharges),
    });
  };

  const handleDelete = () => {
    if (deletePhotoshoot) {
      deleteMutation.mutate(deletePhotoshoot.id);
    }
  };

  // Update edit form when editPhotoshoot changes
  useEffect(() => {
    if (editPhotoshoot) {
      setEditForm({
        description: editPhotoshoot.description || "",
        memberCharges: editPhotoshoot.memberCharges?.toString() || "",
        guestCharges: editPhotoshoot.guestCharges?.toString() || "",
      });
    }
  }, [editPhotoshoot]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Manage Photoshoot</h2>
          <p className="text-muted-foreground">Configure photoshoot studio packages and pricing</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => exportPhotoshootReport(photoshoots)} 
            className="gap-2"
            disabled={isLoadingPhotoshoots || photoshoots.length === 0}
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>

          {/* Add Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Photoshoot Package</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Description *</Label>
                  <Textarea 
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Studio portrait session, Outdoor fashion shoot..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Member Charges (PKR) *</Label>
                  <Input 
                    type="number" 
                    value={form.memberCharges}
                    onChange={(e) => setForm(prev => ({ ...prev, memberCharges: e.target.value }))}
                    placeholder="5000"
                    className="mt-2" 
                  />
                </div>
                <div>
                  <Label>Guest Charges (PKR) *</Label>
                  <Input 
                    type="number" 
                    value={form.guestCharges}
                    onChange={(e) => setForm(prev => ({ ...prev, guestCharges: e.target.value }))}
                    placeholder="7500"
                    className="mt-2" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Package"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Photoshoot Packages Table */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isLoadingPhotoshoots ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
          ) : photoshoots.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground text-lg">
              No photoshoot packages found. Create your first package to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Description</TableHead>
                  <TableHead>Member Charges</TableHead>
                  <TableHead>Guest Charges</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {photoshoots.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium max-w-md">
                      <div className="space-y-1">
                        <p className="font-semibold">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      {item.isBooked ? (
                        <Badge variant="destructive" className="font-medium">Booked</Badge>
                      ) : (
                        <Badge className="bg-emerald-600 text-white font-medium">Available</Badge>
                      )}
                    </TableCell> */}
                    <TableCell className="font-semibold">
                      PKR {Number(item.memberCharges).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold">
                      PKR {Number(item.guestCharges).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditPhotoshoot(item)}
                        disabled={updateMutation.isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setDeletePhotoshoot(item)}
                        disabled={deleteMutation.isPending}
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

      {/* Edit Dialog */}
      <Dialog open={!!editPhotoshoot} onOpenChange={() => setEditPhotoshoot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Photoshoot Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Description *</Label>
              <Textarea 
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            </div>
            <div>
              <Label>Member Charges (PKR) *</Label>
              <Input 
                type="number" 
                value={editForm.memberCharges}
                onChange={(e) => setEditForm(prev => ({ ...prev, memberCharges: e.target.value }))}
                className="mt-2" 
              />
            </div>
            <div>
              <Label>Guest Charges (PKR) *</Label>
              <Input 
                type="number" 
                value={editForm.guestCharges}
                onChange={(e) => setEditForm(prev => ({ ...prev, guestCharges: e.target.value }))}
                className="mt-2" 
              />
            </div>
            {editPhotoshoot?.isBooked && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This package is currently booked and cannot be modified until the booking is completed.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPhotoshoot(null)}>Cancel</Button>
            <Button 
              onClick={handleUpdate} 
              disabled={updateMutation.isPending || editPhotoshoot?.isBooked}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Package"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletePhotoshoot} onOpenChange={() => setDeletePhotoshoot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Photoshoot Package</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete the package "{deletePhotoshoot?.description}"? 
              This action cannot be undone.
            </p>
            {deletePhotoshoot?.isBooked && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This package is currently booked and cannot be deleted.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePhotoshoot(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending || deletePhotoshoot?.isBooked}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Package"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}