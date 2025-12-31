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
  Calendar,
  AlertCircle,
  Sun,
  Moon,
  Sunset,
  Clock,
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
import { Checkbox } from "@/components/ui/checkbox";
import { exportLawnsReport } from "@/lib/pdfExport";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLawn,
  getLawns,
  updateLawn,
  deleteLawn,
  getLawnCategories,
  reserveLawn,
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

interface LawnReservation {
  id: number;
  lawnId: number;
  reservedFrom: string;
  reservedTo: string;
  timeSlot: string;
  admin: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface LawnBooking {
  id: number;
  lawnId: number;
  bookingFrom: string;
  bookingTo: string;
  timeSlot: string;
  admin: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Lawn {
  id: number;
  description: string;
  lawnCategoryId: number;
  lawnCategory: LawnCategory;
  minGuests: number;
  maxGuests: number;
  memberCharges: string;
  guestCharges: string;
  isActive: boolean;
  isOutOfService: boolean;
  outOfOrders: LawnOutOfOrder[];
  reservations: LawnReservation[];
  bookings: LawnBooking[];
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
  memberCharges: "0",
  guestCharges: "0",
  isOutOfService: false,
  isActive: true,
  outOfOrders: [],
};

const initialOutOfOrderState: LawnOutOfOrder = {
  reason: "",
  startDate: "",
  endDate: "",
};

const getUTCMidnight = (dateString: string) => {
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const StatusIndicator = ({ isActive }: { isActive: boolean }) => {
  return isActive ? (
    <Badge className="bg-emerald-600">Active</Badge>
  ) : (
    <Badge variant="outline">Inactive</Badge>
  );
};

const MaintenanceIndicator = ({
  outOfOrders,
  isOutOfService,
}: {
  outOfOrders: LawnOutOfOrder[];
  isOutOfService: boolean;
}) => {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const today = now.getTime();

  // All current or future periods
  const activeAndFuture = outOfOrders
    ?.filter((p) => new Date(p.endDate).getTime() >= today)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) || [];

  const displayCount = 3;
  const sliced = activeAndFuture.slice(0, displayCount);
  const remaining = activeAndFuture.length - displayCount;

  if (activeAndFuture.length === 0 && !isOutOfService) {
    return <span className="text-[10px] text-muted-foreground italic">No maintenance</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {isOutOfService && !activeAndFuture.some(p => new Date(p.startDate).getTime() <= today && new Date(p.endDate).getTime() >= today) && (
        <Badge variant="destructive" className="w-fit text-[10px] py-0 px-1.5 h-4">Manual Out of Service</Badge>
      )}
      {sliced.map((p, idx) => {
        const isCurrent = new Date(p.startDate).getTime() <= today && new Date(p.endDate).getTime() >= today;
        return (
          <div key={idx} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Badge
                variant={isCurrent ? "destructive" : "secondary"}
                className={`text-[9px] py-0 px-1 h-3.5 ${!isCurrent ? "bg-orange-50 text-orange-600 border-orange-100" : ""}`}
              >
                {isCurrent ? "Currently In Maintenance" : "Scheduled"}
              </Badge>
            </div>
            <span className={`text-[10px] font-medium leading-tight ${isCurrent ? "text-red-600" : "text-muted-foreground"}`}>
              {p.reason} ({formatDate(p.startDate)} - {formatDate(p.endDate)})
            </span>
          </div>
        );
      })}
      {remaining > 0 && (
        <span className="text-[9px] text-muted-foreground font-medium pl-1">
          + {remaining} more maintenance periods
        </span>
      )}
    </div>
  );
};

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
    <div className="space-y-4 p-4 rounded-lg border bg-slate-50/50">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          Maintenance Periods
        </Label>
        <Badge variant="outline">{periods.length} Saved</Badge>
      </div>

      {periods.length > 0 && (
        <div className="space-y-2">
          {periods.map((period, index) => (
            <div key={index} className="flex justify-between items-center bg-white p-2 border rounded text-xs">
              <div>
                <span className="font-bold text-orange-800">{formatDate(period.startDate)} - {formatDate(period.endDate)}</span>
                <p className="text-muted-foreground italic">{period.reason}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onRemovePeriod(index)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 p-3 border-2 border-dashed rounded-md bg-orange-50/30">
        <div className="col-span-2">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Reason</Label>
          <Input value={newPeriod.reason} onChange={(e) => onNewPeriodChange({ ...newPeriod, reason: e.target.value })} placeholder="Maintenance Reason" />
        </div>
        <div>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Start Date</Label>
          <Input type="date" value={newPeriod.startDate} onChange={(e) => onNewPeriodChange({ ...newPeriod, startDate: e.target.value })} />
        </div>
        <div>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">End Date</Label>
          <Input type="date" value={newPeriod.endDate} onChange={(e) => onNewPeriodChange({ ...newPeriod, endDate: e.target.value })} />
        </div>
        <Button size="sm" className="col-span-2 h-8" variant="secondary" onClick={onAddPeriod} disabled={!newPeriod.reason || !newPeriod.startDate || !newPeriod.endDate}>
          <Plus className="h-3 w-3 mr-1" /> Add Period
        </Button>
      </div>
    </div>
  );
};

export default function Lawns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editLawn, setEditLawn] = useState<any>(null);
  const [deleteLawnItem, setDeleteLawnItem] = useState<any>(null);
  const [reserveDialog, setReserveDialog] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedLawns, setSelectedLawns] = useState<number[]>([]);
  const [reserveDates, setReserveDates] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("MORNING");

  const [form, setForm] = useState<LawnForm>(initialFormState);
  const [newOutOfOrder, setNewOutOfOrder] = useState<LawnOutOfOrder>(initialOutOfOrderState);
  const [editForm, setEditForm] = useState<any>({ ...initialFormState, id: "" });
  const [editNewOutOfOrder, setEditNewOutOfOrder] = useState<LawnOutOfOrder>(initialOutOfOrderState);

  const { data: lawns = [], isLoading: isLoadingLawns } = useQuery({ queryKey: ["lawns"], queryFn: getLawns });
  const { data: lawnCategories = [] } = useQuery({ queryKey: ["lawnCategories"], queryFn: getLawnCategories });

  const createMutation = useMutation({
    mutationFn: (data: any) => createLawn({ ...data, lawnCategoryId: Number(data.lawnCategoryId) }),
    onSuccess: () => {
      toast({ title: "Lawn created" });
      queryClient.invalidateQueries({ queryKey: ["lawns"] });
      setIsAddOpen(false);
      setForm(initialFormState);
    },
    onError: (err: any) => toast({ title: "Failed to create", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateLawn({ ...data, id: Number(data.id), lawnCategoryId: Number(data.lawnCategoryId) }),
    onSuccess: () => {
      toast({ title: "Lawn updated" });
      queryClient.invalidateQueries({ queryKey: ["lawns"] });
      setEditLawn(null);
    },
    onError: (err: any) => toast({ title: "Failed to update", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLawn,
    onSuccess: () => {
      toast({ title: "Deleted" });
      queryClient.invalidateQueries({ queryKey: ["lawns"] });
      setDeleteLawnItem(null);
    },
  });

  const reserveMutation = useMutation({
    mutationFn: (data: any) => reserveLawn(data.lawnIds, data.reserve, data.timeSlot, data.reserveFrom, data.reserveTo),
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["lawns"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  useEffect(() => {
    if (editLawn) {
      setEditForm({
        id: editLawn.id,
        lawnCategoryId: editLawn.lawnCategoryId.toString(),
        description: editLawn.description || "",
        minGuests: editLawn.minGuests.toString(),
        maxGuests: editLawn.maxGuests.toString(),
        memberCharges: editLawn.memberCharges.toString(),
        guestCharges: editLawn.guestCharges.toString(),
        isActive: editLawn.isActive,
        isOutOfService: editLawn.isOutOfService,
        outOfOrders: editLawn.outOfOrders?.map((p: any) => ({
          ...p,
          startDate: p.startDate.split("T")[0],
          endDate: p.endDate.split("T")[0],
        })) || [],
      });
    }
  }, [editLawn]);

  useEffect(() => {
    if (reserveDialog && reserveDates.from && reserveDates.to && selectedTimeSlot) {
      const selectedFrom = getUTCMidnight(reserveDates.from);
      const selectedTo = getUTCMidnight(reserveDates.to);
      const reserved = lawns.filter((l: Lawn) =>
        l.reservations?.some(r =>
          getUTCMidnight(r.reservedFrom) === selectedFrom &&
          getUTCMidnight(r.reservedTo) === selectedTo &&
          r.timeSlot === selectedTimeSlot
        )
      ).map((l: Lawn) => l.id);
      setSelectedLawns(reserved);
    }
  }, [reserveDialog, reserveDates, selectedTimeSlot, lawns]);

  const categories = useMemo(() => Array.from(new Set(lawns.map((l: any) => l.lawnCategory?.category).filter(Boolean))), [lawns]);
  const filteredLawns = useMemo(() => categoryFilter === "ALL" ? lawns : lawns.filter((l: any) => l.lawnCategory?.category === categoryFilter), [lawns, categoryFilter]);

  const getTimeSlotIcon = (slot: string) => {
    if (slot === "MORNING") return <Sun className="h-4 w-4 text-yellow-500" />;
    if (slot === "EVENING") return <Sunset className="h-4 w-4 text-orange-500" />;
    return <Moon className="h-4 w-4 text-blue-500" />;
  };

  const handleBulkReserve = () => {
    if (!reserveDates.from || !reserveDates.to) return;
    const sFrom = getUTCMidnight(reserveDates.from);
    const sTo = getUTCMidnight(reserveDates.to);
    const currentlyReserved = lawns.filter((l: Lawn) => l.reservations?.some(r => getUTCMidnight(r.reservedFrom) === sFrom && getUTCMidnight(r.reservedTo) === sTo && r.timeSlot === selectedTimeSlot)).map((l: Lawn) => l.id);
    const toReserve = selectedLawns.filter(id => !currentlyReserved.includes(id));
    const toUnreserve = currentlyReserved.filter(id => !selectedLawns.includes(id));
    if (toReserve.length > 0) reserveMutation.mutate({ lawnIds: toReserve, reserve: true, reserveFrom: reserveDates.from, reserveTo: reserveDates.to, timeSlot: selectedTimeSlot });
    if (toUnreserve.length > 0) reserveMutation.mutate({ lawnIds: toUnreserve, reserve: false, reserveFrom: reserveDates.from, reserveTo: reserveDates.to, timeSlot: selectedTimeSlot });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Lawn Management</h1>
          <p className="text-muted-foreground">Manage lawn categories, status, and reservations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-orange-200 bg-orange-50 text-orange-700" onClick={() => setReserveDialog(true)}>
            <Calendar className="h-4 w-4" /> Reservations
          </Button>
          <Button onClick={() => { setForm(initialFormState); setIsAddOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Lawn
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-64"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((c: any) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => exportLawnsReport(lawns)}><FileDown className="h-4 w-4 mr-2" /> Export</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoadingLawns ? <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Charges (Member/Guest)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Maintenance</TableHead>
                  <TableHead>Upcoming Reservations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLawns.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-semibold">{l.lawnCategory?.category}</TableCell>
                    <TableCell>{l.minGuests} - {l.maxGuests}</TableCell>
                    <TableCell>PKR {Number(l.memberCharges).toLocaleString()} / {Number(l.guestCharges).toLocaleString()}</TableCell>
                    <TableCell><StatusIndicator isActive={l.isActive} /></TableCell>
                    <TableCell><MaintenanceIndicator outOfOrders={l.outOfOrders} isOutOfService={l.isOutOfService} /></TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {l.reservations?.filter((r: any) => getUTCMidnight(r.reservedFrom) >= new Date().setUTCHours(0, 0, 0, 0))
                          .sort((a: any, b: any) => getUTCMidnight(a.reservedFrom) - getUTCMidnight(b.reservedFrom))
                          .slice(0, 2).map((r: any) => (
                            <div key={r.id} className="text-[10px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                              {getTimeSlotIcon(r.timeSlot)} {formatDate(r.reservedFrom)} - {formatDate(r.reservedTo)}
                            </div>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setEditLawn(l)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteLawnItem(l)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reservation Dialog */}
      <Dialog open={reserveDialog} onOpenChange={(open) => {
        setReserveDialog(open);
        if (!open) setSelectedLawns([]);
      }}>
        <DialogContent className="max-w-7xl">
          <DialogHeader><DialogTitle>Bulk Reservations</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/40 rounded-lg">
            <div>
              <Label className="text-xs font-semibold">From Date</Label>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={reserveDates.from}
                onChange={e => setReserveDates(p => ({ ...p, from: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">To Date (Checkout)</Label>
              <Input
                type="date"
                min={reserveDates.from || new Date().toISOString().split('T')[0]}
                value={reserveDates.to}
                onChange={e => setReserveDates(p => ({ ...p, to: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Time Slot</Label>
              <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORNING">Morning (8:00 AM - 1:00 PM)</SelectItem>
                  <SelectItem value="EVENING">Evening (2:00 PM - 7:00 PM)</SelectItem>
                  <SelectItem value="NIGHT">Night (8:00 PM - 1:00 AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {reserveDates.from && reserveDates.to && getUTCMidnight(reserveDates.from) >= getUTCMidnight(reserveDates.to) && (
            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Checkout date must be after the start date.</span>
            </div>
          )}

          <div className="max-h-[50vh] overflow-auto border rounded-md">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={selectedLawns.length === filteredLawns.length && filteredLawns.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const nonConflicted = filteredLawns
                            .filter(l => {
                              const mFrom = getUTCMidnight(reserveDates.from);
                              const mTo = getUTCMidnight(reserveDates.to);
                              const hasMaintenance = l.outOfOrders?.some(oo => {
                                const s = getUTCMidnight(oo.startDate);
                                const e = getUTCMidnight(oo.endDate);
                                return s < mTo && e > mFrom;
                              });
                              const hasBooking = l.bookings?.some(b => {
                                const d = getUTCMidnight(b.bookingDate);
                                return d >= mFrom && d < mTo && b.bookingTime === selectedTimeSlot;
                              });
                              return !hasMaintenance && !hasBooking;
                            })
                            .map(l => l.id);
                          setSelectedLawns(nonConflicted);
                        } else {
                          setSelectedLawns([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Lawn Detail</TableHead>
                  <TableHead>Availability Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLawns.map((l: Lawn) => {
                  const mFrom = getUTCMidnight(reserveDates.from);
                  const mTo = getUTCMidnight(reserveDates.to);

                  const activeReservation = l.reservations?.find(r =>
                    getUTCMidnight(r.reservedFrom) === mFrom &&
                    getUTCMidnight(r.reservedTo) === mTo &&
                    r.timeSlot === selectedTimeSlot
                  );

                  const overlappingReservation = l.reservations?.find(r => {
                    const rFrom = getUTCMidnight(r.reservedFrom);
                    const rTo = getUTCMidnight(r.reservedTo);
                    return rFrom < mTo && rTo > mFrom && r.timeSlot === selectedTimeSlot &&
                      !(rFrom === mFrom && rTo === mTo);
                  });

                  const hasMaintenance = l.outOfOrders?.find(oo => {
                    const s = getUTCMidnight(oo.startDate);
                    const e = getUTCMidnight(oo.endDate);
                    return s < mTo && e > mFrom;
                  });

                  const hasBooking = l.bookings?.find(b => {
                    const d = getUTCMidnight(b.bookingFrom);
                    return d >= mFrom && d < mTo && b.timeSlot === selectedTimeSlot;
                  });

                  const isConflicted = hasMaintenance || hasBooking || overlappingReservation;
                  const isAlreadySelected = activeReservation;

                  return (
                    <TableRow key={l.id} className={activeReservation ? "bg-blue-50/50" : isConflicted ? "bg-red-50/30 opacity-80" : ""}>
                      <TableCell className="text-center">
                        <Checkbox
                          disabled={!!isConflicted && !activeReservation}
                          checked={selectedLawns.includes(l.id)}
                          onCheckedChange={checked => setSelectedLawns(prev => checked ? [...prev, l.id] : prev.filter(id => id !== l.id))}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{l.lawnCategory?.category}</div>
                        <div className="text-[10px] text-muted-foreground">{l.description || "No description"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {activeReservation && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 w-fit">Reserved by you</Badge>
                          )}
                          {hasMaintenance && (
                            <div className="flex items-center gap-1.5 text-[10px] text-red-600 font-medium">
                              <AlertCircle className="h-3 w-3" />
                              Maintenance: {hasMaintenance.reason}
                            </div>
                          )}
                          {hasBooking && (
                            <div className="flex items-center gap-1.5 text-[10px] text-red-600 font-medium">
                              <AlertCircle className="h-3 w-3" />
                              Booked by member
                            </div>
                          )}
                          {overlappingReservation && (
                            <div className="flex items-center gap-1.5 text-[10px] text-red-600 font-medium">
                              <AlertCircle className="h-3 w-3" />
                              Overlapping Reservation
                            </div>
                          )}
                          {!isConflicted && !activeReservation && (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/50 w-fit">Available</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredLawns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No lawns found match the criteria.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter className="gap-2">
            <div className="flex-1 text-xs text-muted-foreground flex items-center">
              {selectedLawns.length > 0 && <span>{selectedLawns.length} lawn(s) selected for action.</span>}
            </div>
            <Button variant="outline" onClick={() => setReserveDialog(false)}>Close</Button>
            <Button
              onClick={handleBulkReserve}
              disabled={reserveMutation.isPending || selectedLawns.length === 0 || (reserveDates.from && reserveDates.to && getUTCMidnight(reserveDates.from) >= getUTCMidnight(reserveDates.to))}
            >
              {reserveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Lawn</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Category</Label>
              <Select value={form.lawnCategoryId} onValueChange={v => setForm(p => ({ ...p, lawnCategoryId: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {lawnCategories.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.category}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min Guests</Label>
              <Input type="number" value={form.minGuests} onChange={e => setForm(p => ({ ...p, minGuests: e.target.value }))} />
            </div>
            <div>
              <Label>Max Guests</Label>
              <Input type="number" value={form.maxGuests} onChange={e => setForm(p => ({ ...p, maxGuests: e.target.value }))} />
            </div>
            <div>
              <Label>Member Price</Label>
              <Input type="number" value={form.memberCharges} onChange={e => setForm(p => ({ ...p, memberCharges: e.target.value }))} />
            </div>
            <div>
              <Label>Guest Price</Label>
              <Input type="number" value={form.guestCharges} onChange={e => setForm(p => ({ ...p, guestCharges: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <OutOfOrderPeriods
                periods={form.outOfOrders}
                newPeriod={newOutOfOrder}
                onNewPeriodChange={setNewOutOfOrder}
                onAddPeriod={() => {
                  setForm(p => ({ ...p, outOfOrders: [...p.outOfOrders, newOutOfOrder] }));
                  setNewOutOfOrder(initialOutOfOrderState);
                }}
                onRemovePeriod={(i) => setForm(p => ({ ...p, outOfOrders: p.outOfOrders.filter((_, idx) => idx !== i) }))}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={c => setForm(p => ({ ...p, isActive: c }))} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editLawn} onOpenChange={() => setEditLawn(null)}>
        <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Lawn</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Category</Label>
              <Select value={editForm.lawnCategoryId} onValueChange={v => setEditForm(p => ({ ...p, lawnCategoryId: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {lawnCategories.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.category}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min Guests</Label>
              <Input type="number" value={editForm.minGuests} onChange={e => setEditForm(p => ({ ...p, minGuests: e.target.value }))} />
            </div>
            <div>
              <Label>Max Guests</Label>
              <Input type="number" value={editForm.maxGuests} onChange={e => setEditForm(p => ({ ...p, maxGuests: e.target.value }))} />
            </div>
            <div>
              <Label>Member Price</Label>
              <Input type="number" value={editForm.memberCharges} onChange={e => setEditForm(p => ({ ...p, memberCharges: e.target.value }))} />
            </div>
            <div>
              <Label>Guest Price</Label>
              <Input type="number" value={editForm.guestCharges} onChange={e => setEditForm(p => ({ ...p, guestCharges: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <OutOfOrderPeriods
                periods={editForm.outOfOrders}
                newPeriod={editNewOutOfOrder}
                onNewPeriodChange={setEditNewOutOfOrder}
                onAddPeriod={() => {
                  setEditForm(p => ({ ...p, outOfOrders: [...p.outOfOrders, editNewOutOfOrder] }));
                  setEditNewOutOfOrder(initialOutOfOrderState);
                }}
                onRemovePeriod={(i) => setEditForm(p => ({ ...p, outOfOrders: p.outOfOrders.filter((_, idx) => idx !== i) }))}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={editForm.isActive} onCheckedChange={c => setEditForm(p => ({ ...p, isActive: c }))} />
                <Label>Active</Label>
              </div>

            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLawn(null)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate(editForm)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteLawnItem} onOpenChange={() => setDeleteLawnItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Lawn</DialogTitle></DialogHeader>
          <div className="py-4 text-muted-foreground">Are you sure you want to delete this lawn? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLawnItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteLawnItem.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}