import { useState } from "react";
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

import {
  getLawnCategories,
  createLawnCategory,
  updateLawnCategory,
  deleteLawnCategory
} from "../../config/apis";

export default function LawnCategories() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCat, setNewCat] = useState("");

  const [editCategory, setEditCategory] = useState<any>(null);
  const [editName, setEditName] = useState("");

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
      setIsAddOpen(false);
    }
  });

  // UPDATE category
  const updateMutation = useMutation({
    mutationFn: updateLawnCategory,
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ["lawnCategories"]});
      toast({ title: "Category updated" });
      setEditCategory(null);
    }
  });

  // DELETE category
  const deleteMutation = useMutation({
    mutationFn: deleteLawnCategory,
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ["lawnCategories"]});
      toast({ title: "Category deleted" });
      setDeleteCategory(null);
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Lawn Categories</h2>
          <p className="text-muted-foreground">Manage lawn categories and types</p>
        </div>

        {/* ADD CATEGORY */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Lawn Category</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Category Name</Label>
                <Input
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="e.g. Premium Lawn"
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>

              <Button
                disabled={createMutation.isPending || !newCat.trim()}
                onClick={() => createMutation.mutate({ category: newCat })}
              >
                {createMutation.isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Add
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoadingCategories ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : lawnCategories?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                lawnCategories?.map((category: any) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.category}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditName(category.category);
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
      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Category Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategory(null)}>
              Cancel
            </Button>

            <Button
              disabled={updateMutation.isPending || !editName.trim()}
              onClick={() => updateMutation.mutate({ id: editCategory.id, category: editName })}
            >
              {updateMutation.isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Update
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
            Are you sure you want to delete <strong>{deleteCategory?.category}</strong>?
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
