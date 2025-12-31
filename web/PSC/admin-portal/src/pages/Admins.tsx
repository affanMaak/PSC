import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Shield, ShieldCheck, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../config/apis";
import { Admin } from "@/types/admin.types";

const modules = [
  "Dashboard",
  "Calendar",
  "Notifications",
  "Members",
  "Rooms",
  "Room Bookings",
  "Halls",
  "Hall Bookings",
  "Lawns",
  "Lawn Bookings",
  "Photoshoot",
  "Photoshoot Bookings",
  "Sports",
  "Accounts",
  "Affiliated Clubs",
  "Contents"
];

export default function Admins() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<any>(null);
  const [deleteAdminData, setDeleteAdminData] = useState<any>(null);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ✅ FETCH ADMINS
  const { data: admins = [], isLoading } = useQuery<Admin[]>({
    queryKey: ["admins"],
    queryFn: getAdmins,
  });

  useEffect(() => {
    if (admins?.length) {
      const initial: Record<string, string[]> = {};
      admins.forEach((admin) => {
        if (Array.isArray(admin.permissions)) {
          initial[admin.id] = admin.permissions;  // flat array
        } else {
          initial[admin.id] = [];
        }
      });
      setPermissions(initial);
    }
  }, [admins]);


  // ✅ CREATE ADMIN
  const createMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      toast({
        title: "Admin added",
        description: "New admin created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setIsAddOpen(false);
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  // ✅ UPDATE ADMIN
  const updateMutation = useMutation({
    mutationFn: updateAdmin,
    onSuccess: () => {
      toast({
        title: "Admin updated",
        description: "Admin details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setEditAdmin(null);
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  // ✅ DELETE ADMIN
  const deleteMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      toast({
        title: "Admin deleted",
        description: "Admin removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setDeleteAdminData(null);
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  const handlePermissionChange = (
    adminID: string,
    module: string,
    checked: boolean
  ) => {
    setPermissions((prev) => {
      const current = prev[adminID] || [];
      const updated = checked
        ? [...current, module]
        : current.filter((m) => m !== module);
      return { ...prev, [adminID]: updated };
    });
  };
  const handleSavePermissions = (admin: any) => {
    const selected = permissions[admin.id] || [];
    updateMutation.mutate({ adminID: admin.id, updates: {permissions: selected}  });
  };

  if (isLoading) return <p>Loading admins...</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Admins
          </h2>
          <p className="text-muted-foreground">
            Manage admin users and their permissions
          </p>
        </div>

        {/* Add Admin Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
            </DialogHeader>
            <AddAdminForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Cards */}
      <div className="space-y-6">
        {admins?.map((admin: any) => (
          <Card key={admin.id}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{admin.name}</h3>
                    {admin.role === "SUPER_ADMIN" ? (
                      <Badge className="bg-primary text-primary-foreground">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Super Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditAdmin(admin)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteAdminData(admin)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Permissions */}
              {admin.role !== "SUPER_ADMIN" && (
                <>
                  <h4 className="text-sm font-medium mb-4">
                    Module Permissions
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {modules.map((module) => (
                      <div
                        key={module}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={`${admin.id}-${module}`}
                          checked={(permissions[admin.id] || []).includes(
                            module
                          )}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(admin.id, module, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`${admin.id}-${module}`}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {module}
                        </Label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => handleSavePermissions(admin)}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending
                        ? "Saving..."
                        : "Save Permissions"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editAdmin} onOpenChange={() => setEditAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          {editAdmin && (
            <EditAdminForm
              admin={editAdmin}
              onSubmit={(data: any) =>
                updateMutation.mutate({ adminID: editAdmin.id, ...data })
              }
              onCancel={() => setEditAdmin(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteAdminData}
        onOpenChange={() => setDeleteAdminData(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete{" "}
            <strong>{deleteAdminData?.name}</strong>? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAdminData(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteAdminData.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------------- Helper Subcomponents ---------------------- */

function AddAdminForm({ onSubmit, onCancel }: any) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  return (
    <>
      <div className="space-y-4 py-4">
        <div>
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Role</Label>
          <Select
            value={form.role}
            onValueChange={(value) => setForm({ ...form, role: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(form)}>Add Admin</Button>
      </DialogFooter>
    </>
  );
}

function EditAdminForm({ admin, onSubmit, onCancel }: any) {
  const [form, setForm] = useState({
    name: admin.name,
    email: admin.email,
    role: admin.role,
    password: "",
  });

  return (
    <>
      <div className="space-y-4 py-4">
        <div>
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Role</Label>
          <Select
            value={form.role}
            onValueChange={(value) => setForm({ ...form, role: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Update Password?</Label>
          <Input
            type="password"
            value={form.password}
            placeholder="new password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(form)}>Update</Button>
      </DialogFooter>
    </>
  );
}
