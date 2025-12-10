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
  FileDown,
  Calendar,
  Clock,
  Info,
  Filter,
  AlertCircle,
  Sun,
  Moon,
  Sunset,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { exportHallsReport } from "@/lib/pdfExport";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createHall as createHallApi,
  updateHall as updateHallApi,
  getHalls,
  deleteHall as deleteHallApi,
  reserveHall,
} from "../../config/apis";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { isSameDay } from "date-fns";

interface HallReservation {
  id: string;
  hallId: string;
  reservedFrom: string;
  reservedTo: string;
  timeSlot: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HallBooking {
  id: string;
  hallId: string;
  bookingDate: string;
  eventDate: string;
  memberName: string;
  guestName?: string;
  paymentStatus: string;
  totalPrice: number;
  numberOfGuests: number;
  eventType: string;
  specialRequests?: string;
}

interface OutOfOrderPeriod {
  id?: string;
  reason: string;
  startDate: string;
  endDate: string;
  hallId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Hall {
  id: string;
  name: string;
  capacity: number;
  chargesMembers: number;
  chargesGuests: number;
  description: string;
  isActive: boolean;
  outOfOrders?: OutOfOrderPeriod[];
  isReserved: boolean;
  isBooked: boolean;
  reservations: HallReservation[];
  bookings: HallBooking[];
  images: any[];
  // Legacy fields (kept for compatibility)
  isOutOfService?: boolean;
  outOfServiceReason?: string;
  outOfServiceFrom?: string;
  outOfServiceTo?: string;
}

export default function Halls() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editHall, setEditHall] = useState<any>(null);
  const [deleteHallData, setDeleteHallData] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reserveDialog, setReserveDialog] = useState(false);
  const [selectedHalls, setSelectedHalls] = useState<string[]>([]);
  const [reserveDates, setReserveDates] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("MORNING");

  const [newOutOfOrder, setNewOutOfOrder] = useState({
    reason: "",
    startDate: "",
    endDate: "",
  });

  const [editNewOutOfOrder, setEditNewOutOfOrder] = useState({
    reason: "",
    startDate: "",
    endDate: "",
  });

  // Add Form State
  const [form, setForm] = useState({
    name: "",
    capacity: "",
    chargesMembers: "",
    chargesGuests: "",
    description: "",
    isActive: true,
    outOfOrders: [] as OutOfOrderPeriod[],
    images: [] as File[],
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    capacity: "",
    chargesMembers: "",
    chargesGuests: "",
    description: "",
    isActive: true,
    outOfOrders: [] as OutOfOrderPeriod[],
    existingImages: [] as string[],
    newImages: [] as File[],
  });

  const { data: halls = [], isLoading } = useQuery<any[]>({
    queryKey: ["halls"],
    queryFn: getHalls,
  });

  const createMutation = useMutation({
    mutationFn: createHallApi,
    onSuccess: () => {
      toast({ title: "Hall created successfully" });
      queryClient.invalidateQueries({ queryKey: ["halls"] });
      setIsAddOpen(false);
      resetAddForm();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.cause || error.message || "Failed to create hall";
      toast({
        title: "Failed to create hall",
        description: errorMessage,
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateHallApi,
    onSuccess: () => {
      toast({ title: "Hall updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["halls"] });
      setEditHall(null);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.cause || error.message || "Failed to update hall";
      toast({
        title: "Failed to update hall",
        description: errorMessage,
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHallApi,
    onSuccess: () => {
      toast({ title: "Hall deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["halls"] });
      setDeleteHallData(null);
    },
    onError: () =>
      toast({ title: "Failed to delete hall", variant: "destructive" }),
  });

  const reserveMutation = useMutation({
    mutationFn: ({
      hallIds,
      reserve,
      reserveFrom,
      reserveTo,
      timeSlot,
    }: {
      hallIds: string[];
      reserve: boolean;
      reserveFrom?: string;
      reserveTo?: string;
      timeSlot?: string;
    }) => reserveHall(hallIds, reserve, timeSlot, reserveFrom, reserveTo),
    onSuccess: (data) => {
      toast({
        title: "Reservations updated successfully",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["halls"] });
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

  // Add out of order handlers
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
      outOfOrders: [...prev.outOfOrders, { ...newOutOfOrder }]
    }));

    // Reset new form
    setNewOutOfOrder({
      reason: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleRemoveOutOfOrder = (index: number) => {
    setForm(prev => ({
      ...prev,
      outOfOrders: prev.outOfOrders.filter((_, i) => i !== index)
    }));
  };

  // Edit out of order handlers
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
      outOfOrders: [...prev.outOfOrders, { ...editNewOutOfOrder }]
    }));

    // Reset new form
    setEditNewOutOfOrder({
      reason: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleRemoveEditOutOfOrder = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      outOfOrders: prev.outOfOrders.filter((_, i) => i !== index)
    }));
  };

  // Get time slot icon
  const getTimeSlotIcon = (timeSlot: string) => {
    switch (timeSlot) {
      case "MORNING":
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case "EVENING":
        return <Sunset className="h-4 w-4 text-orange-500" />;
      case "NIGHT":
        return <Moon className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get time slot display name
  const getTimeSlotDisplay = (timeSlot: string) => {
    switch (timeSlot) {
      case "MORNING":
        return "Morning (8:00 AM - 2:00 PM)";
      case "EVENING":
        return "Evening (2:00 PM - 8:00 PM)";
      case "NIGHT":
        return "Night (8:00 PM - 12:00 AM)";
      default:
        return timeSlot;
    }
  };

  // Check if hall has current booking
  const hasCurrentBooking = (hall: Hall) => {
    const now = new Date();
    return hall.bookings?.some(booking => {
      const eventDate = new Date(booking.eventDate);
      return isSameDay(eventDate, now);
    });
  };

  const hasOverlappingReservations = (hall: Hall) => {
    if (!reserveDates.from || !reserveDates.to || !selectedTimeSlot) return false;

    const selectedFrom = new Date(reserveDates.from);
    const selectedTo = new Date(reserveDates.to);

    // Normalize dates to compare only the date part
    selectedFrom.setHours(0, 0, 0, 0);
    selectedTo.setHours(0, 0, 0, 0);

    return hall.reservations?.some((reservation) => {
      const reservationFrom = new Date(reservation.reservedFrom);
      const reservationTo = new Date(reservation.reservedTo);

      // Normalize reservation dates
      reservationFrom.setHours(0, 0, 0, 0);
      reservationTo.setHours(0, 0, 0, 0);

      // Must be the same time slot to be a conflict
      const isSameTimeSlot = reservation.timeSlot === selectedTimeSlot;
      if (!isSameTimeSlot) return false;

      // Check for date overlap (inclusive of start/end dates)
      const hasDateOverlap =
        selectedFrom <= reservationTo &&
        selectedTo >= reservationFrom;

      if (!hasDateOverlap) return false;

      // Check if it's an exact match (same dates AND same time slot)
      const isExactMatch =
        reservationFrom.getTime() === selectedFrom.getTime() &&
        reservationTo.getTime() === selectedTo.getTime() &&
        reservation.timeSlot === selectedTimeSlot;

      // It's a conflict only if dates overlap with same time slot but NOT an exact match
      return !isExactMatch;
    });
  };

  const isHallReservedForDates = (hall: Hall) => {
    if (!reserveDates.from || !reserveDates.to || !selectedTimeSlot) return false;

    const selectedFrom = new Date(reserveDates.from);
    const selectedTo = new Date(reserveDates.to);

    // Normalize dates to compare only the date part (ignore time)
    selectedFrom.setHours(0, 0, 0, 0);
    selectedTo.setHours(0, 0, 0, 0);

    return hall.reservations?.some((reservation) => {
      const reservationFrom = new Date(reservation.reservedFrom);
      const reservationTo = new Date(reservation.reservedTo);

      // Normalize reservation dates to compare only the date part
      reservationFrom.setHours(0, 0, 0, 0);
      reservationTo.setHours(0, 0, 0, 0);

      // Check for exact match: same dates AND same time slot
      const isExactMatch =
        reservationFrom.getTime() === selectedFrom.getTime() &&
        reservationTo.getTime() === selectedTo.getTime() &&
        reservation.timeSlot === selectedTimeSlot;

      return isExactMatch;
    });
  };

  // Handle hall selection with reservation cancellation
  const handleHallSelection = (hallId: string, checked: boolean) => {
    const hall = halls.find((h: Hall) => h.id === hallId);
    const isCurrentlyReserved = hall && isHallReservedForDates(hall);

    if (checked) {
      setSelectedHalls((prev) => [...prev, hallId]);
    } else {
      setSelectedHalls((prev) => prev.filter((id) => id !== hallId));

      if (isCurrentlyReserved && reserveDates.from && reserveDates.to && selectedTimeSlot) {
        const fromDate = new Date(reserveDates.from);
        const toDate = new Date(reserveDates.to);
        const today = new Date();

        if (fromDate < toDate) {
          reserveMutation.mutate({
            hallIds: [hallId],
            reserve: false,
            reserveFrom: reserveDates.from,
            reserveTo: reserveDates.to,
            timeSlot: selectedTimeSlot,
          });
        } else {
          toast({
            title: "Cannot remove reservation",
            description: "Selected dates are invalid",
            variant: "destructive",
          });
          setSelectedHalls((prev) => [...prev, hallId]);
        }
      }
    }
  };

  // Bulk reserve function
  const handleBulkReserve = () => {
    if (!reserveDates.from || !reserveDates.to || !selectedTimeSlot) {
      toast({
        title: "Missing information",
        description: "Please select both start/end dates and a time slot",
        variant: "destructive",
      });
      return;
    }

    const fromDate = new Date(reserveDates.from);
    const toDate = new Date(reserveDates.to);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate > toDate) {
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

    // Get halls that are currently reserved for the exact dates and time slot
    const currentlyReservedHallIds = halls
      .filter((hall: Hall) => isHallReservedForDates(hall))
      .map((hall) => hall.id);

    // Halls to reserve: selected but not currently reserved
    const hallsToReserve = selectedHalls.filter(
      (hallId) => !currentlyReservedHallIds.includes(hallId)
    );

    // Halls to unreserve: currently reserved but not selected
    const hallsToUnreserve = currentlyReservedHallIds.filter(
      (hallId) => !selectedHalls.includes(hallId)
    );

    // Check for overlapping reservations only for NEW reservations
    const hallsWithOverlaps = hallsToReserve.filter((hallId) => {
      const hall = halls.find((h: Hall) => h.id === hallId);
      return hall && hasOverlappingReservations(hall);
    });

    if (hallsWithOverlaps.length > 0) {
      toast({
        title: "Overlapping reservations detected",
        description: `${hallsWithOverlaps.length} hall(s) have overlapping reservations that conflict with the selected dates and time slot`,
        variant: "destructive",
      });
      return;
    }

    if (hallsToReserve.length === 0 && hallsToUnreserve.length === 0) {
      toast({
        title: "No changes to make",
        description: "The selected halls already match the current reservation status",
        variant: "default",
      });
      return;
    }

    // Process reservations and unreservations
    if (hallsToReserve.length > 0) {
      reserveMutation.mutate({
        hallIds: hallsToReserve,
        reserve: true,
        reserveFrom: reserveDates.from,
        reserveTo: reserveDates.to,
        timeSlot: selectedTimeSlot,
      });
    }

    if (hallsToUnreserve.length > 0) {
      reserveMutation.mutate({
        hallIds: hallsToUnreserve,
        reserve: false,
        reserveFrom: reserveDates.from,
        reserveTo: reserveDates.to,
        timeSlot: selectedTimeSlot,
      });
    }
  };

  // Validate form before submission
  const validateForm = (formData: any, isEdit: boolean = false) => {
    if (!formData.name || !formData.capacity) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return false;
    }

    console.log(formData)

    // Validate out of order periods
    for (const period of formData.outOfOrders) {
      if (!period.reason.trim()) {
        toast({
          title: "Reason required",
          description: "Please provide a reason for each maintenance period",
          variant: "destructive"
        });
        return false;
      }
      console.log(period)
      const alreadyExists = period.startDate === newOutOfOrder.startDate && period.endDate === newOutOfOrder.endDate

      if (alreadyExists) {
        toast({
          title: "Date Error",
          description: "Cannot Selecting existing dates",
          variant: "destructive",
        });
        return;
      }

      if (new Date(period.startDate) > new Date(period.endDate)) {
        toast({
          title: "Invalid date range",
          description: "End date must be after start date for all maintenance periods",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  // Handle create hall function
  const handleCreateHall = () => {
    if (!validateForm(form)) return;

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("capacity", form.capacity);
    fd.append("chargesMembers", form.chargesMembers || "0");
    fd.append("chargesGuests", form.chargesGuests || "0");
    fd.append("description", form.description);
    fd.append("isActive", String(form.isActive));

    // Add out of order periods if any
    if (form.outOfOrders.length > 0) {
      fd.append("outOfOrders", JSON.stringify(form.outOfOrders));
    }

    form.images.forEach((file) => fd.append("files", file));
    createMutation.mutate(fd);
  };

  const filteredHalls = halls?.filter((hall: Hall) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "ACTIVE") return hall.isActive && !isCurrentlyOutOfOrder(hall) && !hall.isReserved;
    if (statusFilter === "INACTIVE")
      return !hall.isActive || isCurrentlyOutOfOrder(hall) || hall.isReserved;
    return true;
  });

  const resetAddForm = () => {
    setForm({
      name: "",
      capacity: "",
      chargesMembers: "",
      chargesGuests: "",
      description: "",
      isActive: true,
      outOfOrders: [],
      images: [],
    });
    setNewOutOfOrder({
      reason: "",
      startDate: "",
      endDate: "",
    });
  };

  useEffect(() => {
    if (editHall) {
      const outOfOrders = editHall.outOfOrders?.map((period: any) => ({
        id: period.id,
        reason: period.reason,
        startDate: period.startDate?.split("T")[0] || "",
        endDate: period.endDate?.split("T")[0] || "",
      })) || [];

      setEditForm({
        name: editHall.name || "",
        capacity: editHall.capacity || "",
        chargesMembers: editHall.chargesMembers || "",
        chargesGuests: editHall.chargesGuests || "",
        description: editHall.description || "",
        isActive: editHall.isActive || false,
        outOfOrders: outOfOrders,
        existingImages:
          editHall.images?.map((img: any) => img.publicId || img.url || img) ||
          [],
        newImages: [],
      });
    }
  }, [editHall]);

  // Auto-select halls that are already reserved for the selected dates and time slot
  useEffect(() => {
    if (reserveDates.from && reserveDates.to && selectedTimeSlot) {
      const hallsReservedForDates = halls.filter((hall: Hall) =>
        isHallReservedForDates(hall)
      );
      const reservedHallIds = hallsReservedForDates.map((hall) => hall.id);
      setSelectedHalls(reservedHallIds);
    } else {
      setSelectedHalls([]);
    }
  }, [reserveDates.from, reserveDates.to, selectedTimeSlot, halls]);

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

  // Get upcoming bookings for a hall
  const getUpcomingBookings = (hall: Hall) => {
    const now = new Date();
    return hall.bookings
      ?.filter((booking) => new Date(booking.bookingDate) >= now)
      .sort(
        (a, b) =>
          new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
      ) || [];
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleUpdateHall = () => {
    if (!editHall) return;
    if (!validateForm(editForm, true)) return;

    const fd = new FormData();
    fd.append("id", String(editHall.id));
    fd.append("name", editForm.name);
    fd.append("capacity", editForm.capacity);
    fd.append("chargesMembers", editForm.chargesMembers);
    fd.append("chargesGuests", editForm.chargesGuests);
    fd.append("description", editForm.description);
    fd.append("isActive", String(editForm.isActive));

    // Add out of order periods if any
    if (editForm.outOfOrders.length > 0) {
      fd.append("outOfOrders", JSON.stringify(editForm.outOfOrders));
    }

    editForm.existingImages.forEach((pid) => fd.append("existingimgs", pid));
    editForm.newImages.forEach((file) => fd.append("files", file));
    updateMutation.mutate(fd);
  };

  const handleDeleteHall = () => {
    if (deleteHallData) deleteMutation.mutate(deleteHallData.id);
  };

  // Helper functions for out-of-order periods
  const isCurrentlyOutOfOrder = (hall: Hall) => {
    const now = new Date();
    return hall.outOfOrders?.some(period => {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      return startDate <= now && endDate >= now;
    });
  };

  const hasScheduledMaintenance = (hall: Hall) => {
    const now = new Date();
    return hall.outOfOrders?.some(period => {
      const startDate = new Date(period.startDate);
      return startDate > now;
    });
  };

  // Get hall status for display
  const getHallStatus = (hall: Hall) => {
    const now = new Date();

    if (isCurrentlyOutOfOrder(hall)) {
      return "Out of Order";
    }

    if (hasScheduledMaintenance(hall)) {
      return "Scheduled Maintenance";
    }

    if (hasCurrentBooking(hall)) {
      return "Currently Booked";
    }

    if (hall.isReserved) return "Currently Reserved";
    if (!hall.isActive) return "Inactive";

    const hasFutureReservations = hall.reservations?.some(
      (reservation) => new Date(reservation.reservedFrom) > now
    );

    if (hasFutureReservations) return "Scheduled";

    return "Available";
  };

  // Get hall status badge variant
  const getHallStatusVariant = (hall: Hall) => {
    const now = new Date();

    if (isCurrentlyOutOfOrder(hall)) {
      return "destructive";
    }

    if (hasScheduledMaintenance(hall)) {
      return "outline";
    }

    if (hasCurrentBooking(hall)) return "secondary";

    if (hall.isReserved) return "secondary";
    if (!hall.isActive) return "secondary";

    const hasFutureReservations = hall.reservations?.some(
      (reservation) => new Date(reservation.reservedFrom) > now
    );

    if (hasFutureReservations) return "outline";

    return "default";
  };

  // Get upcoming reservations for a hall
  const getUpcomingReservations = (hall: Hall) => {
    const now = new Date();
    return hall.reservations?.filter((reservation) => new Date(reservation.reservedTo) >= now)
      .sort(
        (a, b) =>
          new Date(a.reservedFrom).getTime() -
          new Date(b.reservedFrom).getTime()
      );
  };

  // Check if hall has out-of-order periods during selected dates
  const isOutOfOrderForSelectedDates = (hall: Hall) => {
    if (!reserveDates.from || !reserveDates.to) return false;

    const selectedFrom = new Date(reserveDates.from);
    const selectedTo = new Date(reserveDates.to);

    return hall.outOfOrders?.some(period => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);
      return selectedFrom <= periodEnd && selectedTo > periodStart;
    });
  };

  const hasActiveFilters = statusFilter !== "ALL";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Halls</h2>
          <p className="text-muted-foreground">
            Manage event halls and their availability
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => exportHallsReport(halls)}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>

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
              <DropdownMenuLabel>Filter Halls</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <div className="p-2 space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active & Available</SelectItem>
                        <SelectItem value="INACTIVE">Inactive / Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatusFilter("ALL")}
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
            disabled={isLoading}
          >
            <Calendar className="h-4 w-4" />
            Manage Reservations
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Hall
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Hall</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Hall Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Main Auditorium"
                    />
                  </div>
                  <div>
                    <Label>Capacity *</Label>
                    <Input
                      type="number"
                      value={form.capacity}
                      onChange={(e) =>
                        setForm({ ...form, capacity: e.target.value })
                      }
                      placeholder="300"
                    />
                  </div>
                  <div>
                    <Label>Member Charges (PKR)</Label>
                    <Input
                      type="number"
                      value={form.chargesMembers}
                      onChange={(e) =>
                        setForm({ ...form, chargesMembers: e.target.value })
                      }
                      placeholder="25000"
                    />
                  </div>
                  <div>
                    <Label>Guest Charges (PKR)</Label>
                    <Input
                      type="number"
                      value={form.chargesGuests}
                      onChange={(e) =>
                        setForm({ ...form, chargesGuests: e.target.value })
                      }
                      placeholder="35000"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Luxurious hall with AC, sound system..."
                  />
                </div>
                <div>
                  <Label>Hall Images (Max 5)</Label>
                  <ImageUpload
                    images={form.images.map((f) => URL.createObjectURL(f))}
                    onChange={(files) =>
                      setForm((prev) => ({
                        ...prev,
                        images: [...prev.images, ...files].slice(0, 5),
                      }))
                    }
                    onRemove={(i) =>
                      setForm((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, idx) => idx !== i),
                      }))
                    }
                    maxImages={5}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Out of Order Periods</Label>
                    <span className="text-sm text-muted-foreground">
                      Add multiple maintenance periods (e.g., Nov 9-10, Dec 9-10)
                    </span>
                  </div>

                  {/* Current out-of-order periods */}
                  {form.outOfOrders.length > 0 && (
                    <div className="space-y-2">
                      <Label>Added Maintenance Periods ({form.outOfOrders.length})</Label>
                      {form.outOfOrders.map((oo, index) => (
                        <div key={index} className="p-3 border rounded-lg flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              {new Date(oo.startDate).toLocaleDateString()} - {new Date(oo.endDate).toLocaleDateString()}
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date *</Label>
                        <Input
                          type="date"
                          value={newOutOfOrder.startDate}
                          onChange={(e) =>
                            setNewOutOfOrder({ ...newOutOfOrder, startDate: e.target.value })
                          }
                          className="mt-2"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <Label>End Date *</Label>
                        <Input
                          type="date"
                          value={newOutOfOrder.endDate}
                          onChange={(e) =>
                            setNewOutOfOrder({ ...newOutOfOrder, endDate: e.target.value })
                          }
                          className="mt-2"
                          min={newOutOfOrder.startDate || new Date().toISOString().split("T")[0]}
                        />
                      </div>
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
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div>
                    <Label className="text-base font-medium">
                      Hall Availability Status
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {form.outOfOrders.length > 0
                        ? "Hall has maintenance periods scheduled"
                        : form.isActive
                          ? "Active & Available for Booking"
                          : "Inactive (Hidden from users)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label>Active</Label>
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(checked) => {
                        setForm({
                          ...form,
                          isActive: checked,
                        });
                      }}
                    />
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
                <Button
                  onClick={handleCreateHall}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Hall"}
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
              Status: {statusFilter === "ACTIVE" ? "Active & Available" : "Inactive / Reserved"}
              <button
                onClick={() => setStatusFilter("ALL")}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter("ALL")}
            className="ml-auto text-xs h-7"
          >
            Clear All
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading halls...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Member Rate</TableHead>
                  <TableHead>Guest Rate</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reservations</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHalls.map((hall: Hall) => {
                  const upcomingReservations = getUpcomingReservations(hall);
                  const upcomingBookings = getUpcomingBookings(hall);
                  const hasCurrent = hasCurrentBooking(hall);
                  const currentlyOutOfOrder = isCurrentlyOutOfOrder(hall);
                  const scheduledMaintenance = hasScheduledMaintenance(hall);

                  return (
                    <TableRow key={hall.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {hall.name}
                          {hasCurrent && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              Booked Today
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{hall.capacity} guests</TableCell>
                      <TableCell>
                        PKR {Number(hall.chargesMembers).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        PKR {Number(hall.chargesGuests).toLocaleString()}
                      </TableCell>
                      <TableCell className="grid grid-cols-2">
                        {hall.images ? hall.images?.slice(0, 5).map((img: any, idx: number) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt="hall"
                            className="w-12 h-12 rounded object-cover border"
                          />
                        )) : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={getHallStatusVariant(hall)}>
                            {getHallStatus(hall)}
                          </Badge>
                          {hall.outOfOrders && hall.outOfOrders.length > 0 && (
                            <div className="space-y-1 mt-2">
                              {hall.outOfOrders.slice(0, 2).map((period, idx) => (
                                <div key={idx} className="text-xs bg-orange-50 px-2 py-1 rounded border border-orange-200">
                                  <div className="font-medium text-orange-700">
                                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                                  </div>
                                  <div className="text-orange-600 truncate">
                                    {period.reason}
                                  </div>
                                </div>
                              ))}
                              {hall.outOfOrders.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{hall.outOfOrders.length - 2} more periods
                                </div>
                              )}
                            </div>
                          )}

                          {hasCurrent && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                              Has event booked today
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {upcomingReservations?.length > 0 ? (
                          <div className="space-y-2">
                            {upcomingReservations
                              .slice(0, 2)
                              .map((reservation) => (
                                <div key={reservation.id} className="text-xs border-l-2 border-orange-400 pl-2">
                                  <div className="font-medium text-orange-700 flex items-center gap-1">
                                    {getTimeSlotIcon(reservation.timeSlot)}
                                    {reservation.admin?.name || 'Unknown Admin'}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {formatDate(reservation.reservedFrom)} - {formatDate(reservation.reservedTo)}
                                  </div>
                                  <div className="text-xs text-blue-600 flex items-center gap-1">
                                    {getTimeSlotIcon(reservation.timeSlot)}
                                    {getTimeSlotDisplay(reservation.timeSlot)}
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
                              .map((booking: any) => (
                                <div key={booking.id} className="text-xs border-l-2 border-blue-400 pl-2">
                                  <div className="font-medium">
                                    Booking #{booking.id}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {formatDate(booking.bookingDate)}
                                  </div>
                                  <div className="mt-1">
                                    {getPaymentStatusBadge(booking.paymentStatus)}
                                  </div>
                                  {booking.totalPrice && (
                                    <div className="text-xs text-muted-foreground">
                                      PKR {Number(booking.totalPrice).toLocaleString()}
                                    </div>
                                  )}
                                  {booking.eventType && (
                                    <div className="text-xs text-muted-foreground">
                                      {booking.eventType}
                                    </div>
                                  )}
                                  {booking.bookingTime && (
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      {getTimeSlotIcon(booking.bookingTime)}
                                      {getTimeSlotDisplay(booking.bookingTime)}
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
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditHall(hall)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteHallData(hall)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reserve Halls Dialog */}
      <Dialog open={reserveDialog} onOpenChange={setReserveDialog}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Hall Reservations</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select dates, time slot, and halls to manage reservations. Halls already
              reserved for the selected dates and time slot will be automatically checked.
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Date and Time Selection */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
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
              <div>
                <Label>Time Slot *</Label>
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MORNING">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        Morning (8:00 AM - 2:00 PM)
                      </div>
                    </SelectItem>
                    <SelectItem value="EVENING">
                      <div className="flex items-center gap-2">
                        <Sunset className="h-4 w-4 text-orange-500" />
                        Evening (2:00 PM - 8:00 PM)
                      </div>
                    </SelectItem>
                    <SelectItem value="NIGHT">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-blue-500" />
                        Night (8:00 PM - 12:00 AM)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary */}
            {reserveDates.from && reserveDates.to && selectedTimeSlot && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Info className="h-4 w-4" />
                  <span>
                    Managing reservations for{" "}
                    <strong>
                      {new Date(reserveDates.from).toLocaleDateString()} to{" "}
                      {new Date(reserveDates.to).toLocaleDateString()}
                    </strong>
                    {" "}during{" "}
                    <strong className="flex items-center gap-1">
                      {getTimeSlotIcon(selectedTimeSlot)}
                      {getTimeSlotDisplay(selectedTimeSlot)}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* Halls List */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-4">
              <div className="border rounded-lg">
                <div className="p-3 bg-muted font-medium flex items-center justify-between">
                  <span>All Halls</span>
                  <Badge variant="outline">{halls?.length} halls</Badge>
                </div>
                <div className="p-4 grid grid-cols-1 gap-3">
                  {halls?.map((hall: Hall) => {
                    const isReservedForDates = isHallReservedForDates(hall);
                    const hasOverlap = hasOverlappingReservations(hall);
                    const isOutOfOrder = isOutOfOrderForSelectedDates(hall);

                    const upcomingReservations = getUpcomingReservations(hall);

                    const isCheckboxDisabled =
                      hasOverlap ||
                      isOutOfOrder;

                    return (
                      <div
                        key={hall.id}
                        className={`flex items-center space-x-3 p-3 border rounded-lg ${hasOverlap
                          ? "bg-orange-50 border-orange-200"
                          : isReservedForDates
                            ? "bg-blue-50 border-blue-200"
                            : isOutOfOrder
                              ? "bg-red-50 border-red-200"
                              : !hall.isActive
                                ? "bg-gray-50 border-gray-200"
                                : "bg-white border-gray-200"
                          }`}
                      >
                        <Checkbox
                          checked={selectedHalls.includes(hall.id)}
                          onCheckedChange={(checked) =>
                            handleHallSelection(hall.id, checked as boolean)
                          }
                          disabled={isCheckboxDisabled}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium flex items-center gap-2">
                            {hall.name}
                            {hasOverlap && (
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            )}
                            {isOutOfOrder && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Capacity: {hall.capacity} guests
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {hall.description}
                          </div>

                          {hasOverlap && !isReservedForDates && (
                            <div className="text-xs text-orange-600 mt-1">
                              <div className="flex items-center gap-1 mb-1">
                                <AlertCircle className="h-3 w-3" />
                                <span className="font-medium">Conflicting reservations:</span>
                              </div>
                              {hall.reservations
                                ?.filter(reservation => {
                                  const resFrom = new Date(reservation.reservedFrom);
                                  const resTo = new Date(reservation.reservedTo);
                                  const selFrom = new Date(reserveDates.from);
                                  const selTo = new Date(reserveDates.to);

                                  return reservation.timeSlot === selectedTimeSlot &&
                                    selFrom <= resTo &&
                                    selTo >= resFrom &&
                                    !(resFrom.getTime() === selFrom.getTime() && resTo.getTime() === selTo.getTime());
                                })
                                .map((reservation, idx) => (
                                  <div key={reservation.id} className="ml-4 text-xs">
                                    • {formatDate(reservation.reservedFrom)} - {formatDate(reservation.reservedTo)}
                                    <span className="text-blue-600 ml-1">({getTimeSlotDisplay(reservation.timeSlot)})</span>
                                  </div>
                                ))
                              }
                            </div>
                          )}

                          {isOutOfOrder && (
                            <div className="text-xs text-red-600 mt-1">
                              <div className="flex items-center gap-1 mb-1">
                                <AlertCircle className="h-3 w-3" />
                                <span className="font-medium">Out of order during selected dates:</span>
                              </div>
                              {hall.outOfOrders
                                ?.filter(period => {
                                  const periodStart = new Date(period.startDate);
                                  const periodEnd = new Date(period.endDate);
                                  const selFrom = new Date(reserveDates.from);
                                  const selTo = new Date(reserveDates.to);

                                  return selFrom <= periodEnd && selTo >= periodStart;
                                })
                                .map((period, idx) => (
                                  <div key={idx} className="ml-4 text-xs">
                                    • {formatDate(period.startDate)} - {formatDate(period.endDate)}
                                    <span className="ml-1">({period.reason})</span>
                                  </div>
                                ))
                              }
                            </div>
                          )}

                          {isReservedForDates && (
                            <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Reserved for these dates and time slot (uncheck to remove)
                            </div>
                          )}

                          {!hall.isActive && !isOutOfOrder && !isCheckboxDisabled && (
                            <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Inactive but available for selected dates
                            </div>
                          )}

                          {isCurrentlyOutOfOrder(hall) && !isOutOfOrder && !isCheckboxDisabled && (
                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Available for selected dates (currently out of order for other dates)
                            </div>
                          )}

                          {hall.isActive && !isCurrentlyOutOfOrder(hall) && !isCheckboxDisabled && !isReservedForDates && (
                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Available for reservation
                            </div>
                          )}

                          {upcomingReservations?.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {upcomingReservations.length} upcoming reservation(s)
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            isOutOfOrder
                              ? "destructive"
                              : isCurrentlyOutOfOrder(hall)
                                ? "secondary"
                                : hall.isReserved
                                  ? "secondary"
                                  : !hall.isActive
                                    ? "secondary"
                                    : "default"
                          }
                        >
                          {getHallStatus(hall)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 pt-4 border-t">
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-muted-foreground">
                <div>{selectedHalls.length} hall(s) selected</div>
                <div>
                  {
                    selectedHalls.filter((hallId) => {
                      const hall = halls.find((h: Hall) => h.id === hallId);
                      return hall && isHallReservedForDates(hall);
                    }).length
                  }{" "}
                  already reserved for these dates and time slot
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReserveDialog(false);
                    setSelectedHalls([]);
                    setReserveDates({ from: "", to: "" });
                    setSelectedTimeSlot("MORNING");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkReserve}
                  disabled={
                    reserveMutation.isPending ||
                    !reserveDates.from ||
                    !reserveDates.to ||
                    !selectedTimeSlot
                  }
                >
                  {reserveMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Updating...
                    </div>
                  ) : (
                    `Save Changes (${selectedHalls.length})`
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editHall} onOpenChange={() => setEditHall(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hall: {editHall?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) =>
                    setEditForm({ ...editForm, capacity: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Member Charges</Label>
                <Input
                  type="number"
                  value={editForm.chargesMembers}
                  onChange={(e) =>
                    setEditForm({ ...editForm, chargesMembers: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Guest Charges</Label>
                <Input
                  type="number"
                  value={editForm.chargesGuests}
                  onChange={(e) =>
                    setEditForm({ ...editForm, chargesGuests: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label>Current Images</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {editHall?.images?.map((img: any, i: number) => (
                  <img
                    key={i}
                    src={img.url || img}
                    alt="hall"
                    className="h-24 w-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Add New Images</Label>
              <ImageUpload
                images={editForm.newImages.map((f) => URL.createObjectURL(f))}
                onChange={(files) =>
                  setEditForm((prev) => ({
                    ...prev,
                    newImages: [...prev.newImages, ...files].slice(0, 5),
                  }))
                }
                onRemove={(i) =>
                  setEditForm((prev) => ({
                    ...prev,
                    newImages: prev.newImages.filter((_, idx) => idx !== i),
                  }))
                }
                maxImages={5}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div>
                <Label className="text-base font-medium">Hall Status</Label>
                <p className="text-sm text-muted-foreground">
                  {editForm.outOfOrders.length > 0
                    ? "Hall has maintenance periods scheduled"
                    : editForm.isActive
                      ? "Active & Available"
                      : "Inactive"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Label>Active</Label>
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => {
                    setEditForm({ ...editForm, isActive: checked });
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Out of Order Periods</Label>
                <span className="text-sm text-muted-foreground">
                  Add multiple maintenance periods (e.g., Nov 9-10, Dec 9-10)
                </span>
              </div>
              {/* Current out-of-order periods */}
              {editForm.outOfOrders.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Maintenance Periods ({editForm.outOfOrders.length})</Label>
                  {editForm.outOfOrders.map((oo, index) => (
                    <div key={index} className="p-3 border rounded-lg flex justify-between items-center">
                      <div>

                        <div className="font-medium">
                          {new Date(oo.startDate).toLocaleDateString()} - {new Date(oo.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {oo.reason}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEditOutOfOrder(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {/* Add new out-of-order period form */}
              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <h4 className="font-medium">Add New Maintenance Period</h4>
                <div>
                  <Label>Reason *</Label>
                  <Textarea
                    value={editNewOutOfOrder.reason}
                    onChange={(e) =>
                      setEditNewOutOfOrder({ ...editNewOutOfOrder, reason: e.target.value })
                    }
                    placeholder="Describe the issue (maintenance, renovation, repair, etc.)"
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={editNewOutOfOrder.startDate}
                      onChange={(e) =>
                        setEditNewOutOfOrder({ ...editNewOutOfOrder, startDate: e.target.value })
                      }
                      className="mt-2"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={editNewOutOfOrder.endDate}
                      onChange={(e) =>
                        setEditNewOutOfOrder({ ...editNewOutOfOrder, endDate: e.target.value })
                      }
                      className="mt-2"
                      min={editNewOutOfOrder.startDate || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddEditOutOfOrder}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Maintenance Period
                </Button>
              </div>
            </div>


          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditHall(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateHall}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Hall"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteHallData}
        onOpenChange={() => setDeleteHallData(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Hall</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete{" "}
            <strong>{deleteHallData?.name}</strong>? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteHallData(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteHall}
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