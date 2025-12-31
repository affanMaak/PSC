import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, X, Loader2, Receipt, User, Calendar, Clock, NotepadText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookings, createBooking, updateBooking, deleteBooking as delBooking, getPhotoshoots, searchMembers, getVouchers } from "../../config/apis";
import { MemberSearchComponent } from "@/components/MemberSearch";
import { Member } from "@/types/room-booking.type";
import { cn } from "@/lib/utils";
import { FormInput } from "@/components/FormInputs";
import { UnifiedDatePicker } from "@/components/UnifiedDatePicker";
import { PhotoshootBookingDetailsCard } from "@/components/details/PhotoshootBookingDets";

export interface PhotoshootBooking {
  id: number;
  memberId: number;
  photoshootId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: string;
  paymentStatus: "PAID" | "HALF_PAID" | "UNPAID" | "TO_BILL";
  pricingType: string;
  paidAmount: string;
  pendingAmount: string;
  member: Member;
  paidBy?: string;
  guestName?: string;
  guestContact?: string;
  createdAt?: string;
  photoshoot: {
    id: number;
    description: string;
    memberCharges: string;
    guestCharges: string;
    outOfOrders?: any[];
    isBooked?: any;

  };
}

interface PhotoshootService {
  id: number;
  description: string;
  memberCharges: string;
  guestCharges: string;
}

interface Voucher {
  id: number;
  voucher_no: string;
  booking_type: string;
  booking_id: number;
  membership_no: string;
  amount: string;
  payment_mode: string;
  voucher_type: string;
  status: string;
  issued_by: string;
  issued_at: string;
  remarks?: string;
  transaction_id?: string;
}

const PhotoshootPaymentSection = React.memo(
  ({
    form,
    onChange,
  }: {
    form: {
      paymentStatus: string;
      totalPrice: number;
      paidAmount: number;
      pendingAmount: number;
    };
    onChange: (field: string, value: any) => void;
  }) => {
    const accounting = {
      paid: form.paidAmount || 0,
      owed: form.pendingAmount || 0,
      total: form.totalPrice || 0
    };

    return (
      <div className="md:col-span-2 border-t pt-4">
        <Label className="text-lg font-semibold">Payment Details</Label>

        <div className="mt-4">
          <Label>Total Amount</Label>
          <Input
            type="text"
            className="mt-2 font-bold text-lg"
            value={`PKR ${form.totalPrice.toLocaleString()}`}
            disabled
          />
        </div>

        <div className="mt-4">
          <Label>Payment Status</Label>
          <Select
            value={form.paymentStatus}
            onValueChange={(val) => onChange("paymentStatus", val)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="HALF_PAID">Half Paid</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="TO_BILL">To Bill</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.paymentStatus === "TO_BILL" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <Receipt className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                Remaining amount will be added to Member's Ledger/Balance
              </span>
            </div>
          </div>
        )}

        {form.paymentStatus === "HALF_PAID" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Paid Amount (PKR) *</Label>
              <Input
                type="number"
                value={form.paidAmount || ""}
                onChange={(e) =>
                  onChange("paidAmount", parseFloat(e.target.value) || 0)
                }
                className="mt-2"
                placeholder="Enter paid amount"
                min="0"
                max={form.totalPrice}
              />
            </div>
            <div>
              <Label>Pending Amount (PKR)</Label>
              <Input
                type="number"
                value={form.pendingAmount}
                className="mt-2"
                readOnly
                disabled
              />
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Label className="text-lg font-semibold text-blue-800">
            Accounting Summary
          </Label>
          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
            <div className="text-blue-700">Total Amount:</div>
            <div className="font-semibold text-right text-blue-700">
              PKR {form.totalPrice.toLocaleString()}
            </div>

            <div className="text-green-700">Paid Amount (DR):</div>
            <div className="font-semibold text-right text-green-700">
              PKR {accounting.paid.toLocaleString()}
            </div>

            <div className="text-red-700">Owed Amount (CR):</div>
            <div className="font-semibold text-right text-red-700">
              PKR {accounting.owed.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            <strong>DR</strong> = Debit (Amount Received), <strong>CR</strong> =
            Credit (Amount Owed)
          </div>
        </div>

        {(form.paymentStatus === "PAID" ||
          form.paymentStatus === "HALF_PAID") && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <Receipt className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  {form.paymentStatus === "PAID"
                    ? "Full Payment Voucher will be generated automatically"
                    : "Half Payment Voucher will be generated automatically"}
                </span>
              </div>
            </div>
          )}
      </div>
    );
  }
);

