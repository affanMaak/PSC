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
  AlertCircle,
  Calendar,
  Clock,
  Info,
  Filter,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRoom,
  getRooms,
  getRoomCategories,
  updateRoom,
  deleteRoom,
  reserveRoom,
} from "../../config/apis";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPakistanDateString } from "@/utils/pakDate";

interface RoomReservation {
  id: string;
  roomId: string;
  reservedFrom: string;
  reservedTo: string;
  admin: any;
  createdAt: string;
  updatedAt: string;
}

interface Room {
  id: string;
  roomNumber: string;
  roomType: { type: string; priceGuest: number; priceMember: number };
  roomTypeId: string;
  description: string;
  isActive: boolean;
  isOutOfOrder: boolean;
  isReserved: boolean;
  outOfOrderReason?: string;
  outOfOrderTo?: string;
  outOfOrderFrom?: string;
  reservations: RoomReservation[];
}

export default function Rooms() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // === STATE ===
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Room | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [reserveDialog, setReserveDialog] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [reserveDates, setReserveDates] = useState({
    from: getPakistanDateString(new Date()),
    to: getPakistanDateString(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  });

  // Form state
  const [form, setForm] = useState({
    roomNumber: "",
    roomTypeId: "",
    description: "",
    isActive: true,
    isOutOfOrder: false,
    outOfOrderReason: "",
    outOfOrderFrom: "",
    outOfOrderTo: "",
  });

  // === FETCH DATA ===
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const { data: roomCategories = [] } = useQuery({
    queryKey: ["roomCategories"],
    queryFn: getRoomCategories,
  });

  // === MUTATIONS ===
  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      toast({ title: "Room added successfully" });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      closeAddDialog();
    },
    onError: (err: any) =>
      toast({
        title: "Failed to add room",
        description: err.message || "Please try again",
        variant: "destructive",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: updateRoom,
    onSuccess: () => {
      toast({ title: "Room updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setEditRoom(null);
    },
    onError: (err: any) =>
      toast({
        title: "Failed to update room",
        description: err.message || "Please try again",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      toast({ title: "Room deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setDeleteDialog(null);
    },
    onError: (err: any) =>
      toast({
        title: "Failed to delete room",
        description: err.message || "Please try again",
        variant: "destructive",
      }),
  });

  const reserveMutation = useMutation({
    mutationFn: ({
      roomIds,
      reserve,
      reserveFrom,
      reserveTo,
    }: {
      roomIds: string[];
      reserve: boolean;
      reserveFrom?: string;
      reserveTo?: string;
    }) => reserveRoom(roomIds, reserve, reserveFrom, reserveTo),
    onSuccess: (data) => {
      toast({
        title: "Reservations updated successfully",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      // Don't close the dialog automatically - let admin continue making changes
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update reservations";
      toast({
        title: "Operation failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // === HELPER FUNCTIONS ===
  const closeAddDialog = () => {
    setIsAddOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      roomNumber: "",
      roomTypeId: "",
      description: "",
      isActive: true,
      isOutOfOrder: false,
      outOfOrderReason: "",
      outOfOrderFrom: "",
      outOfOrderTo: "",
    });
  };

  const openEditDialog = (room: Room) => {
    setForm({
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      description: room.description,
      isActive: room.isActive,
      isOutOfOrder: room.isOutOfOrder,
      outOfOrderReason: room.outOfOrderReason || "",
      outOfOrderFrom: room.outOfOrderFrom || "",
      outOfOrderTo: room.outOfOrderTo || "",
    });
    setEditRoom(room);
  };

  const handleSubmit = () => {
    if (!form.roomNumber || !form.roomTypeId) {
      toast({
        title: "Missing required fields",
        description: "Room number and type are required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      roomNumber: form.roomNumber,
      roomTypeId: form.roomTypeId,
      description: form.description,
      isActive: form.isActive,
      isOutOfOrder: form.isOutOfOrder,
      outOfOrderReason: form.isOutOfOrder ? form.outOfOrderReason : undefined,
      outOfOrderFrom: form.isOutOfOrder ? form.outOfOrderFrom : undefined,
      outOfOrderTo: form.isOutOfOrder ? form.outOfOrderTo : undefined,
      ...(editRoom && { id: editRoom.id }),
    };

    if (editRoom) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  // Check if room has reservation for the exact selected dates
  const isRoomReservedForDates = (room: Room) => {
    if (!reserveDates.from || !reserveDates.to) return false;

    const selectedFrom = new Date(reserveDates.from).setHours(0, 0, 0, 0);
    const selectedTo = new Date(reserveDates.to).setHours(0, 0, 0, 0);

    return room.reservations.some((reservation) => {
      const reservationFrom = new Date(reservation.reservedFrom).setHours(0, 0, 0, 0);
      const reservationTo = new Date(reservation.reservedTo).setHours(0, 0, 0, 0);
      const reservedBy = reservation.admin.name;

      return reservationFrom === selectedFrom && reservationTo === selectedTo;
    });
  };

  // Check if room has overlapping reservations with selected dates (excluding exact matches)
  const hasOverlappingReservations = (room: Room) => {
    if (!reserveDates.from || !reserveDates.to) return false;

    const selectedFrom = new Date(reserveDates.from).setHours(0, 0, 0, 0);
    const selectedTo = new Date(reserveDates.to).setHours(0, 0, 0, 0);

    return room.reservations.some((reservation) => {
      const reservationFrom = new Date(reservation.reservedFrom).setHours(0, 0, 0, 0);
      const reservationTo = new Date(reservation.reservedTo).setHours(0, 0, 0, 0);

      // Check for overlap but EXCLUDE exact matches
      const isExactMatch = reservationFrom === selectedFrom && reservationTo === selectedTo;
      const hasOverlap = selectedFrom <= reservationTo && selectedTo >= reservationFrom;

      return hasOverlap && !isExactMatch;
    });
  };

  // Handle room selection with reservation cancellation
  const handleRoomSelection = (roomId: string, checked: boolean) => {
    const room = rooms.find((r: Room) => r.id === roomId);
    const isCurrentlyReserved = room && isRoomReservedForDates(room);

    if (checked) {
      // Add to selected rooms
      setSelectedRooms((prev) => [...prev, roomId]);
    } else {
      // Remove from selected rooms
      setSelectedRooms((prev) => prev.filter((id) => id !== roomId));

      // If unchecking a room that was reserved for these dates, cancel the reservation immediately
      if (isCurrentlyReserved && reserveDates.from && reserveDates.to) {
        // Validate dates before making the API call
        const fromDate = new Date(reserveDates.from);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(reserveDates.to);
        toDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log(reserveDates)
        // Only proceed if dates are valid
        if (fromDate < toDate && fromDate >= today) {
          reserveMutation.mutate({
            roomIds: [roomId],
            reserve: false,
            reserveFrom: reserveDates.from,
            reserveTo: reserveDates.to,
          });
        } else {
          // If dates are invalid, show error and revert the selection
          toast({
            title: "Cannot remove reservation",
            description: "Selected dates are invalid",
            variant: "destructive",
          });
          setSelectedRooms((prev) => [...prev, roomId]); // Re-add the room
        }
      }
    }
  };

  const handleBulkReserve = () => {
    if (!reserveDates.from || !reserveDates.to) {
      toast({
        title: "Missing dates",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    // Parse dates as Pakistan Time
    const fromDate = new Date(reserveDates.from + 'T00:00:00+05:00');
    const toDate = new Date(reserveDates.to + 'T00:00:00+05:00');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Apply Pakistan timezone offset for comparison
    const pktOffset = 5 * 60 * 60 * 1000;
    const todayPKT = new Date(today.getTime() + pktOffset);
    todayPKT.setHours(0, 0, 0, 0);

    if (fromDate >= toDate) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    if (fromDate < todayPKT) {
      toast({
        title: "Invalid start date",
        description: "Start date cannot be in the past",
        variant: "destructive",
      });
      return;
    }

    // Get rooms that are currently reserved for the exact dates
    const currentlyReservedRoomIds = rooms
      .filter((room: Room) => isRoomReservedForDates(room))
      .map((room) => room.id);

    // Rooms to reserve: selected but not currently reserved
    const roomsToReserve = selectedRooms.filter(
      (roomId) => !currentlyReservedRoomIds.includes(roomId)
    );

    // Rooms to unreserve: currently reserved but not selected
    const roomsToUnreserve = currentlyReservedRoomIds.filter(
      (roomId) => !selectedRooms.includes(roomId)
    );

    // Check for overlapping reservations only for NEW reservations
    const roomsWithOverlaps = roomsToReserve.filter((roomId) => {
      const room = rooms.find((r: Room) => r.id === roomId);
      return room && hasOverlappingReservations(room);
    });

    if (roomsWithOverlaps.length > 0) {
      toast({
        title: "Overlapping reservations detected",
        description: `${roomsWithOverlaps.length} room(s) have overlapping reservations that conflict with the selected dates`,
        variant: "destructive",
      });
      return;
    }

    if (roomsToReserve.length === 0 && roomsToUnreserve.length === 0) {
      toast({
        title: "No changes to make",
        description: "The selected rooms already match the current reservation status",
        variant: "default",
      });
      return;
    }

    // Process reservations and unreservations
    if (roomsToReserve.length > 0) {
      reserveMutation.mutate({
        roomIds: roomsToReserve,
        reserve: true,
        reserveFrom: reserveDates.from,
        reserveTo: reserveDates.to,
      });
    }

    if (roomsToUnreserve.length > 0) {
      reserveMutation.mutate({
        roomIds: roomsToUnreserve,
        reserve: false,
        reserveFrom: reserveDates.from,
        reserveTo: reserveDates.to,
      });
    }
  };

  // Auto-select rooms that are already reserved for the selected dates
  useEffect(() => {
    if (reserveDates.from && reserveDates.to) {
      const roomsReservedForDates = rooms.filter((room: Room) =>
        isRoomReservedForDates(room)
      );
      const reservedRoomIds = roomsReservedForDates.map((room) => room.id);
      setSelectedRooms(reservedRoomIds);
    } else {
      setSelectedRooms([]);
    }
  }, [reserveDates.from, reserveDates.to, rooms]);

  // Get unique room types for filter
  const roomTypes = [...new Set(rooms.map((room: Room) => room.roomType.type))];

  // Filter rooms based on status and type
  const filteredRooms = rooms.filter((room: Room) => {
    // Status filter
    const statusMatch =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE"
        ? room.isActive && !room.isOutOfOrder && !room.isReserved
        : statusFilter === "OUT_OF_ORDER"
          ? room.isOutOfOrder
          : statusFilter === "RESERVED"
            ? room.isReserved
            : !room.isActive);

    // Type filter
    const typeMatch = typeFilter === "ALL" || room.roomType.type === typeFilter;

    return statusMatch && typeMatch;
  });

  // Group rooms by type for reserve dialog
  const roomsByType = rooms.reduce((acc: any, room: Room) => {
    const type = room.roomType.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(room);
    return acc;
  }, {});

  // Get room status for display
  const getRoomStatus = (room: Room) => {
    const now = new Date();
    const outOfOrderFrom = room.outOfOrderFrom ? new Date(room.outOfOrderFrom) : null;
    const outOfOrderTo = room.outOfOrderTo ? new Date(room.outOfOrderTo) : null;

    // Check if room is currently out of order
    if (room.isOutOfOrder) return "Out of Order";

    // Check if room is scheduled to be out of order in the future
    if (outOfOrderFrom && outOfOrderFrom > now) {
      return "Scheduled for Maintenance"
    }

    if (room.isReserved) return "Currently Reserved";
    if (!room.isActive) return "Inactive";

    // Check for future reservations
    const hasFutureReservations = room.reservations.some(
      (reservation) => new Date(reservation.reservedFrom) > now
    );

    if (hasFutureReservations) return "Scheduled";

    return "Available";
  };

  // Get room status badge variant
  const getRoomStatusVariant = (room: Room) => {
    const now = new Date();
    const outOfOrderFrom = room.outOfOrderFrom ? new Date(room.outOfOrderFrom) : null;

    if (room.isOutOfOrder) return "destructive";

    // Check if scheduled for maintenance (future out-of-order)
    if (outOfOrderFrom && outOfOrderFrom > now) return "outline";

    if (room.isReserved) return "secondary";
    if (!room.isActive) return "secondary";

    const hasFutureReservations = room.reservations.some(
      (reservation) => new Date(reservation.reservedFrom) > now
    );

    if (hasFutureReservations) return "outline";

    return "default";
  };

  // Get upcoming reservations for a room
  const getUpcomingReservations = (room: Room) => {
    const now = new Date();
    return room.reservations
      .filter((reservation) => new Date(reservation.reservedTo) >= now)
      .sort(
        (a, b) =>
          new Date(a.reservedFrom).getTime() -
          new Date(b.reservedFrom).getTime()
      );
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  // Check if any filter is active
  const hasActiveFilters = statusFilter !== "ALL" || typeFilter !== "ALL";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Manage Rooms
          </h2>
          <p className="text-muted-foreground">
            Manage room inventory, status, and reservations
          </p>
        </div>
        <div className="flex gap-2">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    !
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Rooms</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <div className="p-2 space-y-4">
                  {/* Status Filter */}
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active & Available</SelectItem>
                        <SelectItem value="OUT_OF_ORDER">Out of Order</SelectItem>
                        <SelectItem value="RESERVED">Currently Reserved</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <Label className="text-sm font-medium">Room Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        {roomTypes.map((type: any) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full text-xs"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            onClick={() => setReserveDialog(true)}
            className="gap-2"
            disabled={roomsLoading}
          >
            <Calendar className="h-4 w-4" />
            Manage Reservations
          </Button>

          <Dialog
            open={isAddOpen}
            onOpenChange={(open) => {
              if (!open) closeAddDialog();
              else setIsAddOpen(true);
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                onClick={() => {
                  setIsAddOpen(true);
                  resetForm();
                }}
              >
                <Plus className="h-4 w-4" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Room Number *</Label>
                    <Input
                      value={form.roomNumber}
                      onChange={(e) =>
                        setForm({ ...form, roomNumber: e.target.value })
                      }
                      placeholder="101"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Room Type *</Label>
                    <Select
                      value={form.roomTypeId}
                      onValueChange={(v) => setForm({ ...form, roomTypeId: v })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomCategories?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.type} (Member: PKR{" "}
                            {parseInt(cat.priceMember).toLocaleString()}, Guest:
                            PKR {parseInt(cat.priceGuest).toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Room features, amenities, etc."
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Room is available for bookings
                    </p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) =>
                      setForm({
                        ...form,
                        isActive: v,
                        isOutOfOrder: v ? false : form.isOutOfOrder,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base">Out of Order</Label>
                    <p className="text-sm text-muted-foreground">
                      Room is unavailable for maintenance or repairs
                    </p>
                  </div>
                  <Switch
                    checked={form.isOutOfOrder}
                    onCheckedChange={(v) =>
                      setForm({
                        ...form,
                        isOutOfOrder: v,
                        isActive: v ? false : form.isActive,
                      })
                    }
                  />
                </div>

                {form.isOutOfOrder && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div>
                      <Label>Out of Order Reason *</Label>
                      <Textarea
                        value={form.outOfOrderReason}
                        onChange={(e) =>
                          setForm({ ...form, outOfOrderReason: e.target.value })
                        }
                        placeholder="Describe the issue (maintenance, renovation, repair, etc.)"
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Out of Order From *</Label>
                        <Input
                          type="date"
                          value={form.outOfOrderFrom}
                          onChange={(e) =>
                            setForm({ ...form, outOfOrderFrom: e.target.value })
                          }
                          className="mt-2"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <Label>Expected Available From *</Label>
                        <Input
                          type="date"
                          value={form.outOfOrderTo}
                          onChange={(e) =>
                            setForm({ ...form, outOfOrderTo: e.target.value })
                          }
                          className="mt-2"
                          min={form.outOfOrderFrom || new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeAddDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="gap-2"
                >
                  {createMutation.isPending && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {createMutation.isPending ? "Adding..." : "Add Room"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Active Filters:</span>
          {statusFilter !== "ALL" && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusFilter === "ACTIVE" ? "Active & Available" :
                statusFilter === "OUT_OF_ORDER" ? "Out of Order" :
                  statusFilter === "RESERVED" ? "Currently Reserved" : "Inactive"}
              <button
                onClick={() => setStatusFilter("ALL")}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {typeFilter !== "ALL" && (
            <Badge variant="secondary" className="gap-1">
              Type: {typeFilter}
              <button
                onClick={() => setTypeFilter("ALL")}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto text-xs h-7"
          >
            Clear All
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {roomsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading rooms...
              </div>
            </div>
          ) : filteredRooms?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">
                {hasActiveFilters ? "No rooms match your filters" : "No rooms found"}
              </div>
              {hasActiveFilters ? (
                <Button onClick={clearFilters} className="gap-2">
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Room
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reservations</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms?.map((room: Room) => {
                  const upcomingReservations = getUpcomingReservations(room);
                  return (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {room.roomNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {room.roomType?.type}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Member: PKR {room.roomType?.priceMember} | Guest:
                            PKR {room.roomType?.priceGuest}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoomStatusVariant(room)}>
                          {getRoomStatus(room)}
                        </Badge>

                        {/* Show maintenance dates for both current and scheduled out-of-order */}
                        {(room.isOutOfOrder || (room.outOfOrderFrom && new Date(room.outOfOrderFrom) > new Date())) &&
                          room.outOfOrderFrom && room.outOfOrderTo && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(room.outOfOrderFrom).toLocaleDateString()} - {new Date(room.outOfOrderTo).toLocaleDateString()}
                            </div>
                          )}

                        {/* Show current out-of-order reason if available */}
                        {room.isOutOfOrder && room.outOfOrderReason && (
                          <div className="text-xs text-red-600 mt-1">
                            {room.outOfOrderReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {upcomingReservations.length > 0 ? (
                          <div className="space-y-1">
                            {upcomingReservations
                              .slice(0, 2)
                              .map((reservation) => (
                                <div key={reservation.id} className="text-xs flex flex-col">
                                  <strong>{reservation.admin.name}</strong>
                                  {new Date(
                                    reservation.reservedFrom
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(
                                    reservation.reservedTo
                                  ).toLocaleDateString()}
                                </div>
                              ))}
                            {upcomingReservations.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{upcomingReservations.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No upcoming
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        {room.description || "No description"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(room)}
                            title="Edit room"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog(room)}
                            title="Delete room"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editRoom} onOpenChange={() => setEditRoom(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Room Number *</Label>
                <Input
                  value={form.roomNumber}
                  onChange={(e) =>
                    setForm({ ...form, roomNumber: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Room Type *</Label>
                <Select
                  value={form.roomTypeId}
                  onValueChange={(v) => setForm({ ...form, roomTypeId: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomCategories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Room is available for bookings
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) =>
                  setForm({
                    ...form,
                    isActive: v,
                    isOutOfOrder: v ? false : form.isOutOfOrder,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Out of Order</Label>
                <p className="text-sm text-muted-foreground">
                  Room is unavailable for maintenance or repairs
                </p>
              </div>
              <Switch
                checked={form.isOutOfOrder}
                onCheckedChange={(v) =>
                  setForm({
                    ...form,
                    isOutOfOrder: v,
                    isActive: v ? false : form.isActive,
                  })
                }
              />
            </div>

            {form.isOutOfOrder && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label>Out of Order Reason *</Label>
                  <Textarea
                    value={form.outOfOrderReason}
                    onChange={(e) =>
                      setForm({ ...form, outOfOrderReason: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Out of Order From *</Label>
                    <Input
                      type="date"
                      value={form.outOfOrderFrom}
                      onChange={(e) =>
                        setForm({ ...form, outOfOrderFrom: e.target.value })
                      }
                      className="mt-2"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label>Expected Available From *</Label>
                    <Input
                      type="date"
                      value={form.outOfOrderTo}
                      onChange={(e) =>
                        setForm({ ...form, outOfOrderTo: e.target.value })
                      }
                      className="mt-2"
                      min={form.outOfOrderFrom || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoom(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="gap-2"
            >
              {updateMutation.isPending && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {updateMutation.isPending ? "Updating..." : "Update Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reserve Rooms Dialog */}
      <Dialog open={reserveDialog} onOpenChange={setReserveDialog}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Room Reservations</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select dates and rooms to manage reservations. Rooms already
              reserved for the selected dates will be automatically checked.
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label>Reserve From *</Label>
                <Input
                  type="date"
                  value={reserveDates.from}
                  onChange={(e) =>
                    setReserveDates((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                  className="mt-2"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label>Reserve To *</Label>
                <Input
                  type="date"
                  value={reserveDates.to}
                  onChange={(e) =>
                    setReserveDates((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="mt-2"
                  min={
                    reserveDates.from || new Date().toISOString().split("T")[0]
                  }
                />
              </div>
            </div>

            {/* Summary */}
            {reserveDates.from && reserveDates.to && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Info className="h-4 w-4" />
                  <span>
                    Managing reservations for{" "}
                    <strong>
                      {new Date(reserveDates.from).toLocaleDateString()} to{" "}
                      {new Date(reserveDates.to).toLocaleDateString()}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* Rooms by Category */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-4">
              {Object.entries(roomsByType).map(
                ([type, typeRooms]: [string, any]) => (
                  <div key={type} className="border rounded-lg">
                    <div className="p-3 bg-muted font-medium flex items-center justify-between">
                      <span>{type} Rooms</span>
                      <Badge variant="outline">{typeRooms.length} rooms</Badge>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {typeRooms.map((room: Room) => {
                        const isReservedForDates = isRoomReservedForDates(room);
                        const hasOverlap = hasOverlappingReservations(room);

                        // Check if room is out of order during the selected dates
                        const isOutOfOrderForSelectedDates = (() => {
                          if (!reserveDates.from || !reserveDates.to) return false;

                          const selectedFrom = new Date(reserveDates.from);
                          const selectedTo = new Date(reserveDates.to);

                          // If room has out-of-order dates, check if selected dates overlap
                          if (room.outOfOrderFrom && room.outOfOrderTo) {
                            const outOfOrderFrom = new Date(room.outOfOrderFrom);
                            const outOfOrderTo = new Date(room.outOfOrderTo);
                            return (selectedFrom <= outOfOrderTo && selectedTo >= outOfOrderFrom);
                          }

                          return false;
                        })();

                        const upcomingReservations = getUpcomingReservations(room);

                        // Determine if checkbox should be disabled
                        // Room is disabled ONLY if:
                        // 1. It has overlapping reservations (and not already reserved for these exact dates), OR
                        // 2. Selected dates conflict with out-of-order period
                        const isCheckboxDisabled =
                          (hasOverlap && !isReservedForDates) ||
                          isOutOfOrderForSelectedDates;

                        return (
                          <div
                            key={room.id}
                            className={`flex items-center space-x-3 p-3 border rounded-lg ${hasOverlap
                              ? "bg-orange-50 border-orange-200"
                              : isReservedForDates
                                ? "bg-blue-50 border-blue-200"
                                : isOutOfOrderForSelectedDates
                                  ? "bg-red-50 border-red-200"
                                  : !room.isActive
                                    ? "bg-gray-50 border-gray-200"
                                    : "bg-white border-gray-200"
                              }`}
                          >
                            <Checkbox
                              checked={selectedRooms.includes(room.id)}
                              onCheckedChange={(checked) =>
                                handleRoomSelection(room.id, checked as boolean)
                              }
                              disabled={isCheckboxDisabled}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium flex items-center gap-2">
                                Room {room.roomNumber}
                                {hasOverlap && (
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                )}
                                {isOutOfOrderForSelectedDates && (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {room.description}
                              </div>

                              {/* Status Messages */}
                              {hasOverlap && !isReservedForDates && (
                                <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Has overlapping reservations (cannot reserve)
                                </div>
                              )}

                              {isOutOfOrderForSelectedDates && (
                                <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {room.isOutOfOrder ? 'Currently out of order' : 'Scheduled for maintenance'} during selected dates
                                  {room.outOfOrderFrom && room.outOfOrderTo && (
                                    <span>
                                      ({new Date(room.outOfOrderFrom).toLocaleDateString()} - {new Date(room.outOfOrderTo).toLocaleDateString()})
                                    </span>
                                  )}
                                </div>
                              )}

                              {isReservedForDates && (
                                <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Reserved for these dates (uncheck to remove)
                                </div>
                              )}

                              {/* Show inactive but available status */}
                              {!room.isActive && !isOutOfOrderForSelectedDates && !isCheckboxDisabled && (
                                <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Inactive but available for selected dates
                                </div>
                              )}

                              {/* Show current out-of-order status but available for selected dates */}
                              {room.isOutOfOrder && !isOutOfOrderForSelectedDates && !isCheckboxDisabled && (
                                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Available for selected dates (currently out of order for other dates)
                                </div>
                              )}

                              {/* Show scheduled maintenance but available for selected dates */}
                              {!room.isOutOfOrder && room.outOfOrderFrom && new Date(room.outOfOrderFrom) > new Date() && !isOutOfOrderForSelectedDates && !isCheckboxDisabled && (
                                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Available for selected dates (scheduled maintenance for other dates)
                                </div>
                              )}

                              {/* Show if room is fully available */}
                              {room.isActive && !room.isOutOfOrder && !room.outOfOrderFrom && !isCheckboxDisabled && !isReservedForDates && (
                                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Available for reservation
                                </div>
                              )}

                              {/* Upcoming Reservations */}
                              {upcomingReservations.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {upcomingReservations.length} upcoming reservation(s)
                                </div>
                              )}
                            </div>
                            <Badge
                              variant={
                                isOutOfOrderForSelectedDates
                                  ? "destructive"
                                  : room.isOutOfOrder
                                    ? "secondary"
                                    : room.isReserved
                                      ? "secondary"
                                      : !room.isActive
                                        ? "secondary"
                                        : "default"
                              }
                            >
                              {getRoomStatus(room)}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
          <DialogFooter className="shrink-0 pt-4 border-t">
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-muted-foreground">
                <div>{selectedRooms.length} room(s) selected</div>
                <div>
                  {
                    selectedRooms.filter((roomId) => {
                      const room = rooms.find((r: Room) => r.id === roomId);
                      return room && isRoomReservedForDates(room);
                    }).length
                  }{" "}
                  already reserved for these dates
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReserveDialog(false);
                    setSelectedRooms([]);
                    setReserveDates({ from: "", to: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkReserve}
                  disabled={
                    reserveMutation.isPending ||
                    !reserveDates.from ||
                    !reserveDates.to
                  }
                >
                  {reserveMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Updating...
                    </div>
                  ) : (
                    `Save Changes (${selectedRooms.length})`
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={() => setDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete room{" "}
              <strong>{deleteDialog?.roomNumber}</strong>? This action cannot be
              undone and will remove all associated reservations and booking
              history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteDialog!.id)}
              disabled={deleteMutation.isPending}
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {deleteMutation.isPending ? "Deleting..." : "Delete Room"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}