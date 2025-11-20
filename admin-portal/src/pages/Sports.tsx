import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSport,
  getSports,
  updateSport,
  deleteSport,
} from "../../config/apis";

interface SportChargeForm {
  chargeType: "PER_DAY" | "PER_MONTH" | "PER_GAME" | "PER_HOUR";
  memberCharges: string;
  spouseCharges: string;
  childrenCharges: string;
  guestCharges: string;
  affiliatedClubCharges: string;
}

interface SportForm {
  activity: string;
  description: string;
  isActive: boolean;
  charges: SportChargeForm[];
}

interface CreateSportPayload {
  activity: string;
  description: string;
  isActive: boolean;
  sportCharge: {
    chargeType: string;
    memberCharges?: number;
    spouseCharges?: number;
    childrenCharges?: number;
    guestCharges?: number;
    affiliatedClubCharges?: number;
  }[];
}

interface UpdateSportPayload {
  id: number;
  activity: string;
  description: string;
  isActive: boolean;
  sportCharge: {
    chargeType: string;
    memberCharges?: number;
    spouseCharges?: number;
    childrenCharges?: number;
    guestCharges?: number;
    affiliatedClubCharges?: number;
  }[];
}

const initialChargeForm: SportChargeForm = {
  chargeType: "PER_DAY",
  memberCharges: "",
  spouseCharges: "",
  childrenCharges: "",
  guestCharges: "",
  affiliatedClubCharges: "",
};

const initialFormState: SportForm = {
  activity: "",
  description: "",
  isActive: true,
  charges: [initialChargeForm],
};

const chargeTypeOptions = [
  { value: "PER_DAY", label: "Per Day" },
  { value: "PER_MONTH", label: "Per Month" },
  { value: "PER_GAME", label: "Per Game" },
  { value: "PER_HOUR", label: "Per Hour" },
];

