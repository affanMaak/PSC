import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getRoomTypes,
  getAvailRooms,
  getRooms,
  searchMembers,
  getVouchers,
} from "../../config/apis";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import reusable components
import { BookingFormComponent } from "@/components/BookingForm";
import { BookingsTable } from "@/components/BookingsTable";
import { EditBookingDialog } from "@/components/EditBookingDialog";
import { VouchersDialog } from "@/components/VouchersDialog";
import { CancelBookingDialog } from "@/components/CancelBookingDialog";

// Import types and utilities
import {
  Booking,
  BookingForm,
  Room,
  Member,
  RoomType,
} from "@/types/room-booking.type";
import {
  initialFormState,
  calculatePrice,
  calculateAccountingValues,
  getDateStatuses,
} from "@/utils/bookingUtils";
import { format } from "date-fns";
import { BookingDetailsCard } from "@/components/details/RoomBookingDets";

export default function RoomBookings() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [viewVouchers, setViewVouchers] = useState<Booking | null>(null);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [form, setForm] = useState<BookingForm>(initialFormState);
  const [editForm, setEditForm] = useState<BookingForm>(initialFormState);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [editAvailableRooms, setEditAvailableRooms] = useState<Room[]>([]);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [openDetails, setOpenDetails] = useState(false)

  // Member search states for create dialog
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberResults, setShowMemberResults] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // API Queries
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery<
    Booking[]
  >({
    queryKey: ["bookings", "rooms"],
    queryFn: async () => (await getBookings("rooms")) as Booking[],
  });

  const { data: roomTypes = [], isLoading: isLoadingRoomTypes } = useQuery<
    RoomType[]
  >({
    queryKey: ["roomTypes"],
    queryFn: async () => (await getRoomTypes()) as RoomType[],
  });

  const { data: allRooms = [] } = useQuery<Room[]>({
    queryKey: ["allRooms"],
    queryFn: async () => (await getRooms()) as Room[],
  });

  // Vouchers query - only enabled when viewing vouchers

  const { data: vouchers = [], isLoading: isLoadingVouchers } = useQuery<any[]>(
    {
      queryKey: ["vouchers", viewVouchers?.id],
      queryFn: () => (viewVouchers ? getVouchers("ROOM", viewVouchers.id) : []),
      enabled: !!viewVouchers,
    }
  );

  // Member search query with throttling for create dialog
  const {
    data: searchResults = [],
    isLoading: isSearching,
    refetch: searchMembersFn,
    useQuery: useMemberSearchQuery,
  } = useQuery<Member[]>({
    queryKey: ["memberSearch", memberSearch],
    queryFn: async () => (await searchMembers(memberSearch)) as Member[],
    enabled: false,
  }) as any; // Cast to any to avoid type issues if useQuery signature mismatch

  // Date statuses for the create/edit dialogs
  const createDateStatuses = useMemo(
    () => getDateStatuses(form.roomId, bookings, allRooms),
    [form.roomId, bookings, allRooms]
  );

  const editDateStatuses = useMemo(
    () =>
      editBooking ? getDateStatuses(editForm.roomId, bookings, allRooms) : [],
    [editBooking, editForm.roomId, bookings, allRooms]
  );

  // Stable search handler with proper cleanup
  const handleMemberSearch = useCallback(
    (searchTerm: string) => {
      setMemberSearch(searchTerm);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (searchTerm.trim().length >= 2) {
          searchMembersFn();
          setShowMemberResults(true);
        } else {
          setShowMemberResults(false);
        }
      }, 300);
    },
    [searchMembersFn]
  );

  // Stable focus handler
  const handleSearchFocus = useCallback(() => {
    if (memberSearch.length >= 2 && searchResults.length > 0) {
      setShowMemberResults(true);
    }
  }, [memberSearch.length, searchResults.length]);

  // Stable member selection handlers
  const handleSelectMember = useCallback((member: Member) => {
    setSelectedMember(member);
    setForm((prev) => ({
      ...prev,
      membershipNo: member.Membership_No || member.membershipNumber || "",
      memberName: member.Name,
      memberId: member.id?.toString(),
    }));
    setMemberSearch("");
    setShowMemberResults(false);
  }, []);

  const handleClearMember = useCallback(() => {
    setSelectedMember(null);
    setForm((prev) => ({
      ...prev,
      membershipNo: "",
      memberName: "",
      memberId: "",
    }));
    setMemberSearch("");
    setShowMemberResults(false);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Mutations
  const createMutation = useMutation<any, Error, Record<string, any>>({
    mutationFn: (payload) => createBooking(payload),
    onSuccess: () => {
      toast({ title: "Booking created successfully" });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create booking",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation<any, Error, Record<string, any>>({
    mutationFn: (payload) => updateBooking(payload),
    onSuccess: () => {
      toast({ title: "Booking updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setEditBooking(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update booking",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation<
    any,
    Error,
    { bookingFor: string; bookID: string }
  >({
    mutationFn: ({ bookingFor, bookID }) => deleteBooking(bookingFor, bookID),
    onSuccess: () => {
      toast({ title: "Booking cancelled successfully" });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setCancelBooking(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel booking",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Fetch available rooms when room type is selected for create dialog
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (form.roomTypeId) {
        try {
          const response = await getAvailRooms(form.roomTypeId);
          console.log(response);
          const rooms = (response?.data ?? response ?? []) as Room[];
          setAvailableRooms(rooms);
        } catch (error) {
          setAvailableRooms([]);
          toast({
            title: "Failed to fetch available rooms",
            variant: "destructive",
          });
        }
      } else {
        setAvailableRooms([]);
      }
    };

    fetchAvailableRooms();
  }, [form.roomTypeId, toast]);

  // Update edit form when editBooking changes
  useEffect(() => {
    if (editBooking) {
      const roomTypeId =
        editBooking.roomTypeId || editBooking.room?.roomType?.id;
      const roomId = editBooking.roomId;

      // Helper function to convert backend date to datetime-local format
      const convertToDateTimeLocal = (dateString: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString.replace(" ", "T"));
        return format(date, "yyyy-MM-dd'T'HH:mm");
      };

      const newEditForm: BookingForm = {
        membershipNo: editBooking.Membership_No || "",
        memberName: editBooking.memberName || editBooking.member?.Name || "",
        memberId: editBooking.member?.id?.toString() || "",
        category: "Room",
        roomTypeId: roomTypeId?.toString() || "",
        roomId: roomId?.toString() || "",
        pricingType: editBooking.pricingType || "member",
        paidBy: editBooking.paidBy || "MEMBER",
        guestName: editBooking.guestName,
        guestContact: editBooking.guestContact,
        checkIn: editBooking.checkIn
          ? convertToDateTimeLocal(editBooking.checkIn)
          : "",
        checkOut: editBooking.checkOut
          ? convertToDateTimeLocal(editBooking.checkOut)
          : "",
        totalPrice: editBooking.totalPrice || 0,
        paymentStatus: editBooking.paymentStatus || "UNPAID",
        paidAmount: editBooking.paidAmount || 0,
        pendingAmount: editBooking.pendingAmount || 0,
        paymentMode: "CASH",
        numberOfAdults: editBooking.numberOfAdults || 1,
        numberOfChildren: editBooking.numberOfChildren || 0,
        specialRequests: editBooking.specialRequests || "",
        remarks: editBooking.remarks || "",
      };

      setEditForm(newEditForm);

      // Fetch available rooms for the room type
      if (roomTypeId) {
        getAvailRooms(roomTypeId.toString())
          .then((response) => {
            const availableRoomsData = (response?.data ??
              response ??
              []) as Room[];
            setEditAvailableRooms(availableRoomsData);

            // If the current room is not in available rooms, add it to the list
            if (
              roomId &&
              !availableRoomsData.some((room: Room) => room.id === roomId)
            ) {
              const currentRoom: Room = {
                id: roomId,
                roomNumber:
                  editBooking.roomNumber ||
                  editBooking.room?.roomNumber ||
                  `Room ${roomId}`,
                roomType:
                  editBooking.roomType ||
                  editBooking.room?.roomType?.type ||
                  "Unknown",
                roomTypeId: roomTypeId,
                isActive: true,
                reservations: [],
                bookings: [],
              };
              setEditAvailableRooms([currentRoom, ...availableRoomsData]);
            }
          })
          .catch((error) => {
            console.error("Failed to fetch available rooms:", error);
            // Create a fallback room entry if fetch fails
            if (roomId && roomTypeId) {
              const fallbackRoom: Room = {
                id: roomId,
                roomNumber:
                  editBooking.roomNumber ||
                  editBooking.room?.roomNumber ||
                  `Room ${roomId}`,
                roomType:
                  editBooking.roomType ||
                  editBooking.room?.roomType?.type ||
                  "Unknown",
                roomTypeId: roomTypeId,
                isActive: true,
                reservations: [],
                bookings: [],
              };
              setEditAvailableRooms([fallbackRoom]);
            } else {
              setEditAvailableRooms([]);
            }
          });
      }
    }
  }, [editBooking]);

  // Conflict check function
  const checkConflicts = (roomId: string, checkIn: string, checkOut: string, excludeBookingId?: number) => {
    const room = allRooms.find((r) => r.id.toString() === roomId);
    if (!room) return null;

    const selStart = new Date(checkIn);
    const selEnd = new Date(checkOut);
    selStart.setHours(0, 0, 0, 0);
    selEnd.setHours(0, 0, 0, 0);

    // 1. Check Out of Order (Inclusive)
    const ooConflict = room.outOfOrders?.find((oo: any) => {
      const ooStart = new Date(oo.startDate);
      const ooEnd = new Date(oo.endDate);
      ooStart.setHours(0, 0, 0, 0);
      ooEnd.setHours(0, 0, 0, 0);
      return selStart <= ooEnd && selEnd > ooStart;
    });
    if (ooConflict) return `Room is out of service from ${format(new Date(ooConflict.startDate), "PP")} to ${format(new Date(ooConflict.endDate), "PP")}`;

    // 2. Check Reservations
    const resConflict = room.reservations?.find((res: any) => {
      const resStart = new Date(res.reservedFrom);
      const resEnd = new Date(res.reservedTo);
      resStart.setHours(0, 0, 0, 0);
      resEnd.setHours(0, 0, 0, 0);
      return selStart < resEnd && selEnd > resStart;
    });
    if (resConflict) return `Room has a reservation from ${format(new Date(resConflict.reservedFrom), "PP")} to ${format(new Date(resConflict.reservedTo), "PP")}`;

    // 3. Check Other Bookings
    const bookingConflict = room.bookings?.find((book: any) => {
      if (excludeBookingId && book.id === excludeBookingId) return false;
      const bStart = new Date(book.checkIn);
      const bEnd = new Date(book.checkOut);
      bStart.setHours(0, 0, 0, 0);
      bEnd.setHours(0, 0, 0, 0);
      return selStart < bEnd && selEnd > bStart;
    });
    if (bookingConflict) return `Room is already booked from ${format(new Date(bookingConflict.checkIn), "PP")} to ${format(new Date(bookingConflict.checkOut), "PP")}`;

    return null;
  };

  // Calculate price function
  const calculatePriceForForm = (
    roomTypeId: string,
    pricingType: string,
    checkIn: string,
    checkOut: string
  ) => {
    return calculatePrice(
      roomTypeId,
      pricingType,
      checkIn,
      checkOut,
      roomTypes
    );
  };

  // Unified form change handler
  const createFormChangeHandler = (isEdit: boolean) => {
    return (field: keyof BookingForm, value: any) => {
      const setFormFn = isEdit ? setEditForm : setForm;
      const formState = isEdit ? editForm : form;

      setFormFn((prev) => {
        const newForm = { ...prev, [field]: value };

        // Recalculate price when relevant fields change
        if (
          ["roomTypeId", "pricingType", "checkIn", "checkOut"].includes(field)
        ) {
          const oldTotal = prev.totalPrice || 0;
          const oldPaid = prev.paidAmount || 0;
          const oldPaymentStatus = prev.paymentStatus;

          const newPrice = calculatePriceForForm(
            field === "roomTypeId" ? value : newForm.roomTypeId,
            field === "pricingType" ? value : newForm.pricingType,
            field === "checkIn" ? value : newForm.checkIn,
            field === "checkOut" ? value : newForm.checkOut
          );
          newForm.totalPrice = newPrice;

          // AUTO-ADJUST PAYMENT STATUS WHEN DATES CHANGE IN EDIT MODE
          if (isEdit && ["checkIn", "checkOut"].includes(field)) {
            // Scenario 1: Charges DECREASED (refund scenario)
            if (newPrice < oldPaid) {
              // Keep PAID status - backend will handle refund voucher
              newForm.paymentStatus = "PAID";
              newForm.paidAmount = newPrice;
              newForm.pendingAmount = 0;
            }
            // Scenario 2: Charges INCREASED and was previously PAID
            else if (newPrice > oldPaid && oldPaymentStatus === "PAID") {
              // Auto-change to HALF_PAID
              newForm.paymentStatus = "HALF_PAID";
              newForm.paidAmount = oldPaid; // Keep the amount already paid
              newForm.pendingAmount = newPrice - oldPaid;
            }
            // Scenario 3: Charges INCREASED but was HALF_PAID or UNPAID
            else if (newPrice > oldTotal && (oldPaymentStatus === "HALF_PAID" || oldPaymentStatus === "UNPAID")) {
              // Keep current status, just update amounts
              newForm.paidAmount = oldPaid;
              newForm.pendingAmount = newPrice - oldPaid;
            }
            // Scenario 4: Charges UNCHANGED or other cases
            else {
              // Recalculate accounting values normally
              const accounting = calculateAccountingValues(
                newForm.paymentStatus,
                newPrice,
                newForm.paidAmount
              );
              newForm.paidAmount = accounting.paid;
              newForm.pendingAmount = accounting.pendingAmount;
            }
          } else {
            // For create mode or non-date field changes, use normal accounting
            const accounting = calculateAccountingValues(
              newForm.paymentStatus,
              newPrice,
              newForm.paidAmount
            );
            newForm.paidAmount = accounting.paid;
            newForm.pendingAmount = accounting.pendingAmount;
          }
        }

        // Handle payment status changes
        if (field === "paymentStatus") {
          const accounting = calculateAccountingValues(
            value,
            newForm.totalPrice,
            newForm.paidAmount
          );
          newForm.paidAmount = accounting.paid;
          newForm.pendingAmount = accounting.pendingAmount;
        }

        // Handle paid amount changes for half-paid status
        if (field === "paidAmount" && newForm.paymentStatus === "HALF_PAID") {
          newForm.pendingAmount = newForm.totalPrice - value;
        }

        return newForm;
      });
    };
  };

  const handleFormChange = createFormChangeHandler(false);
  const handleEditFormChange = createFormChangeHandler(true);

  const handleCreate = () => {
    if (
      !form.membershipNo ||
      !form.roomTypeId ||
      !form.roomId ||
      !form.checkIn ||
      !form.checkOut ||
      !form.numberOfAdults
    ) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate guest count
    if (form.numberOfAdults < 1) {
      toast({
        title: "At least one adult is required",
        variant: "destructive",
      });
      return;
    }

    if (form.numberOfAdults + form.numberOfChildren > 6) {
      toast({
        title: "Maximum capacity exceeded",
        description: "Maximum 6 guests total (adults + children)",
        variant: "destructive",
      });
      return;
    }

    // Validate dates
    const checkInDate = new Date(form.checkIn);
    // console.log(checkInDate)
    const checkOutDate = new Date(form.checkOut);

    // Normalize dates to start of day for comparison
    const normalizedCheckIn = new Date(checkInDate);
    normalizedCheckIn.setHours(0, 0, 0, 0);

    const normalizedCheckOut = new Date(checkOutDate);
    normalizedCheckOut.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate >= checkOutDate) {
      toast({
        title: "Invalid dates",
        description: "Check-out must be after check-in",
        variant: "destructive",
      });
      return;
    }

    if (normalizedCheckIn < today) {
      toast({
        title: "Invalid check-in date",
        description: "Check-in date cannot be in the past",
        variant: "destructive",
      });
      return;
    }

    // Validate paid amount for half-paid status
    if (form.paymentStatus === "HALF_PAID") {
      if (form.paidAmount <= 0) {
        toast({
          title: "Invalid paid amount",
          description: "Please enter a valid paid amount for half-paid status",
          variant: "destructive",
        });
        return;
      }
      if (form.paidAmount >= form.totalPrice) {
        toast({
          title: "Invalid paid amount",
          description:
            "Paid amount must be less than total price for half-paid status",
          variant: "destructive",
        });
        return;
      }
    }

    // Guest Info Validation
    if (form.pricingType === "guest") {
      if (!form.guestName || !form.guestContact) {
        toast({
          title: "Guest information required",
          description: "Guest name and contact are required for guest pricing",
          variant: "destructive",
        });
        return;
      }
    }

    // Conflict Check
    const conflict = checkConflicts(form.roomId, form.checkIn, form.checkOut);
    if (conflict) {
      toast({
        title: "Booking Conflict",
        description: conflict,
        variant: "destructive",
      });
      return;
    }

    const payload = {
      category: "Room",
      membershipNo: form.membershipNo,
      subCategoryId: form.roomTypeId,
      entityId: form.roomId,
      pricingType: form.pricingType,
      checkIn: form.checkIn.split("T")[0],
      checkOut: form.checkOut.split("T")[0],
      totalPrice: form.totalPrice.toString(),
      paymentStatus: form.paymentStatus,
      paidAmount: form.paidAmount,
      pendingAmount: form.pendingAmount,
      paymentMode: "CASH",
      numberOfAdults: form.numberOfAdults,
      numberOfChildren: form.numberOfChildren,
      specialRequests: form.specialRequests,
      paidBy: form.paidBy,
      guestName: form.guestName,
      guestContact: form.guestContact,
      remarks: form.remarks,
    };

    createMutation.mutate(payload);
  };

  const handleUpdate = () => {
    if (
      !editForm.membershipNo ||
      !editForm.roomTypeId ||
      !editForm.roomId ||
      !editForm.checkIn ||
      !editForm.checkOut
    ) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate paid amount for half-paid status
    if (editForm.paymentStatus === "HALF_PAID") {
      if (editForm.paidAmount <= 0) {
        toast({
          title: "Invalid paid amount",
          description: "Please enter a valid paid amount for half-paid status",
          variant: "destructive",
        });
        return;
      }
      if (editForm.paidAmount >= editForm.totalPrice) {
        toast({
          title: "Invalid paid amount",
          description:
            "Paid amount must be less than total price for half-paid status",
          variant: "destructive",
        });
        return;
      }
    }

    // Guest Info Validation
    if (editForm.pricingType === "guest") {
      if (!editForm.guestName || !editForm.guestContact) {
        toast({
          title: "Guest information required",
          description: "Guest name and contact are required for guest pricing",
          variant: "destructive",
        });
        return;
      }
    }

    // Conflict Check
    const conflict = checkConflicts(editForm.roomId, editForm.checkIn, editForm.checkOut, editBooking.id);
    if (conflict) {
      toast({
        title: "Booking Conflict",
        description: conflict,
        variant: "destructive",
      });
      return;
    }

    const payload = {
      id: editBooking?.id?.toString(),
      category: "Room",
      membershipNo: editForm.membershipNo,
      subCategoryId: editForm.roomTypeId,
      entityId: editForm.roomId,
      pricingType: editForm.pricingType,
      checkIn: editForm.checkIn.split("T")[0],
      checkOut: editForm.checkOut.split("T")[0],
      totalPrice: editForm.totalPrice.toString(),
      paymentStatus: editForm.paymentStatus,
      paidAmount: editForm.paidAmount,
      pendingAmount: editForm.pendingAmount,
      paymentMode: "CASH",
      prevRoomId: editBooking?.roomId?.toString(),
      paidBy: editBooking.paidBy,
      guestContact: editBooking.guestContact,
      guestName: editBooking.guestName,
      numberOfAdults: editForm.numberOfAdults,
      numberOfChildren: editForm.numberOfChildren,
      specialRequests: editForm.specialRequests,
      remarks: editForm.remarks,
    };

    console.log(payload);

    updateMutation.mutate(payload);
  };

  const handleDelete = () => {
    if (cancelBooking) {
      deleteMutation.mutate({
        bookingFor: "rooms",
        bookID: cancelBooking.id.toString(),
      });
    }
  };

  const handleViewVouchers = (booking: Booking) => {
    setViewVouchers(booking);
  };

  const filteredBookings =
    paymentFilter === "ALL"
      ? bookings
      : bookings?.filter((b: any) => b.paymentStatus === paymentFilter);

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-600 text-white">Paid</Badge>;
      case "HALF_PAID":
        return <Badge className="bg-yellow-600 text-white">Half Paid</Badge>;
      case "UNPAID":
        return <Badge variant="destructive">Unpaid</Badge>;
      case "TO_BILL":
        return <Badge className="bg-blue-600 text-white">To Bill</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setAvailableRooms([]);
    setMemberSearch("");
    setSelectedMember(null);
    setShowMemberResults(false);
  };

  const resetEditForm = () => {
    setEditForm(initialFormState);
    setEditAvailableRooms([]);
    setEditBooking(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Room Bookings
          </h2>
          <p className="text-muted-foreground">Manage room reservations</p>
        </div>
        <div className="flex gap-2">
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="HALF_PAID">Half Paid</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="TO_BILL">To Bill</SelectItem>
            </SelectContent>
          </Select>
          <Dialog
            open={isAddOpen}
            onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Room Booking</DialogTitle>
              </DialogHeader>

              <BookingFormComponent
                form={form}
                onChange={handleFormChange}
                roomTypes={roomTypes}
                availableRooms={availableRooms}
                isLoadingRoomTypes={isLoadingRoomTypes}
                memberSearch={memberSearch}
                onMemberSearchChange={handleMemberSearch}
                showMemberResults={showMemberResults}
                searchResults={searchResults}
                isSearching={isSearching}
                selectedMember={selectedMember}
                onSelectMember={handleSelectMember}
                onClearMember={handleClearMember}
                onSearchFocus={handleSearchFocus}
                dateStatuses={createDateStatuses}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !selectedMember}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Booking"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bookings Table */}
      <BookingsTable
        bookings={filteredBookings}
        isLoading={isLoadingBookings}
        onEdit={setEditBooking}
        onDetail={(booking: Booking) => {
          setOpenDetails(true)
          setDetailBooking(booking)
        }}
        onViewVouchers={handleViewVouchers}
        onCancel={setCancelBooking}
        getPaymentBadge={getPaymentBadge}
      />

      {/* Edit Dialog */}
      <EditBookingDialog
        editBooking={editBooking}
        editForm={editForm}
        onEditFormChange={handleEditFormChange}
        roomTypes={roomTypes}
        editAvailableRooms={editAvailableRooms}
        isLoadingRoomTypes={isLoadingRoomTypes}
        dateStatuses={editDateStatuses}
        onUpdate={handleUpdate}
        onClose={resetEditForm}
        isUpdating={updateMutation.isPending}
      />

      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="p-0 max-w-5xl min-w-4xl overflow-hidden">
          {detailBooking && (
            <BookingDetailsCard
              booking={detailBooking}
              className="rounded-none border-0 shadow-none"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Vouchers Dialog */}
      <VouchersDialog
        viewVouchers={viewVouchers}
        onClose={() => setViewVouchers(null)}
        vouchers={vouchers}
        isLoadingVouchers={isLoadingVouchers}
      />

      {/* Cancel Booking Dialog */}
      <CancelBookingDialog
        cancelBooking={cancelBooking}
        onClose={() => setCancelBooking(null)}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
