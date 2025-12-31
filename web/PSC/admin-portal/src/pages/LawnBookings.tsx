import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, XCircle, Loader2, User, Search, Receipt, NotepadText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLawnCategories, getBookings, createBooking, updateBooking, deleteBooking, searchMembers, getVouchers } from "../../config/apis";
import { FormInput } from "@/components/FormInputs";
import { UnifiedDatePicker } from "@/components/UnifiedDatePicker";
import { format } from "date-fns";
import { LawnBookingDetailsCard } from "@/components/details/LawnBookingDets";

interface Member {
  id: number;
  Name: string;
  Membership_No: string;
  Balance?: number;
  drAmount?: number;
  crAmount?: number;
}

interface LawnCategory {
  id: number;
  category: string;
  images: Array<{ url: string; publicId: string }>;
  lawns: Lawn[];
}

interface Lawn {
  id: number;
  description: string;
  lawnCategoryId: number;
  minGuests: number;
  maxGuests: number;
  images: any[];
  memberCharges: string;
  guestCharges: string;
  isActive: boolean;
  isOutOfService: boolean;
  outOfServiceReason: string | null;
  outOfServiceFrom: string | null;
  outOfServiceTo: string | null;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LawnBooking {
  id: number;
  memberName: string;
  lawn: {
    id: string,
    description: string,
    outOfOrders?: any[],
    lawnCategory: {
      id: number
    }
  };
  lawnCategoryId?: number | string
  lawnId?: string;
  bookingDate: string;
  guestsCount: number;
  totalPrice: number;
  pendingAmount: number;
  paymentStatus: string;
  pricingType?: string;
  paidAmount?: number;
  membershipNo?: string;
  entityId?: string;
  member?: Member;
  bookingTime?: string;
  paidBy?: string;
  guestName?: string;
  guestContact?: string;
  eventType?: string;
  createdAt?: string;
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


// Add this component before the LawnBookings component
const LawnPaymentSection = React.memo(
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

LawnPaymentSection.displayName = "LawnPaymentSection";

export default function LawnBookings() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<LawnBooking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<LawnBooking | null>(null);
  const [viewVouchers, setViewVouchers] = useState<LawnBooking | null>(null);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [selectedLawnCategory, setSelectedLawnCategory] = useState("");
  const [selectedLawn, setSelectedLawn] = useState("");
  const [pricingType, setPricingType] = useState("member");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [paidAmount, setPaidAmount] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [bookingDate, setBookingDate] = useState("");
  const [guestCount, setGuestCount] = useState(0);
  const [eventTime, setEventTime] = useState("NIGHT");
  const [eventType, setEventType] = useState("");

  const [detailBooking, setDetailBooking] = useState<LawnBooking | null>(null);
  const [openDetails, setOpenDetails] = useState(false)

  const [guestSec, setGuestSec] = useState({
    paidBy: "MEMBER",
    guestName: "",
    guestContact: ""
  })

  // Member search states
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberResults, setShowMemberResults] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch lawn categories
  const {
    data: lawnCategories = [],
    isLoading: isLoadingCategories,
  } = useQuery<LawnCategory[]>({
    queryKey: ["lawn-categories"],
    queryFn: async () => await getLawnCategories(),
  });

  // Fetch lawn bookings
  const {
    data: lawnBookings = [],
    isLoading: isLoadingBookings,
  } = useQuery<LawnBooking[]>({
    queryKey: ["lawn-bookings"],
    queryFn: async () => await getBookings("lawns"),
  });

  console.log(lawnBookings)

  // Fetch available lawns when category is selected
  const {
    data: availableLawnsData = [],
    isLoading: isLoadingLawns,
  } = useQuery({
    queryKey: ["available-lawns", selectedLawnCategory],
    queryFn: async () => {
      if (!selectedLawnCategory) return [];
      const category = lawnCategories.find(cat => cat.category === selectedLawnCategory);
      if (!category) return [];

      return category.lawns;
    },
    enabled: !!selectedLawnCategory,
  });

  // Member search query
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
    queryKey: ["lawn-vouchers", viewVouchers?.id],
    queryFn: () => (viewVouchers ? getVouchers("LAWN", viewVouchers.id) : []),
    enabled: !!viewVouchers,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => createBooking(data),
    onSuccess: () => {
      toast({ title: "Lawn booking created successfully" });
      queryClient.invalidateQueries({ queryKey: ["lawn-bookings"] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create lawn booking",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateBooking(data),
    onSuccess: () => {
      toast({ title: "Lawn booking updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["lawn-bookings"] });
      setEditBooking(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update lawn booking",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ bookingFor, bookID }: { bookingFor: string; bookID: string }) =>
      deleteBooking(bookingFor, bookID),
    onSuccess: () => {
      toast({ title: "Lawn booking cancelled successfully" });
      queryClient.invalidateQueries({ queryKey: ["lawn-bookings"] });
      setCancelBooking(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel lawn booking",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Member search handler with debouncing
  const handleMemberSearch = useCallback((searchTerm: string) => {
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
  }, [searchMembersFn]);

  const handleSearchFocus = useCallback(() => {
    if (memberSearch.length >= 2 && searchResults.length > 0) {
      setShowMemberResults(true);
    }
  }, [memberSearch.length, searchResults.length]);

  const handleSelectMember = useCallback((member: Member) => {
    setSelectedMember(member);
    setMemberSearch("");
    setShowMemberResults(false);
  }, []);

  const handleClearMember = useCallback(() => {
    setSelectedMember(null);
    setMemberSearch("");
    setShowMemberResults(false);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const calculateLawnPrice = (lawnId: string, pricing: string) => {
    const lawn = availableLawnsData.find((l: Lawn) => l.id.toString() === lawnId);
    if (!lawn) return 0;
    return pricing === "member" ? parseInt(lawn.memberCharges) : parseInt(lawn.guestCharges);
  };

  // Filter available lawns based on active status and service status
  const availableLawns = useMemo(() => {
    return availableLawnsData.filter((lawn: Lawn) =>
      lawn.isActive && !lawn.isOutOfService && !lawn.isBooked
    );
  }, [availableLawnsData]);

  const filteredBookings = paymentFilter === "ALL"
    ? lawnBookings
    : lawnBookings.filter(b => b.paymentStatus === paymentFilter);

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case "HALF_PAID":
        return <Badge className="bg-warning text-warning-foreground">Half Paid</Badge>;
      case "UNPAID":
        return <Badge variant="destructive">Unpaid</Badge>;
      case "TO_BILL":
        return <Badge className="bg-blue-600 text-white">To Bill</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTimeSlotBadge = (timeSlot: string) => {
    switch (timeSlot) {
      case "MORNING":
        return <Badge className="bg-blue-100 text-blue-800">Morning</Badge>;
      case "EVENING":
        return <Badge className="bg-orange-100 text-orange-800">Evening</Badge>;
      case "NIGHT":
        return <Badge className="bg-purple-100 text-purple-800">Night</Badge>;
      default:
        return <Badge>{timeSlot}</Badge>;
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

  const handleLawnCategoryChange = (value: string) => {
    setSelectedLawnCategory(value);
    setSelectedLawn("");
    setCalculatedPrice(0);
  };

  const handleLawnChange = (value: string) => {
    setSelectedLawn(value);
    setCalculatedPrice(calculateLawnPrice(value, pricingType));
  };

  const handlePricingTypeChange = (value: string) => {
    setPricingType(value);
    if (selectedLawn) {
      setCalculatedPrice(calculateLawnPrice(selectedLawn, value));
    }
  };

  const resetForm = () => {
    setSelectedLawnCategory("");
    setSelectedLawn("");
    setCalculatedPrice(0);
    setPaymentStatus("UNPAID");
    setPaidAmount(0);
    setPricingType("member");
    setBookingDate("");
    setGuestCount(0);
    setEventTime("NIGHT");
    setEventType("");
    setSelectedMember(null);
    setMemberSearch("");
    setShowMemberResults(false);
    setGuestSec({
      paidBy: "",
      guestName: "",
      guestContact: ""
    });
  };

  const handleCreateBooking = () => {
    if (!selectedMember || !selectedLawn || !bookingDate || !eventType || guestCount < 1) {
      toast({
        title: "Please fill all required fields",
        description: "Member, lawn, booking date, event type, and guest count are required",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    const selectedLawnData = availableLawns.find((l: Lawn) => l.id.toString() === selectedLawn);
    if (!selectedLawnData) return;

    if (guestCount < selectedLawnData.minGuests || guestCount > selectedLawnData.maxGuests) {
      toast({
        title: "Invalid guest count",
        description: `Guest count must be between ${selectedLawnData.minGuests} and ${selectedLawnData.maxGuests} for this lawn`,
        variant: "destructive",
      });
      return;
    }

    const payload = {
      category: "Lawn",
      membershipNo: selectedMember.Membership_No,
      entityId: selectedLawn,
      bookingDate: new Date(bookingDate).toISOString(),
      totalPrice: calculatedPrice.toString(),
      paymentStatus: paymentStatus,
      numberOfGuests: guestCount,
      paidAmount: paidAmount,
      pendingAmount: calculatedPrice - paidAmount,
      pricingType: pricingType,
      paymentMode: "CASH",
      eventTime: eventTime,
      eventType: eventType,
      paidBy: guestSec.paidBy,
      guestName: guestSec.guestName,
      guestContact: guestSec.guestContact
    };

    createMutation.mutate(payload);
  };


  const handleDeleteBooking = () => {
    if (cancelBooking) {
      deleteMutation.mutate({
        bookingFor: "lawns",
        bookID: cancelBooking.id.toString(),
      });
    }
  };

  const handleViewVouchers = (booking: LawnBooking) => {
    setViewVouchers(booking);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Lawn Bookings</h2>
          <p className="text-muted-foreground">Manage outdoor lawn reservations</p>
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
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Lawn Booking</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {/* Member Search */}
                <div className="md:col-span-2">
                  <Label>Member *</Label>
                  <div className="relative mt-2">
                    {selectedMember ? (
                      <div className="p-3 border border-green-200 bg-green-50 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium flex items-center">
                              <User className="h-4 w-4 mr-2 text-green-600" />
                              {selectedMember.Name}
                            </div>
                            <div className="text-sm text-green-600 mt-1">
                              Membership: #{selectedMember.Membership_No}
                              {selectedMember.Balance !== undefined && (
                                <div className="mt-1">
                                  <Badge
                                    variant={selectedMember.Balance >= 0 ? "outline" : "destructive"}
                                    className="bg-green-100 text-green-800"
                                  >
                                    Balance: PKR {selectedMember.Balance.toLocaleString()}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearMember}
                            className="text-destructive hover:text-destructive"
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search member by name or membership number..."
                            className="pl-10 pr-10"
                            value={memberSearch}
                            onChange={(e) => handleMemberSearch(e.target.value)}
                            onFocus={handleSearchFocus}
                          />
                          {isSearching && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        {showMemberResults && (
                          <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.length === 0 ? (
                              <div className="p-4 text-center text-muted-foreground">
                                No members found
                              </div>
                            ) : (
                              searchResults.map((member) => (
                                <div
                                  key={member.id}
                                  className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                                  onClick={() => handleSelectMember(member)}
                                >
                                  <div className="font-medium">{member.Name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Membership: #{member.Membership_No}
                                    {member.Balance !== undefined && (
                                      <span className={`ml-2 ${member.Balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Balance: PKR {member.Balance.toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Lawn Category *</Label>
                  {isLoadingCategories ? (
                    <div className="h-10 bg-muted animate-pulse rounded-md mt-2" />
                  ) : (
                    <Select value={selectedLawnCategory} onValueChange={handleLawnCategoryChange}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select lawn category" />
                      </SelectTrigger>
                      <SelectContent>
                        {lawnCategories.map((cat: LawnCategory) => (
                          <SelectItem key={cat.id} value={cat.category}>{cat.category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label>Lawn *</Label>
                  {isLoadingLawns ? (
                    <div className="h-10 bg-muted animate-pulse rounded-md mt-2" />
                  ) : (
                    <Select
                      value={selectedLawn}
                      onValueChange={handleLawnChange}
                      disabled={!selectedLawnCategory || availableLawns.length === 0}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue
                          placeholder={
                            !selectedLawnCategory
                              ? "Select category first"
                              : availableLawns.length === 0
                                ? "No available lawns"
                                : "Select lawn"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLawns.map((lawn: Lawn) => (
                          <SelectItem key={lawn.id} value={lawn.id.toString()}>
                            <div className="flex flex-col">
                              <span>{lawn.description}</span>
                              <span className="text-xs text-muted-foreground">
                                Capacity: {lawn.minGuests}-{lawn.maxGuests} guests
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Member: PKR {parseInt(lawn.memberCharges).toLocaleString()} |
                                Guest: PKR {parseInt(lawn.guestCharges).toLocaleString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label>Event Time *</Label>
                  <Select value={eventTime} onValueChange={setEventTime}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">Morning (8 AM - 12 PM)</SelectItem>
                      <SelectItem value="EVENING">Evening (4 PM - 8 PM)</SelectItem>
                      <SelectItem value="NIGHT">Night (8 PM - 12 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pricing Type</Label>
                  <Select value={pricingType} onValueChange={handlePricingTypeChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Booking Date *</Label>
                  <UnifiedDatePicker
                    value={bookingDate}
                    onChange={(date) => {
                      const dateStr = date ? format(date, "yyyy-MM-dd") : "";
                      setBookingDate(dateStr);
                    }}
                    placeholder="Select booking date"
                    minDate={new Date()}
                  />
                </div>
                <div>
                  <Label>Event Type *</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mehandi">Mehandi</SelectItem>
                      <SelectItem value="barat">Barat</SelectItem>
                      <SelectItem value="walima">Walima</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="corporate">Corporate Event</SelectItem>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Guest Count *</Label>
                  <Input
                    type="number"
                    placeholder="150"
                    className="mt-2"
                    value={guestCount || ""}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                    min={selectedLawn ? availableLawns.find((l: Lawn) => l.id.toString() === selectedLawn)?.minGuests || 1 : 1}
                    max={selectedLawn ? availableLawns.find((l: Lawn) => l.id.toString() === selectedLawn)?.maxGuests : undefined}
                  />
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

                <LawnPaymentSection
                  form={{
                    paymentStatus: paymentStatus,
                    totalPrice: calculatedPrice,
                    paidAmount: paidAmount,
                    pendingAmount: calculatedPrice - paidAmount
                  }}
                  onChange={(field, value) => {
                    if (field === "paymentStatus") {
                      setPaymentStatus(value);
                      // Recalculate amounts when payment status changes
                      if (value === "PAID") {
                        setPaidAmount(calculatedPrice);
                      } else if (value === "UNPAID") {
                        setPaidAmount(0);
                      } else if (value === "HALF_PAID") {
                        // Set to half if no amount is set yet
                        if (paidAmount === 0) {
                          setPaidAmount(calculatedPrice / 2);
                        }
                      }
                    } else if (field === "paidAmount") {
                      setPaidAmount(value);
                    }
                  }}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBooking}
                  disabled={!selectedMember || !selectedLawn || calculatedPrice === 0 || createMutation.isPending}
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

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoadingBookings ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground text-lg">
              No lawn bookings found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Lawn</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.member?.Name || booking.memberName}
                      {booking.member?.Membership_No && (
                        <div className="text-xs text-muted-foreground">
                          #{booking.member.Membership_No}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{booking.lawn?.description}</TableCell>
                    <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.eventType}</TableCell>
                    <TableCell>
                      {getTimeSlotBadge(booking.bookingTime || "NIGHT")}
                    </TableCell>
                    <TableCell>{booking.guestsCount}</TableCell>
                    <TableCell>PKR {booking.totalPrice.toLocaleString()}</TableCell>
                    <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDetailBooking(booking)
                            setOpenDetails(true)
                          }}
                          title="Booking Details">
                          <NotepadText />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          // Find the lawn to get its category ID
                          const lawn = lawnCategories
                            .flatMap((cat: LawnCategory) => cat.lawns)
                            .find((l: Lawn) => l.id.toString() === booking.lawn?.id);

                          setEditBooking({
                            ...booking,
                            lawn: {
                              ...booking.lawn,
                            }
                          });
                        }} title="Edit Booking">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(booking.paymentStatus === "PAID" || booking.paymentStatus === "HALF_PAID") && (
                          <Button variant="ghost" size="icon" onClick={() => handleViewVouchers(booking)} title="View Vouchers">
                            <Receipt className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setCancelBooking(booking)} title="Cancel Booking">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editBooking} onOpenChange={() => setEditBooking(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Member Information Display (Read-only) */}
            <div className="md:col-span-2">
              <Label>Member Information</Label>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      {editBooking?.member?.Name || editBooking?.memberName}
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
              <Label>Lawn Category *</Label>
              <Select
                value={editBooking?.lawn?.lawnCategory?.id?.toString() || ""}
                onValueChange={(categoryId) => {
                  if (!editBooking) return;
                  setEditBooking(prev => prev ? {
                    ...prev,
                    lawn: {
                      ...prev.lawn,
                      lawnCategory: { id: parseInt(categoryId) },
                      id: "",
                      description: ""
                    }
                  } : null);
                }}
              >
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
            </div>
            <div>
              <Label>Lawn *</Label>
              <Select
                value={editBooking?.lawn?.id?.toString() || ""}
                onValueChange={(lawnId) => {
                  if (!editBooking) return;
                  const oldTotal = editBooking.totalPrice || 0;
                  const oldPaid = editBooking.paidAmount || 0;
                  const oldPaymentStatus = editBooking.paymentStatus;
                  const lawn = lawnCategories.flatMap((cat: LawnCategory) => cat.lawns).find((l: Lawn) => l.id.toString() === lawnId);
                  if (!lawn) return;
                  const newPrice = editBooking.pricingType === "member" ? parseInt(lawn.memberCharges) : parseInt(lawn.guestCharges);
                  let newPaidAmount = oldPaid;
                  let newPendingAmount = newPrice - oldPaid;
                  let newPaymentStatus = oldPaymentStatus;

                  // AUTO-ADJUST PAYMENT STATUS
                  if (newPrice < oldPaid) {
                    newPaymentStatus = "PAID";
                    newPaidAmount = newPrice;
                    newPendingAmount = 0;
                  } else if (newPrice > oldPaid && oldPaymentStatus === "PAID") {
                    newPaymentStatus = "HALF_PAID";
                    newPaidAmount = oldPaid;
                    newPendingAmount = newPrice - oldPaid;
                  } else if (newPrice > oldTotal && (oldPaymentStatus === "HALF_PAID" || oldPaymentStatus === "UNPAID")) {
                    newPaidAmount = oldPaid;
                    newPendingAmount = newPrice - oldPaid;
                  } else {
                    if (oldPaymentStatus === "PAID") {
                      newPaidAmount = newPrice;
                      newPendingAmount = 0;
                    } else if (oldPaymentStatus === "HALF_PAID") {
                      newPaidAmount = oldPaid;
                      newPendingAmount = newPrice - oldPaid;
                    } else {
                      newPaidAmount = 0;
                      newPendingAmount = newPrice;
                    }
                  }

                  setEditBooking(prev => prev ? {
                    ...prev,
                    lawn: { ...lawn, id: lawnId, lawnCategory: { id: lawn.lawnCategoryId } },
                    totalPrice: newPrice,
                    paidAmount: newPaidAmount,
                    pendingAmount: newPendingAmount,
                    paymentStatus: newPaymentStatus,
                    lawnId: lawnId,
                    entityId: lawnId
                  } : null);
                }}
                disabled={!editBooking?.lawn?.lawnCategory?.id}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={!editBooking?.lawn?.lawnCategory?.id ? "Select category first" : "Select lawn"} />
                </SelectTrigger>
                <SelectContent>
                  {lawnCategories.find((cat: LawnCategory) => cat.id.toString() === editBooking?.lawn?.lawnCategory?.id?.toString())?.lawns.filter((lawn: Lawn) => lawn.isActive && !lawn.isOutOfService).map((lawn: Lawn) => (
                    <SelectItem key={lawn.id} value={lawn.id.toString()}>
                      <div className="flex flex-col">
                        <span>{lawn.description}</span>
                        <span className="text-xs text-muted-foreground">Capacity: {lawn.minGuests}-{lawn.maxGuests} guests</span>
                        <span className="text-xs text-muted-foreground">Member: PKR {parseInt(lawn.memberCharges).toLocaleString()} | Guest: PKR {parseInt(lawn.guestCharges).toLocaleString()}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Booking Date</Label>
              <UnifiedDatePicker
                value={editBooking?.bookingDate ? new Date(editBooking.bookingDate) : undefined}
                onChange={(date) => {
                  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
                  setEditBooking(prev => prev ? { ...prev, bookingDate: dateStr } : null);
                }}
                placeholder="Select booking date"
                minDate={new Date()}
              />
            </div>
            <div>
              <Label>Event Type</Label>
              <Select
                value={editBooking?.eventType || ""}
                onValueChange={(val) => setEditBooking(prev => prev ? { ...prev, eventType: val } : null)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mehandi">Mehandi</SelectItem>
                  <SelectItem value="barat">Barat</SelectItem>
                  <SelectItem value="walima">Walima</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Event Time</Label>
              <Select
                value={editBooking?.bookingTime || "NIGHT"}
                onValueChange={(value) => setEditBooking(prev => prev ? { ...prev, bookingTime: value } : null)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORNING">Morning (8 AM - 12 PM)</SelectItem>
                  <SelectItem value="EVENING">Evening (4 PM - 8 PM)</SelectItem>
                  <SelectItem value="NIGHT">Night (8 PM - 12 AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Guest Count</Label>
              <Input
                type="number"
                value={editBooking?.guestsCount || ""}
                onChange={(e) => setEditBooking(prev => prev ? { ...prev, guestsCount: parseInt(e.target.value) || 0 } : null)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Pricing Type</Label>
              <Select
                value={editBooking?.pricingType || "member"}
                onValueChange={(value) => {
                  if (!editBooking) return;

                  const oldTotal = editBooking.totalPrice || 0;
                  const oldPaid = editBooking.paidAmount || 0;
                  const oldPaymentStatus = editBooking.paymentStatus;

                  // Find the lawn to get pricing
                  const lawn = lawnCategories
                    .flatMap((cat: LawnCategory) => cat.lawns)
                    .find((l: Lawn) => l.id.toString() === editBooking.lawn?.id.toString());

                  if (!lawn) {
                    setEditBooking(prev => prev ? { ...prev, pricingType: value } : null);
                    return;
                  }

                  // Calculate new price
                  const newPrice = value === "member"
                    ? parseInt(lawn.memberCharges)
                    : parseInt(lawn.guestCharges);

                  let newPaidAmount = oldPaid;
                  let newPendingAmount = newPrice - oldPaid;
                  let newPaymentStatus = oldPaymentStatus;

                  // AUTO-ADJUST PAYMENT STATUS BASED ON PRICE CHANGES
                  // Scenario 1: Price DECREASED (refund scenario)
                  if (newPrice < oldPaid) {
                    // Keep PAID status - backend will handle refund voucher
                    newPaymentStatus = "PAID";
                    newPaidAmount = newPrice;
                    newPendingAmount = 0;
                  }
                  // Scenario 2: Price INCREASED and was previously PAID
                  else if (newPrice > oldPaid && oldPaymentStatus === "PAID") {
                    // Auto-change to HALF_PAID
                    newPaymentStatus = "HALF_PAID";
                    newPaidAmount = oldPaid; // Keep amount already paid
                    newPendingAmount = newPrice - oldPaid;
                  }
                  // Scenario 3: Price INCREASED but was HALF_PAID or UNPAID
                  else if (newPrice > oldTotal && (oldPaymentStatus === "HALF_PAID" || oldPaymentStatus === "UNPAID")) {
                    // Keep current status, just update amounts
                    newPaidAmount = oldPaid;
                    newPendingAmount = newPrice - oldPaid;
                  }
                  // Scenario 4: Other cases - normal recalculation
                  else {
                    if (oldPaymentStatus === "PAID") {
                      newPaidAmount = newPrice;
                      newPendingAmount = 0;
                    } else if (oldPaymentStatus === "HALF_PAID") {
                      newPaidAmount = oldPaid;
                      newPendingAmount = newPrice - oldPaid;
                    } else {
                      newPaidAmount = 0;
                      newPendingAmount = newPrice;
                    }
                  }

                  setEditBooking(prev => prev ? {
                    ...prev,
                    pricingType: value,
                    totalPrice: newPrice,
                    paidAmount: newPaidAmount,
                    pendingAmount: newPendingAmount,
                    paymentStatus: newPaymentStatus
                  } : null);
                }}
              >
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
            {editBooking?.pricingType == "guest" && <div className="p-4 rounded-xl border bg-white shadow-sm col-span-full">

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
                      value={editBooking.guestName}
                      onChange={(val) => setEditBooking((prev) => ({ ...prev, guestName: val }))}
                    />
                  </div>

                  <div className="w-1/2">
                    <Label className="text-sm font-medium mb-1 block whitespace-nowrap">
                      Contact
                    </Label>

                    <FormInput
                      label=""
                      type="number"
                      value={editBooking.guestContact}
                      onChange={(val) => setEditBooking((prev) => ({ ...prev, guestContact: val }))}
                      min="0"
                    />
                  </div>

                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <Label className="text-sm font-medium my-2 block whitespace-nowrap">
                    Who will Pay?
                  </Label>
                  <Select
                    value={editBooking.paidBy}
                    onValueChange={(val) => setEditBooking((prev) => ({ ...prev, paidBy: val }))}
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

            {/* Payment Section with Accounting Summary */}
            <LawnPaymentSection
              form={{
                paymentStatus: editBooking?.paymentStatus || "UNPAID",
                totalPrice: editBooking?.totalPrice || 0,
                paidAmount: editBooking?.paidAmount || 0,
                pendingAmount: editBooking?.pendingAmount || 0
              }}
              onChange={(field, value) => {
                setEditBooking(prev => {
                  if (!prev) return null;

                  const updated = { ...prev };

                  if (field === "paymentStatus") {
                    updated.paymentStatus = value;
                    // Recalculate amounts when payment status changes
                    if (value === "PAID") {
                      updated.paidAmount = updated.totalPrice;
                      updated.pendingAmount = 0;
                    } else if (value === "UNPAID") {
                      updated.paidAmount = 0;
                      updated.pendingAmount = updated.totalPrice;
                    } else if (value === "HALF_PAID") {
                      // Keep existing paid amount or set to half
                      const currentPaid = updated.paidAmount || 0;
                      if (currentPaid === 0) {
                        updated.paidAmount = updated.totalPrice / 2;
                        updated.pendingAmount = updated.totalPrice / 2;
                      }
                    }
                  } else if (field === "paidAmount") {
                    updated.paidAmount = value;
                    updated.pendingAmount = updated.totalPrice - value;
                  }

                  return updated;
                });
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBooking(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!editBooking) return;

                // VALIDATION
                if (!editBooking.eventType) {
                  toast({ title: "Event type is required", variant: "destructive" });
                  return;
                }
                if (!editBooking.guestsCount || editBooking.guestsCount < 1) {
                  toast({ title: "Guest count must be at least 1", variant: "destructive" });
                  return;
                }
                if (!editBooking.bookingDate) {
                  toast({ title: "Booking date is required", variant: "destructive" });
                  return;
                }

                const membershipNo = editBooking.member?.Membership_No || editBooking.membershipNo || "";
                if (!membershipNo) {
                  toast({ title: "Membership number is missing", variant: "destructive" });
                  return;
                }

                const payload = {
                  id: editBooking.id.toString(),
                  category: "Lawn",
                  membershipNo: membershipNo,
                  entityId: editBooking.lawn?.id?.toString() || editBooking.entityId || "",
                  bookingDate: editBooking.bookingDate,
                  totalPrice: editBooking.totalPrice.toString(),
                  paymentStatus: editBooking.paymentStatus,
                  numberOfGuests: editBooking.guestsCount,
                  paidAmount: editBooking.paidAmount || 0,
                  pendingAmount: editBooking.pendingAmount || 0,
                  pricingType: editBooking.pricingType || "member",
                  paymentMode: "CASH",
                  eventTime: editBooking.bookingTime || "NIGHT",
                  eventType: editBooking.eventType,
                  paidBy: editBooking.paidBy || "MEMBER",
                  guestName: editBooking.guestName,
                  guestContact: editBooking.guestContact?.toString(),
                };

                updateMutation.mutate(payload);
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* booking details */}
      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="p-0 max-w-5xl min-w-4xl overflow-hidden">
          {detailBooking && (
            <LawnBookingDetailsCard
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
      <Dialog open={!!cancelBooking} onOpenChange={() => setCancelBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to cancel this booking for <strong>{cancelBooking?.memberName}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelBooking(null)}>
              No
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBooking}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelling...
                </>
              ) : (
                "Cancel Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}