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
  Calendar,
  AlertCircle,
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

interface LawnOutOfOrder {
  id?: number;
  reason: string;
  startDate: string;
  endDate: string;
}

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
  isActive: boolean;
  outOfOrders: LawnOutOfOrder[];
}

const initialFormState: LawnForm = {
  lawnCategoryId: "",
  description: "",
  minGuests: "",
  maxGuests: "",
  memberCharges: "",
  guestCharges: "",
  isOutOfService: false,
  isActive: true,
  outOfOrders: [],
};

const initialOutOfOrderState: LawnOutOfOrder = {
  reason: "",
  startDate: "",
  endDate: "",
};

// Helper function to check if lawn is currently out of service
const isCurrentlyOutOfOrder = (outOfOrders: LawnOutOfOrder[]) => {
  if (!outOfOrders || outOfOrders.length === 0) return false;
  
  const now = new Date();
  return outOfOrders.some(period => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    return start <= now && end > now;
  });
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// OutOfOrderPeriods Component
const OutOfOrderPeriods = ({
  periods,
  onAddPeriod,
  onRemovePeriod,
  newPeriod,
  onNewPeriodChange,
}: {
  periods: LawnOutOfOrder[];
  onAddPeriod: () => void;
  onRemovePeriod: (index: number) => void;
  newPeriod: LawnOutOfOrder;
  onNewPeriodChange: (period: LawnOutOfOrder) => void;
}) => {
  return (
    <div className="space-y-6 p-6 rounded-xl border bg-gradient-to-br dark:from-blue-950/40 dark:to-teal-950/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Out of Service Periods
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add multiple maintenance periods (e.g., Nov 9-10, Dec 9-10)
          </p>
        </div>
        <Badge variant={periods.length > 0 ? "destructive" : "outline"}>
          {periods.length} period(s)
        </Badge>
      </div>

      {/* Current periods */}
      {periods.length > 0 && (
        <div className="space-y-3">
          <Label>Added Maintenance Periods</Label>
          {periods.map((period, index) => (
            <div key={index} className="p-3 border rounded-lg flex justify-between items-center bg-orange-50/50">
              <div>
                <div className="font-medium text-orange-800">
                  {formatDate(period.startDate)} - {formatDate(period.endDate)}
                </div>
                <div className="text-sm text-orange-600">
                  {period.reason}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemovePeriod(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new period form */}
      <div className="p-4 border-2 border-orange-300 rounded-xl bg-orange-50/80 backdrop-blur">
        <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5" /> Add New Maintenance Period
        </h4>
        <div className="space-y-4">
          <div>
            <Label>Reason for Maintenance *</Label>
            <Textarea
              placeholder="e.g. Renovation, water damage, landscaping..."
              className="mt-2"
              value={newPeriod.reason}
              onChange={(e) => onNewPeriodChange({ ...newPeriod, reason: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                className="mt-2"
                value={newPeriod.startDate}
                onChange={(e) => onNewPeriodChange({ ...newPeriod, startDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label>End Date *</Label>
              <Input
                type="date"
                className="mt-2"
                value={newPeriod.endDate}
                onChange={(e) => onNewPeriodChange({ ...newPeriod, endDate: e.target.value })}
                min={newPeriod.startDate || new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
          {newPeriod.startDate && newPeriod.endDate && new Date(newPeriod.startDate) > new Date(newPeriod.endDate) && (
            <p className="text-red-600 text-sm">
              Start date cannot be after end date
            </p>
          )}
          <Button
            type="button"
            onClick={onAddPeriod}
            className="w-full"
            variant="outline"
            disabled={!newPeriod.reason || !newPeriod.startDate || !newPeriod.endDate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Maintenance Period
          </Button>
        </div>
      </div>
    </div>
  );
};

// Status Indicator Component
const StatusIndicator = ({ 
  outOfOrders,
  isActive 
}: { 
  outOfOrders: LawnOutOfOrder[];
  isActive: boolean;
}) => {
  const currentlyOutOfOrder = isCurrentlyOutOfOrder(outOfOrders);
  const hasFuturePeriods = outOfOrders?.some(period => new Date(period.startDate) > new Date());

  if (currentlyOutOfOrder) {
    return (
      <Badge variant="destructive" className="font-medium">
        Currently Out of Service
      </Badge>
    );
  }

  if (hasFuturePeriods) {
    return (
      <Badge variant="outline" className="border-orange-300 text-orange-700">
        Scheduled Maintenance
      </Badge>
    );
  }

  return (
    <>
      {isActive ? <Badge className="bg-emerald-600 text-white font-medium">Active</Badge>: <Badge variant="outline" className="bg-gray-500 text-white font-medium">InActive</Badge>}
    </>
  );
};

export default function Lawns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editLawn, setEditLawn] = useState<any>(null);
  const [deleteLawnItem, setDeleteLawnItem] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [form, setForm] = useState<LawnForm>(initialFormState);
  const [newOutOfOrder, setNewOutOfOrder] = useState<LawnOutOfOrder>(initialOutOfOrderState);
  
  const [editForm, setEditForm] = useState<LawnForm & { id: string }>({
    ...initialFormState,
    id: "",
  });
  const [editNewOutOfOrder, setEditNewOutOfOrder] = useState<LawnOutOfOrder>(initialOutOfOrderState);

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
      setNewOutOfOrder(initialOutOfOrderState);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.cause || error.message || "Failed to create lawn";
      toast({ 
        title: "Failed to create lawn", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateLawn,
    onSuccess: () => {
      toast({ title: "Lawn updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["lawns"] });
      setEditLawn(null);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.cause || error.message || "Failed to update lawn";
      toast({ 
        title: "Failed to update lawn", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
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
      const outOfOrders = editLawn.outOfOrders?.map((period: any) => ({
        id: period.id,
        reason: period.reason || "",
        startDate: period.startDate?.split("T")[0] || "",
        endDate: period.endDate?.split("T")[0] || "",
      })) || [];

      setEditForm({
        id: editLawn.id.toString(),
        lawnCategoryId: editLawn.lawnCategoryId?.toString() || "",
        description: editLawn.description || "",
        minGuests: editLawn.minGuests?.toString() || "",
        maxGuests: editLawn.maxGuests?.toString() || "",
        memberCharges: editLawn.memberCharges?.toString() || "",
        guestCharges: editLawn.guestCharges?.toString() || "",
        isOutOfService: editLawn.isOutOfService || false,
        outOfOrders: outOfOrders,
        isActive: editLawn.isActive,
      });
      setEditNewOutOfOrder(initialOutOfOrderState);
    }
  }, [editLawn]);

  // Add new out-of-order period to form
  const handleAddOutOfOrder = () => {
    if (!newOutOfOrder.reason || !newOutOfOrder.startDate || !newOutOfOrder.endDate) {
      toast({
        title: "Missing information",
        description: "Please fill all fields for maintenance period",
        variant: "destructive",
      });
      return;
    }

    if (new Date(newOutOfOrder.startDate) > new Date(newOutOfOrder.endDate)) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setForm(prev => ({
      ...prev,
      outOfOrders: [...prev.outOfOrders, { ...newOutOfOrder }],
      isOutOfService: true, // Auto-set to out of service when periods are added
    }));

    setNewOutOfOrder(initialOutOfOrderState);
  };

  const handleRemoveOutOfOrder = (index: number) => {
    const newPeriods = form.outOfOrders.filter((_, i) => i !== index);
    setForm(prev => ({
      ...prev,
      outOfOrders: newPeriods,
      isOutOfService: newPeriods.length > 0,
    }));
  };

  // Edit out-of-order handlers
  const handleAddEditOutOfOrder = () => {
    if (!editNewOutOfOrder.reason || !editNewOutOfOrder.startDate || !editNewOutOfOrder.endDate) {
      toast({
        title: "Missing information",
        description: "Please fill all fields for maintenance period",
        variant: "destructive",
      });
      return;
    }

    if (new Date(editNewOutOfOrder.startDate) > new Date(editNewOutOfOrder.endDate)) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setEditForm(prev => ({
      ...prev,
      outOfOrders: [...prev.outOfOrders, { ...editNewOutOfOrder }],
      isOutOfService: true,
    }));

    setEditNewOutOfOrder(initialOutOfOrderState);
  };

  const handleRemoveEditOutOfOrder = (index: number) => {
    const newPeriods = editForm.outOfOrders.filter((_, i) => i !== index);
    setEditForm(prev => ({
      ...prev,
      outOfOrders: newPeriods,
      isOutOfService: newPeriods.length > 0,
    }));
  };

  const handleCreate = useCallback(() => {
    if (!form.lawnCategoryId || !form.minGuests || !form.maxGuests) {
      toast({ title: "Category, Min & Max Guests are required", variant: "destructive" });
      return;
    }

    // Validate out-of-order periods
    for (const period of form.outOfOrders) {
      if (!period.reason.trim()) {
        toast({
          title: "Reason required",
          description: "Please provide a reason for each maintenance period",
          variant: "destructive"
        });
        return;
      }

      if (new Date(period.startDate) > new Date(period.endDate)) {
        toast({
          title: "Invalid date range",
          description: "End date must be after start date for all maintenance periods",
          variant: "destructive"
        });
        return;
      }
    }

    const payload = {
      lawnCategoryId: form.lawnCategoryId,
      description: form.description,
      minGuests: form.minGuests,
      maxGuests: form.maxGuests,
      memberCharges: form.memberCharges || "0",
      guestCharges: form.guestCharges || "0",
      outOfOrders: form.outOfOrders,
      isActive: form.isActive
    };

    createMutation.mutate(payload);
  }, [form, createMutation, toast]);

  const handleUpdate = useCallback(() => {
    if (!editForm.lawnCategoryId || !editForm.minGuests || !editForm.maxGuests) {
      toast({ title: "Category, Min & Max Guests are required", variant: "destructive" });
      return;
    }

    // Validate out-of-order periods
    for (const period of editForm.outOfOrders) {
      if (!period.reason.trim()) {
        toast({
          title: "Reason required",
          description: "Please provide a reason for each maintenance period",
          variant: "destructive"
        });
        return;
      }

      if (new Date(period.startDate) > new Date(period.endDate)) {
        toast({
          title: "Invalid date range",
          description: "End date must be after start date for all maintenance periods",
          variant: "destructive"
        });
        return;
      }
    }

    const payload = {
      id: editForm.id,
      lawnCategoryId: editForm.lawnCategoryId,
      description: editForm.description,
      minGuests: editForm.minGuests,
      maxGuests: editForm.maxGuests,
      memberCharges: editForm.memberCharges,
      guestCharges: editForm.guestCharges,
      outOfOrders: editForm.outOfOrders,
      isActive: editForm.isActive
    };

    updateMutation.mutate(payload);
  }, [editForm, updateMutation, toast]);

  const resetAddForm = () => {
    setForm(initialFormState);
    setNewOutOfOrder(initialOutOfOrderState);
  };

  return (
    <div className="space-y-8">
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
                  <div>
                    <Label>Min Guests *</Label>
                    <Input 
                      type="number" 
                      value={form.minGuests} 
                      onChange={e => setForm(prev => ({ ...prev, minGuests: e.target.value }))} 
                      placeholder="100" 
                    />
                  </div>
                  <div>
                    <Label>Max Guests *</Label>
                    <Input 
                      type="number" 
                      value={form.maxGuests} 
                      onChange={e => setForm(prev => ({ ...prev, maxGuests: e.target.value }))} 
                      placeholder="600" 
                    />
                  </div>
                  <div>
                    <Label>Member Charges (PKR)</Label>
                    <Input 
                      type="number" 
                      value={form.memberCharges} 
                      onChange={e => setForm(prev => ({ ...prev, memberCharges: e.target.value }))} 
                      placeholder="35000" 
                    />
                  </div>
                  <div>
                    <Label>Guest Charges (PKR)</Label>
                    <Input 
                      type="number" 
                      value={form.guestCharges} 
                      onChange={e => setForm(prev => ({ ...prev, guestCharges: e.target.value }))} 
                      placeholder="45000" 
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={form.description} 
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} 
                    rows={4} 
                    placeholder="Beautiful green lawn..." 
                  />
                </div>

                {/* Out of Order Periods */}
                <OutOfOrderPeriods
                  periods={form.outOfOrders}
                  onAddPeriod={handleAddOutOfOrder}
                  onRemovePeriod={handleRemoveOutOfOrder}
                  newPeriod={newOutOfOrder}
                  onNewPeriodChange={setNewOutOfOrder}
                />

                {/* Status Toggle (for backward compatibility) */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                  <div>
                    <Label className="text-base font-medium">Overall Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {form.outOfOrders.length > 0
                        ? `Lawn has ${form.outOfOrders.length} maintenance period(s)`
                        : "Lawn is active and available"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label>Active</Label>
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(checked) => {
                        setForm(prev => ({ 
                          ...prev, 
                          isActive: checked,
                          isOutOfService: !checked,
                          outOfOrders: checked ? [] : prev.outOfOrders
                        }));
                      }}
                      disabled={form.outOfOrders.length > 0}
                    />
                    {form.outOfOrders.length > 0 && (
                      <p className="text-xs text-orange-600">
                        Clear all periods first to activate
                      </p>
                    )}
                  </div>
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
            <div className="flex justify-center py-32">
              <Loader2 className="h-12 w-12 animate-spin" />
            </div>
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
                  <TableHead>Maintenance Periods</TableHead>
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
                      <StatusIndicator 
                        outOfOrders={lawn.outOfOrders || []} 
                        isActive={lawn.isActive} 
                      />
                    </TableCell>
                    <TableCell>
                      {lawn.outOfOrders && lawn.outOfOrders.length > 0 ? (
                        <div className="space-y-1 max-w-xs">
                          {lawn.outOfOrders.slice(0, 2).map((period: any, idx: number) => (
                            <div key={idx} className="text-xs bg-orange-50 px-2 py-1 rounded border border-orange-200">
                              <div className="font-medium text-orange-700">
                                {formatDate(period.startDate)} - {formatDate(period.endDate)}
                              </div>
                              <div className="text-orange-600 truncate">
                                {period.reason}
                              </div>
                            </div>
                          ))}
                          {lawn.outOfOrders.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{lawn.outOfOrders.length - 2} more periods
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditLawn(lawn)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteLawnItem(lawn)}>
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

      {/* EDIT DIALOG */}
      <Dialog open={!!editLawn} onOpenChange={() => setEditLawn(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Lawn: {editLawn?.lawnCategory?.category}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div>
              <Label>Lawn Category *</Label>
              <Select value={editForm.lawnCategoryId} onValueChange={v => setEditForm(prev => ({ ...prev, lawnCategoryId: v }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {lawnCategories.map((cat: LawnCategory) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Min Guests *</Label>
                <Input 
                  type="number" 
                  value={editForm.minGuests} 
                  onChange={e => setEditForm(prev => ({ ...prev, minGuests: e.target.value }))} 
                />
              </div>
              <div>
                <Label>Max Guests *</Label>
                <Input 
                  type="number" 
                  value={editForm.maxGuests} 
                  onChange={e => setEditForm(prev => ({ ...prev, maxGuests: e.target.value }))} 
                />
              </div>
              <div>
                <Label>Member Charges</Label>
                <Input 
                  type="number" 
                  value={editForm.memberCharges} 
                  onChange={e => setEditForm(prev => ({ ...prev, memberCharges: e.target.value }))} 
                />
              </div>
              <div>
                <Label>Guest Charges</Label>
                <Input 
                  type="number" 
                  value={editForm.guestCharges} 
                  onChange={e => setEditForm(prev => ({ ...prev, guestCharges: e.target.value }))} 
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea 
                value={editForm.description} 
                onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} 
                rows={4} 
              />
            </div>

            {/* Edit Out of Order Periods */}
            <OutOfOrderPeriods
              periods={editForm.outOfOrders}
              onAddPeriod={handleAddEditOutOfOrder}
              onRemovePeriod={handleRemoveEditOutOfOrder}
              newPeriod={editNewOutOfOrder}
              onNewPeriodChange={setEditNewOutOfOrder}
            />

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div>
                <Label className="text-base font-medium">Overall Status</Label>
                <p className="text-sm text-muted-foreground">
                  {editForm.outOfOrders.length > 0
                    ? `Lawn has ${editForm.outOfOrders.length} maintenance period(s)`
                    : "Lawn is active and available"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Label>Active</Label>
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => {
                    setEditForm(prev => ({ 
                      ...prev, 
                      isActive: checked,
                      isOutOfService: !checked,
                      outOfOrders: checked ? [] : prev.outOfOrders
                    }));
                  }}
                  disabled={editForm.outOfOrders.length > 0}
                />
                {editForm.outOfOrders.length > 0 && (
                  <p className="text-xs text-orange-600">
                    Clear all periods first to activate
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLawn(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Lawn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={!!deleteLawnItem} onOpenChange={() => setDeleteLawnItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lawn</DialogTitle>
          </DialogHeader>
          <p className="py-6">
            Are you sure you want to delete this lawn? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLawnItem(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate(deleteLawnItem.id)}
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