PhotoshootPaymentSection.displayName = "PhotoshootPaymentSection";

export default function PhotoshootBookings() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<PhotoshootBooking | null>(null);
  const [deleteBooking, setDeleteBooking] = useState<PhotoshootBooking | null>(null);
  const [viewVouchers, setViewVouchers] = useState<PhotoshootBooking | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Form States
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberResults, setShowMemberResults] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedPhotoshootId, setSelectedPhotoshootId] = useState<string>("");
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [pricingType, setPricingType] = useState("member");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [paidAmount, setPaidAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);


  const [detailBooking, setDetailBooking] = useState<PhotoshootBooking | null>(null);
  const [openDetails, setOpenDetails] = useState(false)

  const [guestSec, setGuestSec] = useState({
    paidBy: "MEMBER",
    guestName: "",
    guestContact: ""
  })

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery<PhotoshootBooking[]>({
    queryKey: ["bookings", "photoshoots"],
    queryFn: async () => await getBookings("photoshoots"),
  });
  // console.log(bookings)

  const { data: photoshoots = [], isLoading: isLoadingPhotoshoots } = useQuery<PhotoshootService[]>({
    queryKey: ["photoshoots"],
    queryFn: async () => await getPhotoshoots(),
  });

  const {
    data: searchResults = [],
    isLoading: isSearching,
    refetch: searchMembersFn,
  } = useQuery<Member[]>({
    queryKey: ["memberSearch", memberSearch],
    queryFn: async () => (await searchMembers(memberSearch)) as Member[],
    enabled: false,
  });

  // Fetch vouchers when viewing vouchers
  const {
    data: vouchers = [],
    isLoading: isLoadingVouchers,
  } = useQuery<Voucher[]>({
    queryKey: ["photoshoot-vouchers", viewVouchers?.id],
    queryFn: () => (viewVouchers ? getVouchers("PHOTOSHOOT", viewVouchers.id) : []),
    enabled: !!viewVouchers,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      toast({ title: "Booking created successfully" });
      queryClient.invalidateQueries({ queryKey: ["bookings", "photoshoots"] });
      handleCloseAddModal();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create booking", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBooking,
    onSuccess: () => {
      toast({ title: "Booking updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["bookings", "photoshoots"] });
      setEditBooking(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to update booking", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => delBooking("photoshoots", id),
    onSuccess: () => {
      toast({ title: "Booking deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["bookings", "photoshoots"] });
      setDeleteBooking(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete booking", description: error.message, variant: "destructive" });
    },
  });

  // Handlers
  const handleMemberSearch = useCallback((searchTerm: string) => {
    setMemberSearch(searchTerm);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchMembersFn();
        setShowMemberResults(true);
      } else {
        setShowMemberResults(false);
      }
    }, 300);
  }, [searchMembersFn]);

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setMemberSearch("");
    setShowMemberResults(false);
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setMemberSearch("");
    setShowMemberResults(false);
  };

  const handleViewVouchers = (booking: PhotoshootBooking) => {
    setViewVouchers(booking);
  };

  // Price Calculation
  useEffect(() => {
    if (selectedPhotoshootId && photoshoots.length > 0) {
      const photoshoot = photoshoots.find(p => p.id.toString() === selectedPhotoshootId);
      if (photoshoot) {
        const price = pricingType === "member" ? Number(photoshoot.memberCharges) : Number(photoshoot.guestCharges);
        setTotalPrice(price);
      }
    }
  }, [selectedPhotoshootId, pricingType, photoshoots]);

  const resetForm = () => {
    setSelectedMember(null);
    setSelectedPhotoshootId("");
    setSelectedDateTime(null);
    setPricingType("member");
    setPaymentStatus("UNPAID");
    setPaidAmount(0);
    setTotalPrice(0);
    setMemberSearch("");
    setShowMemberResults(false);
    setGuestSec({
      paidBy: "",
      guestName: "",
      guestContact: ""
    });
  };

  const handleCloseAddModal = () => {
    setIsAddOpen(false);
    resetForm();
  };

  const handleCloseEditModal = () => {
    setEditBooking(null);
    resetForm();
  };

  const handleCreate = () => {
    if (!selectedMember || !selectedPhotoshootId || !selectedDateTime) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const payload = {
      category: "Photoshoot",
      membershipNo: selectedMember.Membership_No,
      entityId: selectedPhotoshootId,
      checkIn: format(selectedDateTime, "yyyy-MM-dd"),
      timeSlot: format(selectedDateTime, "yyyy-MM-dd'T'HH:mm:ss"),
      totalPrice: totalPrice.toString(),
      paymentStatus,
      pricingType,
      paidAmount: paymentStatus === "HALF_PAID" ? paidAmount : (paymentStatus === "PAID" ? totalPrice : 0),
      pendingAmount: totalPrice - (paymentStatus === "HALF_PAID" ? paidAmount : (paymentStatus === "PAID" ? totalPrice : 0)),
      paymentMode: "CASH",
      paidBy: guestSec.paidBy,
      guestName: guestSec.guestName,
      guestContact: guestSec.guestContact?.toString()
    };

    createMutation.mutate(payload);
  };

  const handleUpdate = () => {
    if (!editBooking) return;

    const payload = {
      category: "Photoshoot",
      id: editBooking.id,
      membershipNo: editBooking.member.Membership_No,
      entityId: selectedPhotoshootId || editBooking.photoshootId.toString(),
      checkIn: selectedDateTime ? format(selectedDateTime, "yyyy-MM-dd") : new Date(editBooking.bookingDate).toISOString().split('T')[0],
      timeSlot: selectedDateTime ? format(selectedDateTime, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
      totalPrice: totalPrice.toString(),
      paymentStatus,
      pricingType,
      paidAmount: paymentStatus === "HALF_PAID" ? paidAmount : (paymentStatus === "PAID" ? totalPrice : 0),
      pendingAmount: totalPrice - (paymentStatus === "HALF_PAID" ? paidAmount : (paymentStatus === "PAID" ? totalPrice : 0)),
      paymentMode: "CASH",
      paidBy: guestSec.paidBy,
      guestName: guestSec.guestName,
      guestContact: guestSec.guestContact?.toString()
    };

    updateMutation.mutate(payload);
  };

  // Populate edit form
  useEffect(() => {
    if (editBooking) {
      setSelectedMember(editBooking.member);
      setSelectedPhotoshootId(editBooking.photoshootId.toString());
      // Handle date parsing correctly
      const date = new Date(editBooking.bookingDate);
      // if (editBooking.startTime) {
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      setSelectedDateTime(local);
      // }
      // setSelectedDateTime(date);

      setPricingType(editBooking.pricingType);
      setPaymentStatus(editBooking.paymentStatus);
      setPaidAmount(Number(editBooking.paidAmount));
      setTotalPrice(Number(editBooking.totalPrice));
      setGuestSec({
        paidBy: editBooking.paidBy || "",
        guestName: editBooking.guestName || "",
        guestContact: editBooking.guestContact || ""
      });
    }
  }, [editBooking]);

  const filteredBookings = statusFilter === "ALL"
    ? bookings
    : bookings.filter(b => b.paymentStatus === statusFilter);

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID": return <Badge className="bg-green-600">Paid</Badge>;
      case "HALF_PAID": return <Badge className="bg-yellow-600">Half Paid</Badge>;
      case "UNPAID": return <Badge variant="destructive">Unpaid</Badge>;
      case "TO_BILL": return <Badge className="bg-blue-600 text-white">To Bill</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getVoucherBadge = (type: string) => {
    switch (type) {
      case "FULL_PAYMENT":
        return <Badge className="bg-green-100 text-green-800">Full Payment</Badge>;
      case "HALF_PAYMENT":
        return <Badge className="bg-blue-100 text-blue-800">Half Payment</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getVoucherStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format time display
  const formatTimeDisplay = (timeString: string) => {
    if (!timeString) return "";
    // If it's a full date string
    if (timeString.includes('T')) {
      return format(new Date(timeString), "hh:mm a");
    }
    // If it's HH:mm:ss
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));
    return format(date, "hh:mm a");
  };

  // Format date display
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "PPP");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Photoshoot Bookings</h2>
          <p className="text-muted-foreground">Manage studio photoshoot sessions</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) handleCloseAddModal();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Photoshoot Booking</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <MemberSearchComponent
                  searchTerm={memberSearch}
                  onSearchChange={handleMemberSearch}
                  showResults={showMemberResults}
                  searchResults={searchResults}
                  isSearching={isSearching}
                  selectedMember={selectedMember}
                  onSelectMember={handleSelectMember}
                  onClearMember={handleClearMember}
                  onFocus={() => { }}
                />
                <div>
                  <Label>Photoshoot Service</Label>
                  <Select value={selectedPhotoshootId} onValueChange={setSelectedPhotoshootId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {photoshoots.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Calendar Time Picker - spans both columns */}
                <div className="md:col-span-2">
                  <Label className="text-lg font-semibold">Select Date & Time</Label>
                  <div className="mt-2 border rounded-lg p-4">
                    <UnifiedDatePicker
                      mode="datetime"
                      value={selectedDateTime}
                      onChange={setSelectedDateTime}
                      label=""
                    />
                  </div>
                </div>

                <div>
                  <Label>Pricing Type</Label>
                  <Select value={pricingType} onValueChange={setPricingType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {pricingType == "guest" && <div className="p-4 rounded-xl border bg-white shadow-sm col-span-full">

                  <h3 className="text-lg font-semibold mb-4">Guest Information</h3>

                  <div className="flex  flex-col">

                    <div className="flex items-center justify-center gap-x-5">

                      <div className="w-1/2">
                        <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
                          Guest Name *
                        </Label>
                        {/* {console.log(form)} */}

                        <FormInput
                          label=""
                          type="text"
                          value={guestSec.guestName}
                          onChange={(val) => setGuestSec((prev) => ({ ...prev, guestName: val }))}
                        />
                      </div>

                      <div className="w-1/2">
                        <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
                          Contact
                        </Label>

                        <FormInput
                          label=""
                          type="number"
                          value={guestSec.guestContact}
                          onChange={(val) => setGuestSec((prev) => ({ ...prev, guestContact: val }))}
                          min="0"
                        />
                      </div>

                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <Label className="text-sm font-medium my-2 block whitespace-nowrap">
                        Who will Pay?
                      </Label>
                      <Select
                        value={guestSec.paidBy}
                        onValueChange={(val) => setGuestSec((prev) => ({ ...prev, paidBy: val }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Who will pay?" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="GUEST">Guest</SelectItem>
                        </SelectContent>
                      </Select>


                    </div>

                  </div>
                </div>}

                {/* Accounting Summary Section */}
                {/* <div className="md:col-span-2">
                  <Label>Total Price</Label>
                  <Input type="text" className="mt-2 font-bold text-lg" value={`PKR ${totalPrice.toLocaleString()}`} disabled />
                </div> */}

                <PhotoshootPaymentSection
                  form={{
                    paymentStatus: paymentStatus,
                    totalPrice: totalPrice,
                    paidAmount: paidAmount,
                    pendingAmount: totalPrice - paidAmount
                  }}
                  onChange={(field, value) => {
                    if (field === "paymentStatus") {
                      setPaymentStatus(value);
                      if (value === "PAID") {
                        setPaidAmount(totalPrice);
                      } else if (value === "UNPAID") {
                        setPaidAmount(0);
                      } else if (value === "HALF_PAID") {
                        if (paidAmount === 0) {
                          setPaidAmount(totalPrice / 2);
                        }
                      }
                    } else if (field === "paidAmount") {
                      setPaidAmount(value);
                    }
                  }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseAddModal}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingBookings ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      <span>Loading bookings...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Calendar className="h-12 w-12 mb-4 opacity-50" />
                      <p>No bookings found</p>
                      <p className="text-sm">Create your first photoshoot booking to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <div className="font-semibold">{booking.member?.Name}</div>
                        <div className="text-xs text-muted-foreground">
                          #{booking.member?.Membership_No}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.photoshoot?.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div>{formatDateDisplay(booking.bookingDate)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formatTimeDisplay(booking.startTime)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          to {formatTimeDisplay(booking.endTime)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-green-600">
                        PKR {Number(booking.totalPrice).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Paid: PKR {Number(booking.paidAmount).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPaymentBadge(booking.paymentStatus)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDetailBooking(booking)
                          setOpenDetails(true)
                        }}
                        title="Booking Details">
                        <NotepadText />
                      </Button>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditBooking(booking)}
                          title="Edit Booking"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(booking.paymentStatus === "PAID" || booking.paymentStatus === "HALF_PAID") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewVouchers(booking)}
                            title="View Vouchers"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteBooking(booking)}
                          title="Delete Booking"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* Edit Dialog with Calendar Time Picker */}
      <Dialog open={!!editBooking} onOpenChange={(open) => {
        if (!open) handleCloseEditModal();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Member Information Display */}
            <div className="md:col-span-2">
              <Label>Member Information</Label>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      {editBooking?.member?.Name}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {editBooking?.member?.Membership_No && `Membership: #${editBooking.member.Membership_No}`}
                      {editBooking?.member?.Balance !== undefined && (
                        <div className="mt-1 space-y-1">
                          <Badge
                            variant={editBooking.member.Balance >= 0 ? "outline" : "destructive"}
                            className="bg-blue-100 text-blue-800"
                          >
                            Account Balance: PKR {editBooking.member.Balance.toLocaleString()}
                          </Badge>
                          <div className="text-xs">
                            <span className="text-green-700">
                              DR: PKR {editBooking.member.drAmount?.toLocaleString() || "0"}
                            </span>
                            {" • "}
                            <span className="text-red-700">
                              CR: PKR {editBooking.member.crAmount?.toLocaleString() || "0"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Current Booking
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Label>Service</Label>
              <Select value={selectedPhotoshootId} onValueChange={setSelectedPhotoshootId}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {photoshoots.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar Time Picker for Edit */}
            <div className="md:col-span-2">
              <Label className="text-lg font-semibold">Select New Date & Time</Label>
              <div className="mt-2 border rounded-lg p-4">
                <UnifiedDatePicker
                  mode="datetime"
                  value={selectedDateTime}
                  onChange={setSelectedDateTime}
                  label=""
                />
              </div>
            </div>

            <div>
              <Label>Pricing Type</Label>
              <Select value={pricingType} onValueChange={setPricingType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div></div>
            {pricingType == "guest" && <div className="p-4 rounded-xl border bg-white shadow-sm col-span-full">

              <h3 className="text-lg font-semibold mb-4">Guest Information</h3>

              <div className="flex  flex-col">

                <div className="flex items-center justify-center gap-x-5">

                  <div className="w-1/2">
                    <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
                      Guest Name *
                    </Label>
                    {/* {console.log(form)} */}

                    <FormInput
                      label=""
                      type="text"
                      value={guestSec.guestName}
                      onChange={(val) => setGuestSec((prev) => ({ ...prev, guestName: val }))}
                    />
                  </div>

                  <div className="w-1/2">
                    <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
                      Contact
                    </Label>

                    <FormInput
                      label=""
                      type="number"
                      value={guestSec.guestContact}
                      onChange={(val) => setGuestSec((prev) => ({ ...prev, guestContact: val }))}
                      min="0"
                    />
                  </div>

                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <Label className="text-sm font-medium my-2 block whitespace-nowrap">
                    Who will Pay?
                  </Label>
                  <Select
                    value={guestSec.paidBy}
                    onValueChange={(val) => setGuestSec((prev) => ({ ...prev, paidBy: val }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Who will pay?" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="GUEST">Guest</SelectItem>
                    </SelectContent>
                  </Select>


                </div>

              </div>
            </div>}

            {/* Accounting Summary Section for Edit */}
            <PhotoshootPaymentSection
              form={{
                paymentStatus: paymentStatus,
                totalPrice: totalPrice,
                paidAmount: paidAmount,
                pendingAmount: totalPrice - paidAmount
              }}
              onChange={(field, value) => {
                if (field === "paymentStatus") {
                  setPaymentStatus(value);
                  if (value === "PAID") {
                    setPaidAmount(totalPrice);
                  } else if (value === "UNPAID") {
                    setPaidAmount(0);
                  } else if (value === "HALF_PAID") {
                    if (paidAmount === 0) {
                      setPaidAmount(totalPrice / 2);
                    }
                  }
                } else if (field === "paidAmount") {
                  setPaidAmount(value);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditModal}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* booking details */}
      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="p-0 max-w-5xl min-w-4xl overflow-hidden">
          {detailBooking && (
            <PhotoshootBookingDetailsCard
              booking={detailBooking}
              className="rounded-none border-0 shadow-none"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Vouchers Dialog */}
      <Dialog open={!!viewVouchers} onOpenChange={(open) => {
        if (!open) setViewVouchers(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Vouchers</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoadingVouchers ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No vouchers generated yet.</p>
                <p className="text-sm">
                  Vouchers will be created when payments are made.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {vouchers.map((voucher) => (
                  <div key={voucher.id} className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getVoucherBadge(voucher.voucher_type)}
                          {getVoucherStatusBadge(voucher.status)}
                        </div>
                        <div className="text-sm font-mono text-muted-foreground">
                          Voucher #: {voucher.voucher_no}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          PKR {parseFloat(voucher.amount).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {voucher.payment_mode?.toLowerCase() || "cash"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <div className="font-medium">Booking Type</div>
                        <div>{voucher.booking_type}</div>
                      </div>
                      <div>
                        <div className="font-medium">Membership No</div>
                        <div>{voucher.membership_no}</div>
                      </div>
                      <div>
                        <div className="font-medium">Issued By</div>
                        <div>{voucher.issued_by || "—"}</div>
                      </div>
                      <div>
                        <div className="font-medium">Issued At</div>
                        <div>
                          {voucher.issued_at
                            ? new Date(voucher.issued_at).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>
                    </div>

                    {voucher.transaction_id && (
                      <div className="mt-2 text-sm">
                        <div className="font-medium">Transaction ID</div>
                        <div className="font-mono text-muted-foreground">
                          {voucher.transaction_id}
                        </div>
                      </div>
                    )}

                    {voucher.remarks && (
                      <div className="mt-3 p-2 bg-white border rounded text-sm">
                        <div className="font-medium">Remarks</div>
                        <div className="text-muted-foreground">
                          {voucher.remarks}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewVouchers(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteBooking} onOpenChange={() => setDeleteBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this booking?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBooking(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteBooking && deleteMutation.mutate(deleteBooking.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}