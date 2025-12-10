import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageUpload } from "@/components/ImageUpload";

import {
  getLawnCategories,
  createLawnCategory,
  updateLawnCategory,
  deleteLawnCategory
} from "../../config/apis";

export default function LawnCategories() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newImages, setNewImages] = useState<File[]>([]);

  const [editCategory, setEditCategory] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editNewImages, setEditNewImages] = useState<File[]>([]);

  const [deleteCategory, setDeleteCategory] = useState<any>(null);

  const { toast } = useToast();
  const qc = useQueryClient();

  // Fetch categories
  const { data: lawnCategories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["lawnCategories"],
    queryFn: getLawnCategories,
  });

  // CREATE category
  const createMutation = useMutation({
    mutationFn: createLawnCategory,
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ["lawnCategories"]});
      toast({ title: "Category added" });
      setNewCat("");
      setNewImages([]);
      setIsAddOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create category",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    }
  });

  // UPDATE category
  const updateMutation = useMutation({
    mutationFn: updateLawnCategory,
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ["lawnCategories"]});
      toast({ title: "Category updated" });
      setEditCategory(null);
      setEditExistingImages([]);
      setEditNewImages([]);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update category",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    }
  });

  // DELETE category
  const deleteMutation = useMutation({
    mutationFn: deleteLawnCategory,
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ["lawnCategories"]});
      toast({ title: "Category deleted" });
      setDeleteCategory(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete category",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    }
  });

  // Handle create category
  const handleCreateCategory = () => {
    if (!newCat.trim()) {
      toast({
        title: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append("category", newCat);
    
    // Append images
    newImages.forEach((file) => {
      formData.append("files", file);
    });

    createMutation.mutate(formData);
  };

  // Handle update category
  const handleUpdateCategory = () => {
    if (!editName.trim()) {
      toast({
        title: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append("id", editCategory.id.toString());
    formData.append("category", editName);
    
    // Append existing images (publicIds)
    editExistingImages.forEach((publicId) => {
      formData.append("existingimgs", publicId);
    });
    
    // Append new images
    editNewImages.forEach((file) => {
      formData.append("files", file);
    });

    updateMutation.mutate(formData);
  };

  // Set edit form data when opening edit dialog
  useEffect(() => {
    if (editCategory) {
      setEditName(editCategory.category || "");
      setEditExistingImages(
        editCategory.images?.map((img: any) => img.publicId || img.url || img) || []
      );
      setEditNewImages([]);
    }
  }, [editCategory]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Lawn Categories</h2>
          <p className="text-muted-foreground">Manage lawn categories and types</p>
        </div>

        {/* ADD CATEGORY */}
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setNewCat("");
            setNewImages([]);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Lawn Category</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Category Name *</Label>
                <Input
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="e.g. Premium Lawn"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Category Images (Max 5)</Label>
                <ImageUpload
                  images={newImages.map((f) => URL.createObjectURL(f))}
                  onChange={(files) =>
                    setNewImages((prev) => [...prev, ...files].slice(0, 5))
                  }
                  onRemove={(i) =>
                    setNewImages((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  maxImages={5}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>

              <Button
                disabled={createMutation.isPending || !newCat.trim()}
                onClick={handleCreateCategory}
              >
                {createMutation.isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Add Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Images</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoadingCategories ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : lawnCategories?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                lawnCategories?.map((category: any) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.category}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {category.images && category.images.length > 0 ? (
                          category.images.slice(0, 3).map((img: any, idx: number) => (
                            <img
                              key={idx}
                              src={img.url || img}
                              alt="category"
                              className="w-12 h-12 rounded object-cover border"
                            />
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No images</span>
                        )}
                        {category.images && category.images.length > 3 && (
                          <div className="w-12 h-12 rounded border flex items-center justify-center bg-muted text-xs">
                            +{category.images.length - 3}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditCategory(category);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteCategory(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* EDIT CATEGORY */}
      <Dialog open={!!editCategory} onOpenChange={() => {
        setEditCategory(null);
        setEditExistingImages([]);
        setEditNewImages([]);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Category Name *</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-2"
              />
            </div>

            {editCategory?.images && editCategory.images.length > 0 && (
              <div>
                <Label>Current Images</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {editCategory.images.map((img: any, i: number) => (
                    <img
                      key={i}
                      src={img.url || img}
                      alt="category"
                      className="h-24 w-24 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Add New Images (Max 5 total)</Label>
              <ImageUpload
                images={editNewImages.map((f) => URL.createObjectURL(f))}
                onChange={(files) => {
                  const totalImages = editExistingImages.length + editNewImages.length + files.length;
                  if (totalImages > 5) {
                    toast({
                      title: "Maximum 5 images allowed",
                      description: "Remove some existing images or reduce new uploads",
                      variant: "destructive"
                    });
                    return;
                  }
                  setEditNewImages((prev) => [...prev, ...files].slice(0, 5 - editExistingImages.length));
                }}
                onRemove={(i) =>
                  setEditNewImages((prev) => prev.filter((_, idx) => idx !== i))
                }
                maxImages={5 - editExistingImages.length}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {editExistingImages.length} existing + {editNewImages.length} new = {editExistingImages.length + editNewImages.length} / 5 images
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategory(null)}>
              Cancel
            </Button>

            <Button
              disabled={updateMutation.isPending || !editName.trim()}
              onClick={handleUpdateCategory}
            >
              {updateMutation.isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CATEGORY */}
      <Dialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>

          <p className="py-4">
            Are you sure you want to delete <strong>{deleteCategory?.category}</strong>? This action cannot be undone.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCategory(null)}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteCategory.id)}
            >
              {deleteMutation.isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}