// FIXED: Move ChargeTypeSection outside the main component to prevent recreation
const ChargeTypeSection = React.memo(function ChargeTypeSection({ 
  charges, 
  onUpdateCharge, 
  onAddCharge, 
  onRemoveCharge, 
  isEdit = false 
}: { 
  charges: SportChargeForm[];
  onUpdateCharge: (index: number, field: string, value: string) => void;
  onAddCharge: () => void;
  onRemoveCharge: (index: number) => void;
  isEdit?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Pricing Configuration</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddCharge}>
          <Plus className="h-4 w-4 mr-2" />
          Add Charge Type
        </Button>
      </div>
      
      {charges.map((charge: SportChargeForm, index: number) => (
        <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <Label>Charge Type #{index + 1}</Label>
            {charges.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveCharge(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Charge Type *</Label>
              <select
                value={charge.chargeType}
                onChange={(e) => onUpdateCharge(index, "chargeType", e.target.value)}
                className="w-full p-2 border rounded-md mt-1"
              >
                {chargeTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label>Member Charges (PKR)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={charge.memberCharges}
                onChange={(e) => onUpdateCharge(index, "memberCharges", e.target.value)}
                className="mt-1"
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <Label>Spouse Charges (PKR)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={charge.spouseCharges}
                onChange={(e) => onUpdateCharge(index, "spouseCharges", e.target.value)}
                className="mt-1"
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <Label>Children Charges (PKR)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={charge.childrenCharges}
                onChange={(e) => onUpdateCharge(index, "childrenCharges", e.target.value)}
                className="mt-1"
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <Label>Guest Charges (PKR)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={charge.guestCharges}
                onChange={(e) => onUpdateCharge(index, "guestCharges", e.target.value)}
                className="mt-1"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="col-span-2">
              <Label>Affiliated Club Charges (PKR)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={charge.affiliatedClubCharges}
                onChange={(e) => onUpdateCharge(index, "affiliatedClubCharges", e.target.value)}
                className="mt-1"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default function Sports() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSport, setEditSport] = useState<any>(null);
  const [deleteSport, setDeleteSport] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<SportForm>(initialFormState);
  const [editForm, setEditForm] = useState<SportForm>(initialFormState);

  const { data: sports = [], isLoading: isLoadingSports } = useQuery({
    queryKey: ["sports"],
    queryFn: getSports,
  });

  const createMutation = useMutation({
    mutationFn: createSport,
    onSuccess: () => {
      toast({ title: "Sport activity created successfully" });
      queryClient.invalidateQueries({ queryKey: ["sports"] });
      setIsAddOpen(false);
      setForm(initialFormState);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create sport activity", 
        description: error?.response?.data?.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSport,
    onSuccess: () => {
      toast({ title: "Sport activity updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["sports"] });
      setEditSport(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update sport activity", 
        description: error?.response?.data?.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSport,
    onSuccess: () => {
      toast({ title: "Sport activity deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["sports"] });
      setDeleteSport(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete sport activity", 
        description: error?.response?.data?.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  useEffect(() => {
    if (editSport) {
      setEditForm({
        activity: editSport.activity || "",
        description: editSport.description || "",
        isActive: editSport.isActive ?? true,
        charges: editSport.sportCharge?.length > 0 
          ? editSport.sportCharge.map((charge: any) => ({
              chargeType: charge.chargeType,
              memberCharges: charge.memberCharges?.toString() || "0",
              spouseCharges: charge.spouseCharges?.toString() || "0",
              childrenCharges: charge.childrenCharges?.toString() || "0",
              guestCharges: charge.guestCharges?.toString() || "0",
              affiliatedClubCharges: charge.affiliatedClubCharges?.toString() || "0",
            }))
          : [initialChargeForm],
      });
    }
  }, [editSport]);

  // FIXED: Use useCallback for event handlers to prevent recreation
  const handleCreate = useCallback(() => {
    if (!form.activity.trim()) {
      toast({ title: "Activity name is required", variant: "destructive" });
      return;
    }

    // Validate charges
    const validCharges = form.charges.filter(charge => 
      charge.memberCharges || charge.spouseCharges || charge.childrenCharges || 
      charge.guestCharges || charge.affiliatedClubCharges
    );

    if (validCharges.length === 0) {
      toast({ title: "At least one charge type with pricing is required", variant: "destructive" });
      return;
    }

    const payload: CreateSportPayload = {
      activity: form.activity,
      description: form.description,
      isActive: form.isActive,
      sportCharge: validCharges.map(charge => ({
        chargeType: charge.chargeType,
        memberCharges: charge.memberCharges ? parseFloat(charge.memberCharges) : 0,
        spouseCharges: charge.spouseCharges ? parseFloat(charge.spouseCharges) : 0,
        childrenCharges: charge.childrenCharges ? parseFloat(charge.childrenCharges) : 0,
        guestCharges: charge.guestCharges ? parseFloat(charge.guestCharges) : 0,
        affiliatedClubCharges: charge.affiliatedClubCharges ? parseFloat(charge.affiliatedClubCharges) : 0,
      })),
    };

    createMutation.mutate(payload);
  }, [form, createMutation, toast]);

  const handleUpdate = useCallback(() => {
    if (!editForm.activity.trim()) {
      toast({ title: "Activity name is required", variant: "destructive" });
      return;
    }

    const validCharges = editForm.charges.filter(charge => 
      charge.memberCharges || charge.spouseCharges || charge.childrenCharges || 
      charge.guestCharges || charge.affiliatedClubCharges
    );

    if (validCharges.length === 0) {
      toast({ title: "At least one charge type with pricing is required", variant: "destructive" });
      return;
    }

    const payload: UpdateSportPayload = {
      id: editSport.id,
      activity: editForm.activity,
      description: editForm.description,
      isActive: editForm.isActive,
      sportCharge: validCharges.map(charge => ({
        chargeType: charge.chargeType,
        memberCharges: charge.memberCharges ? parseFloat(charge.memberCharges) : 0,
        spouseCharges: charge.spouseCharges ? parseFloat(charge.spouseCharges) : 0,
        childrenCharges: charge.childrenCharges ? parseFloat(charge.childrenCharges) : 0,
        guestCharges: charge.guestCharges ? parseFloat(charge.guestCharges) : 0,
        affiliatedClubCharges: charge.affiliatedClubCharges ? parseFloat(charge.affiliatedClubCharges) : 0,
      })),
    };

    updateMutation.mutate(payload);
  }, [editForm, editSport, updateMutation, toast]);

  const handleDelete = useCallback(() => {
    if (deleteSport) {
      deleteMutation.mutate(deleteSport.id);
    }
  }, [deleteSport, deleteMutation]);

  // FIXED: Use useCallback for charge management functions
  const addChargeType = useCallback((isEdit = false) => {
    const setter = isEdit ? setEditForm : setForm;
    setter(prev => ({
      ...prev,
      charges: [...prev.charges, { ...initialChargeForm }],
    }));
  }, []);

  const removeChargeType = useCallback((index: number, isEdit = false) => {
    const setter = isEdit ? setEditForm : setForm;
    setter(prev => ({
      ...prev,
      charges: prev.charges.filter((_, i) => i !== index),
    }));
  }, []);

  const updateCharge = useCallback((index: number, field: keyof SportChargeForm, value: string, isEdit = false) => {
    const setter = isEdit ? setEditForm : setForm;
    setter(prev => ({
      ...prev,
      charges: prev.charges.map((charge, i) => 
        i === index ? { ...charge, [field]: value } : charge
      ),
    }));
  }, []);

  const getChargeTypeDisplay = useCallback((chargeType: string) => {
    return chargeTypeOptions.find(opt => opt.value === chargeType)?.label || chargeType;
  }, []);

  const formatCurrency = useCallback((amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Sports Activities</h2>
          <p className="text-muted-foreground">Manage sports facilities and pricing</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Sport
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Sport Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Activity Name *</Label>
                  <Input 
                    placeholder="e.g., Swimming Pool, Tennis Court, Gym"
                    value={form.activity}
                    onChange={(e) => setForm(prev => ({ ...prev, activity: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Activity description and features..."
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-2"
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base">Activity Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {form.isActive ? "Active and available for booking" : "Inactive and hidden from members"}
                    </p>
                  </div>
                  <Switch 
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
              </div>

              {/* FIXED: Stable ChargeTypeSection component */}
              <ChargeTypeSection
                charges={form.charges}
                onUpdateCharge={(index: number, field: string, value: string) => 
                  updateCharge(index, field as keyof SportChargeForm, value, false)
                }
                onAddCharge={() => addChargeType(false)}
                onRemoveCharge={(index: number) => removeChargeType(index, false)}
              />
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
                  "Add Sport Activity"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isLoadingSports ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
          ) : sports?.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground text-lg">
              No sports activities found. Create your first activity to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Activity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Charge Types</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sports?.map((sport: any) => (
                  <TableRow key={sport.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{sport.activity}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {sport.description || "No description"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {sport.sportCharge?.map((charge: any, index: number) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {getChargeTypeDisplay(charge.chargeType)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2 text-sm">
                        {sport.sportCharge?.slice(0, 2).map((charge: any, index: number) => (
                          <div key={index}>
                            <div className="font-medium">{getChargeTypeDisplay(charge.chargeType)}:</div>
                            <div>Member: PKR {formatCurrency(charge.memberCharges || 0)}</div>
                            <div>Guest: PKR {formatCurrency(charge.guestCharges || 0)}</div>
                          </div>
                        ))}
                        {sport.sportCharge?.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{sport.sportCharge.length - 2} more charge types
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sport.isActive ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditSport(sport)}
                        disabled={updateMutation.isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setDeleteSport(sport)}
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
      <Dialog open={!!editSport} onOpenChange={() => setEditSport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sport Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Activity Name *</Label>
                <Input 
                  value={editForm.activity}
                  onChange={(e) => setEditForm(prev => ({ ...prev, activity: e.target.value }))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Activity Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {editForm.isActive ? "Active and available for booking" : "Inactive and hidden from members"}
                  </p>
                </div>
                <Switch 
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>

            {/* FIXED: Stable ChargeTypeSection component */}
            <ChargeTypeSection
              charges={editForm.charges}
              onUpdateCharge={(index: number, field: string, value: string) => 
                updateCharge(index, field as keyof SportChargeForm, value, true)
              }
              onAddCharge={() => addChargeType(true)}
              onRemoveCharge={(index: number) => removeChargeType(index, true)}
              isEdit={true}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSport(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Sport Activity"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteSport} onOpenChange={() => setDeleteSport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sport Activity</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete <strong>{deleteSport?.activity}</strong>? 
              This action cannot be undone and will remove all associated pricing configurations.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSport(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Activity"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}