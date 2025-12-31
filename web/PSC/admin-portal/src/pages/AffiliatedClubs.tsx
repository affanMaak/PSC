import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAffiliatedClubs,
  getAffiliatedClubRequests,
  createAffiliatedClub,
  updateAffiliatedClub,
  deleteAffiliatedClub,
  updateAffiliatedClubRequestStatus,
} from "../../config/apis";
import type { AffiliatedClub, CreateAffiliatedClubDto, AffiliatedClubRequest } from "@/types/affiliated-club.type";

export default function AffiliatedClubs() {
  const [activeTab, setActiveTab] = useState("clubs");
  const [clubDialog, setClubDialog] = useState(false);
  const [editingClub, setEditingClub] = useState<AffiliatedClub | null>(null);
  const [clubForm, setClubForm] = useState<CreateAffiliatedClubDto>({
    name: "",
    location: "",
    contactNo: "",
    email: "",
    description: "",
    isActive: true,
  });
  const [viewRequest, setViewRequest] = useState<AffiliatedClubRequest | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery<AffiliatedClub[]>({
    queryKey: ["affiliatedClubs"],
    queryFn: getAffiliatedClubs,
    retry: 1
  });

  const { data: requests = [], isLoading: isLoadingRequests } = useQuery<AffiliatedClubRequest[]>({
    queryKey: ["affiliatedClubRequests"],
    queryFn: () => getAffiliatedClubRequests(),
    retry: 1
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAffiliatedClub,
    onSuccess: () => {
      toast({ title: "Club created successfully" });
      queryClient.invalidateQueries({ queryKey: ["affiliatedClubs"] });
      setClubDialog(false);
      resetClubForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create club",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAffiliatedClub,
    onSuccess: () => {
      toast({ title: "Club updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["affiliatedClubs"] });
      setClubDialog(false);
      resetClubForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update club",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAffiliatedClub,
    onSuccess: () => {
      toast({ title: "Club deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["affiliatedClubs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete club",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateRequestStatusMutation = useMutation({
    mutationFn: updateAffiliatedClubRequestStatus,
    onSuccess: () => {
      toast({ title: "Request status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["affiliatedClubRequests"] });
      setViewRequest(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update request status",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  /* New Handlers */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setClubForm({ ...clubForm, file });
    }
  };

  const handleRemoveImage = () => {
    setClubForm({ ...clubForm, image: "", file: undefined });
  };

  // Handlers
  const handleCreateClub = () => {
    const formData = new FormData();
    formData.append("name", clubForm.name);
    if (clubForm.location) formData.append("location", clubForm.location);
    if (clubForm.contactNo) formData.append("contactNo", clubForm.contactNo);
    if (clubForm.email) formData.append("email", clubForm.email);
    if (clubForm.description) formData.append("description", clubForm.description);
    // If active is boolean, convert to strong if needed or let formData handle it (usually string 'true'/'false')
    formData.append("isActive", String(clubForm.isActive ?? true));

    if (clubForm.file) {
      formData.append("image", clubForm.file);
    }

    createMutation.mutate(formData);
  };

  const handleUpdateClub = () => {
    if (!editingClub) return;

    const formData = new FormData();
    formData.append("id", String(editingClub.id));
    formData.append("name", clubForm.name);
    if (clubForm.location) formData.append("location", clubForm.location);
    if (clubForm.contactNo) formData.append("contactNo", clubForm.contactNo);
    if (clubForm.email) formData.append("email", clubForm.email);
    if (clubForm.description) formData.append("description", clubForm.description);
    formData.append("isActive", String(clubForm.isActive));

    if (clubForm.file) {
      formData.append("image", clubForm.file);
    } else if (clubForm.image) {
      // If we have an existing image URL and no new file, we might want to send it 
      // OR the backend logic "Keep existing if not replaced" handles it if we send nothing.
      // Based on backend logic: `let imageUrl = payload.image; if(file)...`
      // So we should send the existing image URL back if we want to keep it? 
      // OR if the backend treats missing payload.image as "remove"?
      // Backend: `let imageUrl = payload.image; // Keep existing if not replaced` -> Wait, if payload.image is undefined, imageUrl is undefined.
      // Actually typically `payload` structure from `Body` decorator might have it.
      // Backend code:
      // `let imageUrl = payload.image;`
      // `if (file) { ... }`
      // `data: { ... image: imageUrl }`
      // If I send nothing for image, `imageUrl` is undefined. Prisma update with `image: undefined` usually means "do nothing/no change" 
      // BUT `payload` is DTO. 
      // If I append `image` with current URL, it's fine.
      formData.append("image", clubForm.image);
    } else {
      // If explicit removal (image is empty string), we should send empty string or null?
      // Backend `image` field is optional string.
      // If I send "", it might save as "". 
      // Let's assume sending empty string clears it.
      formData.append("image", "");
    }

    updateMutation.mutate(formData);
  };

  const handleDeleteClub = (id: number) => {
    if (!confirm("Are you sure you want to delete this club?")) return;
    deleteMutation.mutate(id);
  };

  const handleApproveRequest = (id: number) => {
    updateRequestStatusMutation.mutate({ id, status: "APPROVED" });
  };

  const handleRejectRequest = (id: number) => {
    updateRequestStatusMutation.mutate({ id, status: "REJECTED" });
  };

  const openCreateDialog = () => {
    resetClubForm();
    setEditingClub(null);
    setClubDialog(true);
  };

  const openEditDialog = (club: AffiliatedClub) => {
    setEditingClub(club);
    setClubForm({
      name: club.name,
      location: club.location || "",
      contactNo: club.contactNo || "",
      email: club.email || "",
      description: club.description || "",
      image: club.image || "",
      isActive: club.isActive,
    });
    setClubDialog(true);
  };

  const resetClubForm = () => {
    setClubForm({
      name: "",
      location: "",
      contactNo: "",
      email: "",
      description: "",
      isActive: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "PENDING":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoadingClubs) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Affiliated Clubs</h2>
          <p className="text-muted-foreground">Manage affiliated clubs and member requests</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clubs">Affiliated Clubs</TabsTrigger>
          <TabsTrigger value="requests">Club Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="clubs" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Club
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No clubs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    clubs.map((club) => (
                      <TableRow key={club.id}>
                        <TableCell>
                          <Avatar>
                            <AvatarImage src={club.image} alt={club.name} />
                            <AvatarFallback>{club.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{club.name}</TableCell>
                        <TableCell>{club.location || "N/A"}</TableCell>
                        <TableCell>{club.contactNo || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={club.isActive ? "default" : "secondary"}>
                            {club.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(club)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClub(club.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Club Name</TableHead>
                    <TableHead>Membership No</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.affiliatedClub?.name}</TableCell>
                        <TableCell>{request.membershipNo}</TableCell>
                        <TableCell>{new Date(request.requestedDate).toLocaleDateString()}</TableCell>
                        <TableCell>{request.guestCount || 0}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setViewRequest(request)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === "PENDING" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-success hover:text-success"
                                  onClick={() => handleApproveRequest(request.id)}
                                  disabled={updateRequestStatusMutation.isPending}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleRejectRequest(request.id)}
                                  disabled={updateRequestStatusMutation.isPending}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Club Create/Edit Dialog */}
      <Dialog open={clubDialog} onOpenChange={setClubDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingClub ? "Edit Club" : "Add New Club"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Club Name *</Label>
                <Input
                  id="name"
                  value={clubForm.name}
                  onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                  placeholder="Enter club name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={clubForm.location}
                  onChange={(e) => setClubForm({ ...clubForm, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNo">Contact Number</Label>
                <Input
                  id="contactNo"
                  value={clubForm.contactNo}
                  onChange={(e) => setClubForm({ ...clubForm, contactNo: e.target.value })}
                  placeholder="Enter contact number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={clubForm.email}
                  onChange={(e) => setClubForm({ ...clubForm, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={clubForm.description}
                onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                placeholder="Enter description"
                rows={3}
              />
              <div className="grid gap-2">
                <Label htmlFor="image">Club Image</Label>
                <div className="flex items-center gap-4">
                  {(clubForm.image || clubForm.file) && (
                    <div className="relative">
                      <img
                        src={
                          clubForm.file
                            ? URL.createObjectURL(clubForm.file)
                            : clubForm.image
                        }
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={clubForm.isActive}
                  onCheckedChange={(checked) => setClubForm({ ...clubForm, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClubDialog(false)} disabled={createMutation.isPending || updateMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={editingClub ? handleUpdateClub : handleCreateClub} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {editingClub ? "Updating..." : "Creating..."}
                </>
              ) : (
                editingClub ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request View Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Club Name</p>
                <p className="font-medium">{viewRequest?.affiliatedClub?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membership No</p>
                <p className="font-medium">{viewRequest?.membershipNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {viewRequest && getStatusBadge(viewRequest.status)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested Date</p>
                <p className="font-medium">
                  {viewRequest && new Date(viewRequest.requestedDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guest Count</p>
                <p className="font-medium">{viewRequest?.guestCount || 0}</p>
              </div>
            </div>

            {viewRequest?.purpose && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Purpose</p>
                <p className="font-medium">{viewRequest.purpose}</p>
              </div>
            )}
          </div>
          {viewRequest?.status === "PENDING" && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRequest(null)}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (viewRequest) handleRejectRequest(viewRequest.id);
                }}
                disabled={updateRequestStatusMutation.isPending}
              >
                {updateRequestStatusMutation.isPending ? "Processing..." : "Reject"}
              </Button>
              <Button
                onClick={() => {
                  if (viewRequest) handleApproveRequest(viewRequest.id);
                }}
                disabled={updateRequestStatusMutation.isPending}
              >
                {updateRequestStatusMutation.isPending ? "Processing..." : "Approve"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
