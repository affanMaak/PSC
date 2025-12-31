import { useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
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
  Search,
  Upload,
  UserCheck,
  UserX,
  Ban,
  Edit,
  Trash2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  createBulkMembers,
} from "../../config/apis";

export default function Members() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<any>(null);
  const [deleteMemberDialog, setDeleteMemberDialog] = useState<any>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);

  // ─── Fetch Members ────────────────────────────────────────────────
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["members", searchQuery, statusFilter],
      queryFn: ({ pageParam = 1, queryKey }) => {
        const [, searchFromKey, statusFromKey] = queryKey as [
          string,
          string | undefined,
          string | undefined
        ];

        return getMembers({
          pageParam,
          search: searchFromKey,
          status: statusFromKey === "all" ? undefined : statusFromKey,
        });
      },
      getNextPageParam: (lastPage) =>
        lastPage?.pagination?.hasNext
          ? lastPage.pagination.page + 1
          : undefined,
      initialPageParam: 1,
    });

  const members = data?.pages.flatMap((p) => p.data) ?? [];

  // ─── Mutations ───────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      toast({ title: "Member added successfully" });
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      toast({ title: error?.message || "Failed to add member" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ Membership_No, updates }: { Membership_No: any, updates: any }) => updateMember({ Membership_No, updates }),
    onSuccess: () => {
      toast({ title: "Member updated successfully" });
      setEditMember(null);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ Membership_No }: { Membership_No: string }) => 
      deleteMember(Membership_No),
    onSuccess: () => {
      toast({ title: "Member deleted successfully" });
      setDeleteMemberDialog(null);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete member",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (data: any[]) => {
      const batchSize = 500;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await createBulkMembers(batch);
      }
    },
    onSuccess: () => {
      toast({ title: "Bulk upload completed" });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (err: any) => {
      toast({
        title: "Bulk upload failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // ─── Delete Handler ──────────────────────────────────────────────
  const handleDeleteMember = () => {
    if (deleteMemberDialog) {
      deleteMutation.mutate({ 
        Membership_No: deleteMemberDialog.Membership_No 
      });
    }
  };

  // ─── File Upload Logic ────────────────────────────────────────────
  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      bulkMutation.mutate(json as any[]);
    };
    reader.readAsArrayBuffer(bulkFile);
  };

  // ─── Helpers ─────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500/80 text-white">
            <UserCheck className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "DEACTIVATED":
        return (
          <Badge className="bg-yellow-500/80 text-white">
            <UserX className="h-3 w-3 mr-1" />
            Deactivated
          </Badge>
        );
      case "BLOCKED":
        return (
          <Badge className="bg-red-500/80 text-white">
            <Ban className="h-3 w-3 mr-1" />
            Blocked
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300 && // near bottom
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ─── UI ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">
            Manage club members and their information
          </p>
        </div>

        <div className="flex gap-2">
          {/* Bulk Upload */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" /> Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Upload Members</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Upload CSV/Excel File</Label>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="mt-2"
                    onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV or Excel file (max 500 records per batch)
                </p>
              </div>
              <DialogFooter>
                <Button
                  className="w-full"
                  onClick={handleBulkUpload}
                  disabled={bulkMutation.isPending}
                >
                  {bulkMutation.isPending ? "Uploading..." : "Upload File"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Member */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4 py-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = Object.fromEntries(formData.entries());
                  createMutation.mutate(data);
                }}
              >
                <div>
                  <Label>Membership Number</Label>
                  <Input name="Membership_No" placeholder="PSC001" required />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input name="Name" placeholder="John Doe" required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    name="Email"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input name="Contact_No" placeholder="0300-1234567" />
                </div>
                <div>
                  <Label>Other Details (optional)</Label>
                  <Input
                    name="Other_Details"
                    placeholder="Any additional notes..."
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select name="Status" defaultValue="ACTIVE">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                      <SelectItem value="BLOCKED">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Member</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Member Dialog */}
          <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Member</DialogTitle>
              </DialogHeader>
              {editMember && (
                <form
                  className="space-y-4 py-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const updates = Object.fromEntries(formData.entries());
                    updateMutation.mutate({ 
                      Membership_No: editMember.Membership_No, 
                      updates: { ...updates, Sno: editMember.Sno } 
                    });
                  }}
                >
                  <div>
                    <Label>Membership Number</Label>
                    <Input
                      name="Membership_No"
                      defaultValue={editMember.Membership_No}
                    />
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input name="Name" defaultValue={editMember.Name} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input name="Email" defaultValue={editMember.Email} />
                  </div>
                  <div>
                    <Label>Contact Number</Label>
                    <Input
                      name="Contact_No"
                      defaultValue={editMember.Contact_No}
                    />
                  </div>
                  <div>
                    <Label>Other Details (optional)</Label>
                    <Input
                      name="Other_Details"
                      defaultValue={editMember.Other_Details || ""}
                      placeholder="Additional info..."
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select name="Status" defaultValue={editMember.Status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                        <SelectItem value="BLOCKED">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditMember(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {updateMutation.isPending ? "Updating..." : "Update"}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteMemberDialog} onOpenChange={() => setDeleteMemberDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>
              Are you sure you want to delete member{" "}
              <strong>{deleteMemberDialog?.Name}</strong> (
              {deleteMemberDialog?.Membership_No})? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteMemberDialog(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMember}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by membership number or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "ACTIVE", "DEACTIVATED", "BLOCKED"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    onClick={() => setStatusFilter(status)}
                    size="sm"
                  >
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membership No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead>Last Booking</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow
                        key={member.Membership_No}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {member.Membership_No}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.Name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.Email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.Contact_No}</TableCell>
                        <TableCell>{getStatusBadge(member.Status)}</TableCell>
                        <TableCell className="text-right font-medium">
                          PKR {member.Balance?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {member.totalBookings || 0}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {member.lastBookingDate || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditMember(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteMemberDialog(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <span className="text-sm text-muted-foreground animate-pulse">
            Loading more members...
          </span>
        </div>
      )}

      {!hasNextPage && members.length > 0 && (
        <div className="flex justify-center py-4">
          <span className="text-sm text-muted-foreground">
            All members loaded.
          </span>
        </div>
      )}
    </div>
  );
}