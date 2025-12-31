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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Eye,
  MoreVertical,
  Users,
  DoorOpen,
  Settings,
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
import { format, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  createRoom,
  getRooms,
  getRoomCategories,
  updateRoom,
  deleteRoom,
  reserveRoom,
  getRoomLogs,
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
import { getPakistanDateString, parsePakistanDate } from "@/utils/pakDate";

interface RoomOutOfOrder {
  id?: string;
  reason: string;
  startDate: string;
  endDate: string;
}

interface RoomReservation {
  id: string;
  roomId: string;
  reservedFrom: string;
  reservedTo: string;
  admin: any;
  createdAt: string;
  updatedAt: string;
}

interface RoomBooking {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  memberName: string;
  paymentStatus: string;
  totalPrice: number;
  Membership_No: string;
  numberOfAdults: number;
  numberOfChildren: number;
}

interface Room {
  id: string;
  roomNumber: string;
  roomType: { type: string; priceGuest: number; priceMember: number };
  roomTypeId: string;
  description: string;
  isActive: boolean;
  isReserved: boolean;
  outOfOrders: RoomOutOfOrder[];
  reservations: RoomReservation[];
  bookings: RoomBooking[];
}

export default function Rooms() {
  const { toast } = useToast();
  const fetchLogs = async (roomId: string, range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return;
    setIsLoadingLogs(true);
    try {
      const logs = await getRoomLogs(
        roomId,
        getPakistanDateString(range.from),
        getPakistanDateString(range.to)
      );
      setDetailLogs(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch room logs",
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };


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
    to: getPakistanDateString(new Date()),
  });

  // Room Detail State
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);
  const [detailDateRange, setDetailDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  const [detailLogs, setDetailLogs] = useState<{
    reservations: any[];
    bookings: any[];
    outOfOrders: any[];
  } | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [activeTab, setActiveTab] = useState("reservations");

  // Form state for room
  const [form, setForm] = useState({
    roomNumber: "",
    roomTypeId: "",
    description: "",
    isActive: true,
    outOfOrders: [] as RoomOutOfOrder[],
  });

  // Form state for new out-of-order period
  const [newOutOfOrder, setNewOutOfOrder] = useState<RoomOutOfOrder>({
    reason: "",
    startDate: getPakistanDateString(new Date()),
    endDate: getPakistanDateString(new Date()),
  });

  const [reservationRemarks, setReservationRemarks] = useState("");

  useEffect(() => {
    if (detailRoom && detailDateRange?.from && detailDateRange?.to) {
      fetchLogs(detailRoom.id, detailDateRange);
    }
  }, [detailRoom, detailDateRange]);

  // === FETCH DATA ===
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });
  // console.log(rooms)

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
      remarks,
    }: {
      roomIds: string[];
      reserve: boolean;
      reserveFrom?: string;
      reserveTo?: string;
      remarks?: string;
    }) => reserveRoom(roomIds, reserve, reserveFrom, reserveTo, remarks),
    onSuccess: (data, variables) => {
      const action = variables.reserve ? "reserved" : "unreserved";
      toast({
        title: "Operation Successful",
        description: `Successfully ${action} ${variables.roomIds.length} room(s)`,
      });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setReservationRemarks("");
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
      outOfOrders: [],
    });
    setNewOutOfOrder({
      reason: "",
      startDate: getPakistanDateString(new Date()),
      endDate: getPakistanDateString(new Date()),
    });
  };

  const openEditDialog = (room: Room) => {
    setForm({
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      description: room.description,
      isActive: room.isActive,
      outOfOrders: room.outOfOrders || [],
    });
    setEditRoom(room);
  };

  const handleAddOutOfOrder = () => {
    if (!newOutOfOrder.reason || !newOutOfOrder.startDate || !newOutOfOrder.endDate) {
      toast({
        title: "Missing required fields",
        description: "Please fill in reason, start date, and end date",
        variant: "destructive",
      });
      return;
    }


    const startDate = new Date(newOutOfOrder.startDate);
    const endDate = new Date(newOutOfOrder.endDate);

    if (endDate < startDate) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    const alreadyExists = form.outOfOrders?.some(o => o.startDate === newOutOfOrder.startDate) || form.outOfOrders?.some(o => o.endDate === newOutOfOrder.endDate)

    if (alreadyExists) {
      toast({
        title: "Date Error",
        description: "Cannot Selecting existing dates",
        variant: "destructive",
      });
      return;
    }

    setForm({
      ...form,
      outOfOrders: [...form.outOfOrders, { ...newOutOfOrder }],
    });

    setNewOutOfOrder({
      reason: "",
      startDate: getPakistanDateString(new Date()),
      endDate: getPakistanDateString(new Date()),
    });
  };

  const handleRemoveOutOfOrder = (index: number) => {
    const updatedOutOfOrders = [...form.outOfOrders];
    updatedOutOfOrders.splice(index, 1);
    setForm({ ...form, outOfOrders: updatedOutOfOrders });
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
      outOfOrders: form.outOfOrders,
      ...(editRoom && { id: editRoom.id }),
    };

    if (editRoom) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  // Check if room has any out-of-order period during selected dates
  const isRoomOutOfOrderForDates = (room: Room) => {
    if (!reserveDates.from || !reserveDates.to) return false;

    const selectedFrom = new Date(reserveDates.from);
    const selectedTo = new Date(reserveDates.to);

    return room.outOfOrders.some((oo) => {
      const ooStart = new Date(oo.startDate);
      const ooEnd = new Date(oo.endDate);
      // console.log(oo)
      // Check for overlap
      return selectedFrom <= ooEnd && selectedTo > ooStart;
    });
  };

  // Check if room is currently out of order (any ongoing period)
  const isRoomCurrentlyOutOfOrder = (room: Room) => {
    const now = new Date();
    return room.outOfOrders.some((oo) => {
      const ooStart = new Date(oo.startDate);
      const ooEnd = new Date(oo.endDate);
      return ooStart <= now && ooEnd >= now;
    });
  };

  // Check if room has reservation for the exact selected dates
  const isRoomReservedForDates = (room: Room) => {
    if (!reserveDates.from || !reserveDates.to) return false;

    const selectedFromUTC = new Date(reserveDates.from + 'T00:00:00Z').toISOString();
    const selectedToUTC = new Date(reserveDates.to + 'T00:00:00Z').toISOString();

    return room.reservations.some((reservation) => {
      return reservation.reservedFrom === selectedFromUTC &&
        reservation.reservedTo === selectedToUTC;
    });
  };

  // Check if room has overlapping reservations with selected dates
  const hasOverlappingReservations = (room: Room) => {
    if (!reserveDates.from || !reserveDates.to) return false;

    const selectedFrom = new Date(reserveDates.from + 'T00:00:00Z');
    const selectedTo = new Date(reserveDates.to + 'T00:00:00Z');

    return room.reservations.some((reservation) => {
      const reservationFrom = new Date(reservation.reservedFrom);
      const reservationTo = new Date(reservation.reservedTo);

      // Check for exact match first
      const isExactMatch =
        reservation.reservedFrom === new Date(reserveDates.from + 'T00:00:00Z').toISOString() &&
        reservation.reservedTo === new Date(reserveDates.to + 'T00:00:00Z').toISOString();

      // Check for overlap (excluding exact matches)
      const hasOverlap = selectedFrom < reservationTo && selectedTo > reservationFrom;

      return hasOverlap && !isExactMatch;
    });
  };

  // Handle room selection with reservation cancellation
  const handleRoomSelection = (roomId: string, checked: boolean) => {
    if (checked) {
      setSelectedRooms((prev) => [...prev, roomId]);
    } else {
      setSelectedRooms((prev) => prev.filter((id) => id !== roomId));
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

    const fromDate = new Date(reserveDates.from);
    const toDate = new Date(reserveDates.to);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate >= toDate) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    if (fromDate < today) {
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

    // Check for out-of-order conflicts
    const roomsWithOutOfOrderConflicts = roomsToReserve.filter((roomId) => {
      const room = rooms.find((r: Room) => r.id === roomId);
      return room && isRoomOutOfOrderForDates(room);
    });

    if (roomsWithOverlaps.length > 0) {
      toast({
        title: "Overlapping reservations detected",
        description: `${roomsWithOverlaps.length} room(s) have overlapping reservations that conflict with the selected dates`,
        variant: "destructive",
      });
      return;
    }

    if (roomsWithOutOfOrderConflicts.length > 0) {
      toast({
        title: "Out-of-order conflicts detected",
        description: `${roomsWithOutOfOrderConflicts.length} room(s) are scheduled for maintenance during the selected dates`,
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
    if (roomsToUnreserve.length > 0) {
      reserveMutation.mutate({
        roomIds: roomsToUnreserve,
        reserve: false,
        reserveFrom: reserveDates.from,
        reserveTo: reserveDates.to,
      });
    }

    if (roomsToReserve.length > 0) {
      reserveMutation.mutate({
        roomIds: roomsToReserve,
        reserve: true,
        reserveFrom: reserveDates.from,
        reserveTo: reserveDates.to,
        remarks: reservationRemarks,
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
    const isCurrentlyOutOfOrder = isRoomCurrentlyOutOfOrder(room);
    const hasCurrentBooking = room.bookings?.some(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const now = new Date();
      return now >= checkIn && now <= checkOut;
    });

    // Status filter
    const statusMatch =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE"
        ? room.isActive && !isCurrentlyOutOfOrder && !room.isReserved && !hasCurrentBooking
        : statusFilter === "OUT_OF_ORDER"
          ? isCurrentlyOutOfOrder
          : statusFilter === "RESERVED"
            ? room.isReserved
            : statusFilter === "OCCUPIED"
              ? hasCurrentBooking
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

    // Check if room is currently out of order
    if (isRoomCurrentlyOutOfOrder(room)) {
      return "Out of Order";
    }

    // Check if room has current bookings
    if (room.bookings?.some(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return now >= checkIn && now <= checkOut;
    })) {
      return "Currently Booked";
    }

    if (room.isReserved) return "Currently Reserved";
    if (!room.isActive) return "Inactive";

    // Check for scheduled out-of-order periods
    const hasScheduledOutOfOrder = room.outOfOrders?.some(oo => {
      const ooStart = new Date(oo.startDate + 'T00:00:00Z');
      return ooStart > now;
    });

    if (hasScheduledOutOfOrder) return "Scheduled Maintenance";

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

    if (isRoomCurrentlyOutOfOrder(room)) {
      return "destructive";
    }

    // Check for current bookings
    if (room.bookings?.some(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return now >= checkIn && now <= checkOut;
    })) {
      return "secondary";
    }

    if (room.isReserved) return "secondary";
    if (!room.isActive) return "secondary";

    // Check for scheduled maintenance
    const hasScheduledOutOfOrder = room.outOfOrders?.some(oo => {
      const ooStart = new Date(oo.startDate + 'T00:00:00Z');
      return ooStart > now;
    });

    if (hasScheduledOutOfOrder) return "outline";

    const hasFutureReservations = room.reservations.some(
      (reservation) => new Date(reservation.reservedFrom) > now
    );

    if (hasFutureReservations) return "outline";

    return "default";
  };

  // Get upcoming out-of-order periods
  const getUpcomingOutOfOrders = (room: Room) => {
    const now = new Date();
    return (room.outOfOrders || [])
      .filter((oo) => new Date(oo.endDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
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

  // Get upcoming bookings for a room
  const getUpcomingBookings = (room: Room) => {
    const now = new Date();
    return room.bookings
      ?.filter((booking) => new Date(booking.checkOut) >= now)
      .sort(
        (a, b) =>
          new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
      ) || [];
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Paid</Badge>;
      case "UNPAID":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">Unpaid</Badge>;
      case "HALF_PAID":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">Half Paid</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
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
                        <SelectItem value="OCCUPIED">Currently Occupied</SelectItem>
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
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
                      setForm({ ...form, isActive: v })
                    }
                  />
                </div>

                {/* Out of Order Periods Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Out of Order Periods</Label>
                    <span className="text-sm text-muted-foreground">
                      Add multiple maintenance periods (e.g., Nov 9-10, Dec 9-10)
                    </span>
                  </div>

                  {/* Add new out-of-order period form */}
                  <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                    <h4 className="font-medium">Add New Maintenance Period</h4>
                    <div>
                      <Label>Reason *</Label>
                      <Textarea
                        value={newOutOfOrder.reason}
                        onChange={(e) =>
                          setNewOutOfOrder({ ...newOutOfOrder, reason: e.target.value })
                        }
                        placeholder="Describe the issue (maintenance, renovation, repair, etc.)"
                        className="mt-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maintenance Date Range *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal h-12",
                              !newOutOfOrder.startDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {newOutOfOrder.startDate ? (
                              newOutOfOrder.endDate && newOutOfOrder.endDate !== newOutOfOrder.startDate ? (
                                <>
                                  {format(parsePakistanDate(newOutOfOrder.startDate), "LLL dd, y")} -{" "}
                                  {format(parsePakistanDate(newOutOfOrder.endDate), "LLL dd, y")}
                                </>
                              ) : (
                                format(parsePakistanDate(newOutOfOrder.startDate), "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={parsePakistanDate(newOutOfOrder.startDate)}
                            selected={{
                              from: parsePakistanDate(newOutOfOrder.startDate),
                              to: parsePakistanDate(newOutOfOrder.endDate),
                            }}
                            onSelect={(range: DateRange | undefined) => {
                              if (range?.from) {
                                setNewOutOfOrder((prev) => ({
                                  ...prev,
                                  startDate: getPakistanDateString(range.from),
                                  endDate: range.to ? getPakistanDateString(range.to) : getPakistanDateString(range.from),
                                }));
                              }
                            }}
                            modifiers={{
                              today: new Date(),
                            }}
                            modifiersClassNames={{
                              today: "border-2 border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary",
                            }}
                            classNames={{
                              day_today: "border-2 border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary",
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddOutOfOrder}
                      className="w-full"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Maintenance Period
                    </Button>
                  </div>

                  {/* List of added out-of-order periods */}
                  {form.outOfOrders.length > 0 && (
                    <div className="space-y-2">
                      <Label>Added Maintenance Periods ({form.outOfOrders.length})</Label>
                      {form.outOfOrders.map((oo, index) => (
                        <div key={index} className="p-3 border rounded-lg flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              {formatDate(oo.startDate)} - {formatDate(oo.endDate)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {oo.reason}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOutOfOrder(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                  statusFilter === "RESERVED" ? "Currently Reserved" :
                    statusFilter === "OCCUPIED" ? "Currently Occupied" : "Inactive"}
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
                  <TableHead>Maintenance Periods</TableHead>
                  <TableHead>Reservations</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms?.map((room: Room) => {
                  const upcomingOutOfOrders = getUpcomingOutOfOrders(room);
                  const upcomingReservations = getUpcomingReservations(room);
                  const upcomingBookings = getUpcomingBookings(room);
                  const isCurrentlyOccupied = room.bookings?.some(booking => {
                    const checkIn = new Date(booking.checkIn);
                    const checkOut = new Date(booking.checkOut);
                    const now = new Date();
                    return now >= checkIn && now <= checkOut;
                  });

                  return (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {room.roomNumber}
                          {isCurrentlyOccupied && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              Occupied
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {room.roomType?.type}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Member: PKR {room.roomType?.priceMember.toLocaleString()} | Guest:
                            PKR {room.roomType?.priceGuest.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={getRoomStatusVariant(room)}>
                            {getRoomStatus(room)}
                          </Badge>

                          {/* Show current out-of-order status */}
                          {isRoomCurrentlyOutOfOrder(room) && (
                            <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                              Currently under maintenance
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {upcomingOutOfOrders.length > 0 ? (
                          <div className="space-y-2">
                            {upcomingOutOfOrders
                              .slice(0, 2)
                              .map((oo, index) => (
                                <div key={index} className="text-xs border-l-2 border-red-400 pl-2">
                                  <div className="font-medium text-red-700">
                                    Maintenance
                                  </div>
                                  <div className="text-muted-foreground">
                                    {formatDate(oo.startDate)} - {formatDate(oo.endDate)}
                                  </div>
                                  <div className="text-red-600 truncate">
                                    {oo.reason.length > 20 ? `${oo.reason.substring(0, 20)}...` : oo.reason}
                                  </div>
                                </div>
                              ))}
                            {upcomingOutOfOrders.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{upcomingOutOfOrders.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No scheduled maintenance
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {upcomingReservations.length > 0 ? (
                          <div className="space-y-2">
                            {upcomingReservations
                              .slice(0, 2)
                              .map((reservation) => (
                                <div key={reservation.id} className="text-xs border-l-2 border-orange-400 pl-2">
                                  <div className="font-medium text-orange-700">
                                    {reservation.admin.name}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {formatDate(reservation.reservedFrom)} - {formatDate(reservation.reservedTo)}
                                  </div>
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
                      <TableCell>
                        {upcomingBookings.length > 0 ? (
                          <div className="space-y-2">
                            {upcomingBookings
                              .slice(0, 2)
                              .map((booking) => (
                                <div key={booking.id} className="text-xs border-l-2 border-blue-400 pl-2">
                                  <div className="font-medium">
                                    Member {booking.Membership_No}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                                  </div>
                                  <div className="mt-1">
                                    {getPaymentStatusBadge(booking.paymentStatus)}
                                  </div>
                                  {booking.totalPrice && (
                                    <div className="text-xs text-muted-foreground">
                                      PKR {booking.totalPrice.toLocaleString()}
                                    </div>
                                  )}
                                  {(booking.numberOfAdults > 0 || booking.numberOfChildren > 0) && (
                                    <div className="text-xs text-muted-foreground">
                                      {booking.numberOfAdults} adult(s){booking.numberOfChildren > 0 ? `, ${booking.numberOfChildren} child(ren)` : ''}
                                    </div>
                                  )}
                                </div>
                              ))}
                            {upcomingBookings.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{upcomingBookings.length - 2} more
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
                            onClick={() => {
                              setDetailRoom(room);
                              setDetailDateRange({
                                from: new Date(),
                                to: addDays(new Date(), 30),
                              });
                            }}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Edit Dialog - Similar to Add Dialog but with existing out-of-order periods */}
      <Dialog open={!!editRoom} onOpenChange={() => setEditRoom(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                  setForm({ ...form, isActive: v })
                }
              />
            </div>

            {/* Out of Order Periods Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Out of Order Periods</Label>
                <span className="text-sm text-muted-foreground">
                  Add multiple maintenance periods (e.g., Nov 9-10, Dec 9-10)
                </span>
              </div>

              {/* Add new out-of-order period form */}
              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <h4 className="font-medium">Add New Maintenance Period</h4>
                <div>
                  <Label>Reason *</Label>
                  <Textarea
                    value={newOutOfOrder.reason}
                    onChange={(e) =>
                      setNewOutOfOrder({ ...newOutOfOrder, reason: e.target.value })
                    }
                    placeholder="Describe the issue (maintenance, renovation, repair, etc.)"
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maintenance Date Range *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-12",
                          !newOutOfOrder.startDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {newOutOfOrder.startDate ? (
                          newOutOfOrder.endDate && newOutOfOrder.endDate !== newOutOfOrder.startDate ? (
                            <>
                              {format(parsePakistanDate(newOutOfOrder.startDate), "LLL dd, y")} -{" "}
                              {format(parsePakistanDate(newOutOfOrder.endDate), "LLL dd, y")}
                            </>
                          ) : (
                            format(parsePakistanDate(newOutOfOrder.startDate), "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={parsePakistanDate(newOutOfOrder.startDate)}
                        selected={{
                          from: parsePakistanDate(newOutOfOrder.startDate),
                          to: parsePakistanDate(newOutOfOrder.endDate),
                        }}
                        onSelect={(range: DateRange | undefined) => {
                          if (range?.from) {
                            setNewOutOfOrder((prev) => ({
                              ...prev,
                              startDate: getPakistanDateString(range.from),
                              endDate: range.to ? getPakistanDateString(range.to) : getPakistanDateString(range.from),
                            }));
                          }
                        }}
                        modifiers={{
                          today: new Date(),
                        }}
                        modifiersClassNames={{
                          today: "border-2 border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary",
                        }}
                        classNames={{
                          day_today: "border-2 border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary",
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  type="button"
                  onClick={handleAddOutOfOrder}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Maintenance Period
                </Button>
              </div>

              {/* List of added out-of-order periods */}
              {form.outOfOrders.length > 0 && (
                <div className="space-y-2">
                  <Label>Maintenance Periods ({form.outOfOrders.length})</Label>
                  {form.outOfOrders.map((oo, index) => (
                    <div key={index} className="p-3 border rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {formatDate(oo.startDate)} - {formatDate(oo.endDate)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {oo.reason}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOutOfOrder(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <Label>Reservation Date Range *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !reserveDates.from && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {reserveDates?.from ? (
                      reserveDates.to && reserveDates.to !== reserveDates.from ? (
                        <>
                          {format(parsePakistanDate(reserveDates.from), "LLL dd, y")} -{" "}
                          {format(parsePakistanDate(reserveDates.to), "LLL dd, y")}
                        </>
                      ) : (
                        format(parsePakistanDate(reserveDates.from), "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={parsePakistanDate(reserveDates.from)}
                    selected={{
                      from: parsePakistanDate(reserveDates.from),
                      to: parsePakistanDate(reserveDates.to),
                    }}
                    onSelect={(range: DateRange | undefined) => {
                      if (range?.from) {
                        setReserveDates({
                          from: getPakistanDateString(range.from),
                          to: range.to ? getPakistanDateString(range.to) : getPakistanDateString(range.from),
                        });
                      }
                    }}
                    numberOfMonths={2}
                    modifiers={{
                      today: new Date(),
                    }}
                    modifiersClassNames={{
                      today: "border-2 border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary",
                    }}
                    classNames={{
                      day_today: "border-2 border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary",
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="px-4 py-2 space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reservation Remarks (Optional)</Label>
              <Textarea
                placeholder="Add any additional notes for this reservation..."
                value={reservationRemarks}
                onChange={(e) => setReservationRemarks(e.target.value)}
                className="resize-none min-h-[80px] bg-muted/30 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
              />
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
                        const isOutOfOrderForSelectedDates = isRoomOutOfOrderForDates(room);

                        // Disable checkbox if:
                        // 1. It has overlapping reservations (and not already reserved for these exact dates), OR
                        // 2. Selected dates conflict with any out-of-order period
                        const isCheckboxDisabled =
                          (hasOverlap && !isReservedForDates) ||
                          isOutOfOrderForSelectedDates;

                        return (
                          <div
                            key={room.id}
                            className={`flex items-center space-x-3 p-3 border rounded-lg ${hasOverlap && !isReservedForDates
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
                                {hasOverlap && !isReservedForDates && (
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
                                  Scheduled for maintenance during selected dates
                                </div>
                              )}

                              {isReservedForDates && (
                                <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Reserved for these dates (uncheck to remove)
                                </div>
                              )}

                              {/* Show upcoming maintenance periods */}
                              {room.outOfOrders && room.outOfOrders.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {room.outOfOrders.length} maintenance period(s)
                                </div>
                              )}
                            </div>
                            <Badge
                              variant={
                                isOutOfOrderForSelectedDates
                                  ? "destructive"
                                  : isRoomCurrentlyOutOfOrder(room)
                                    ? "destructive"
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
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{selectedRooms.length} room(s) selected</div>
                <div className="flex gap-4">
                  <span className="text-blue-600">
                    {selectedRooms.filter((roomId) => {
                      const room = rooms.find((r: Room) => r.id === roomId);
                      return room && isRoomReservedForDates(room);
                    }).length} already reserved (will keep)
                  </span>
                  <span className="text-green-600">
                    {selectedRooms.filter((roomId) => {
                      const room = rooms.find((r: Room) => r.id === roomId);
                      return room && !isRoomReservedForDates(room);
                    }).length} to be reserved
                  </span>
                  <span className="text-orange-600">
                    {rooms.filter((room: Room) =>
                      isRoomReservedForDates(room) && !selectedRooms.includes(room.id)
                    ).length} to be unreserved
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReserveDialog(false);
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
                    `Save Changes`
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
              undone and will remove all associated reservations, bookings, and
              maintenance records.
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

      {/* Room Detail Dialog */}
      <Dialog
        open={!!detailRoom}
        onOpenChange={(open) => {
          if (!open) {
            setDetailRoom(null);
            setDetailLogs(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  Room {detailRoom?.roomNumber}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-normal border-primary/20 bg-primary/5 text-primary">
                    {detailRoom?.roomType?.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ID: {detailRoom?.id}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{detailRoom?.description}</span>
              </div>
              <Badge
                variant={detailRoom?.isActive ? "default" : "secondary"}
                className={cn(
                  "px-3 py-1",
                  detailRoom?.isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : "bg-red-100 text-red-700 hover:bg-red-100"
                )}
              >
                {detailRoom?.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-2">
            <Card className="p-3 bg-muted/20 border border-border/50 shadow-none transition-all hover:bg-muted/30 text-left">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-md">
                  <Users className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                    Member Price
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    Rs. {Number(detailRoom?.roomType?.priceMember || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-muted/20 border border-border/50 shadow-none transition-all hover:bg-muted/30 text-left">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-md">
                  <Users className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                    Guest Price
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    Rs. {Number(detailRoom?.roomType?.priceGuest || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-muted/20 border border-border/50 shadow-none transition-all hover:bg-muted/30 text-left overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-md shrink-0">
                  <Info className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight whitespace-nowrap">
                    Description
                  </p>
                  <p className="text-xs truncate text-slate-600">
                    {detailRoom?.description || "No description provided."}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Small Overview Totals */}
          <div className="flex items-center gap-4 py-2 border-y border-border/40">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="text-[11px] font-medium text-slate-500">
                Reservations: <span className="text-slate-900">{detailLogs?.reservations?.length || 0}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 border-l pl-4 border-border/40">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="text-[11px] font-medium text-slate-500">
                Bookings: <span className="text-slate-900">{detailLogs?.bookings?.length || 0}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 border-l pl-4 border-border/40">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="text-[11px] font-medium text-slate-500">
                Maintenance: <span className="text-slate-900">{detailLogs?.outOfOrders?.length || 0}</span>
              </span>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                Activity Logs
                {isLoadingLogs && <div className="h-3 w-3 animate-spin rounded-full border border-slate-400 border-t-transparent" />}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Filter Logs:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal h-9",
                        !detailDateRange && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {detailDateRange?.from ? (
                        detailDateRange.to ? (
                          detailDateRange.from.getTime() ===
                            detailDateRange.to.getTime() ? (
                            format(detailDateRange.from, "LLL dd, y")
                          ) : (
                            <>
                              {format(detailDateRange.from, "LLL dd, y")} -{" "}
                              {format(detailDateRange.to, "LLL dd, y")}
                            </>
                          )
                        ) : (
                          format(detailDateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={detailDateRange?.from}
                      selected={detailDateRange}
                      onSelect={setDetailDateRange}
                      numberOfMonths={2}
                      classNames={{
                        day_today: "border-2 border-primary text-primary bg-transparent font-bold",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 h-9 p-1 bg-slate-100 rounded-md">
                <TabsTrigger value="reservations" className="text-[11px] rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border border-slate-200">
                  Reservations ({detailLogs?.reservations?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="bookings" className="text-[11px] rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border border-slate-200">
                  Bookings ({detailLogs?.bookings?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="text-[11px] rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border border-slate-200">
                  Maintenance ({detailLogs?.outOfOrders?.length || 0})
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 min-h-[300px]">
                {isLoadingLogs ? (
                  <div className="flex flex-col items-center justify-center h-[300px] gap-2 text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
                    <p className="text-[11px] font-medium">Loading history...</p>
                  </div>
                ) : (
                  <>
                    <TabsContent value="reservations" className="mt-0 outline-none">
                      <div className="border border-slate-100 rounded-lg overflow-hidden bg-white">
                        <Table>
                          <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                              <TableHead className="text-[11px] h-9 text-slate-500">Reserved From</TableHead>
                              <TableHead className="text-[11px] h-9 text-slate-500">Reserved To</TableHead>
                              <TableHead className="text-[11px] h-9 text-slate-500">Reserved By</TableHead>
                              <TableHead className="text-[11px] h-9 text-slate-500">Remarks</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detailLogs?.reservations?.length ? (
                              detailLogs.reservations.map((res: any) => (
                                <TableRow key={res.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                  <TableCell className="text-xs py-2 text-slate-600">
                                    {format(new Date(res.reservedFrom), "LLL dd, y")}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 text-slate-600">
                                    {format(new Date(res.reservedTo), "LLL dd, y")}
                                  </TableCell>
                                  <TableCell className="text-xs py-2">
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                        {res.admin?.name?.substring(0, 1).toUpperCase()}
                                      </div>
                                      {res.admin?.name}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-[10px] py-2 text-slate-500 max-w-[150px] truncate" title={res.remarks}>
                                    {res.remarks || "-"}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center py-10 text-slate-400"
                                >
                                  <div className="flex flex-col items-center gap-1.5">
                                    <Calendar className="h-6 w-6 opacity-10" />
                                    <p className="text-[11px]">No reservations found.</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="bookings" className="mt-0 outline-none">
                      <div className="border border-slate-100 rounded-lg overflow-hidden bg-white">
                        <Table>
                          <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                              <TableHead className="text-[11px] h-9 text-slate-500">Member</TableHead>
                              <TableHead className="text-[11px] h-9 text-slate-500">Check-In</TableHead>
                              <TableHead className="text-[11px] h-9 text-slate-500">Check-Out</TableHead>
                              <TableHead className="text-[11px] h-9 text-slate-500">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detailLogs?.bookings?.length ? (
                              detailLogs.bookings.map((book: any) => (
                                <TableRow key={book.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                  <TableCell className="py-2">
                                    <div>
                                      <p className="font-semibold text-xs text-slate-700">
                                        {book.member?.Name}
                                      </p>
                                      <p className="text-[10px] text-slate-400">
                                        {book.member?.Membership_No}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-xs py-2 text-slate-600">
                                    {format(new Date(book.checkIn), "LLL dd, y")}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 text-slate-600">
                                    {format(new Date(book.checkOut), "LLL dd, y")}
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "capitalize text-[9px] font-semibold px-2 py-0 h-4 bg-slate-100 text-slate-600 border-none shadow-none"
                                      )}
                                    >
                                      {book.paymentStatus.toLowerCase()}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center py-10 text-slate-400"
                                >
                                  <div className="flex flex-col items-center gap-1.5">
                                    <DoorOpen className="h-6 w-6 opacity-10" />
                                    <p className="text-[11px]">No bookings found.</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="maintenance" className="mt-0 outline-none">
                      <div className="border border-slate-100 rounded-lg overflow-hidden bg-white">
                        <Table>
                          <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                              <TableHead className="text-[11px] h-9 text-slate-500">Date Range</TableHead>
                              <TableHead className="text-[11px] h-9 text-slate-500">Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detailLogs?.outOfOrders?.length ? (
                              detailLogs.outOfOrders.map((oo: any) => (
                                <TableRow key={oo.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                  <TableCell className="text-xs py-2 text-slate-600">
                                    {format(new Date(oo.startDate), "LLL dd, y")} -{" "}
                                    {format(new Date(oo.endDate), "LLL dd, y")}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                      <Settings className="h-3 w-3 text-slate-300" />
                                      {oo.reason}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={2}
                                  className="text-center py-10 text-slate-400"
                                >
                                  <div className="flex flex-col items-center gap-1.5">
                                    <Settings className="h-6 w-6 opacity-10" />
                                    <p className="text-[11px]">No maintenance records.</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}