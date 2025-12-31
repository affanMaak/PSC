import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  Home,
  CreditCard,
  Users,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react";
import { Booking } from "@/types/room-booking.type";

interface OutOfOrderPeriod {
  id: number;
  roomId: number;
  reason: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface RoomType {
  id: number;
  type: string;
}

interface Room {
  id: number;
  roomNumber: string;
  roomType: RoomType;
  outOfOrders: OutOfOrderPeriod[];
}

interface Member {
  Membership_No: string;
  Name: string;
  Balance: number;
}


interface BookingDetailsCardProps {
  booking: Booking;
  showFullDetails?: boolean;
  className?: string;
}

// Utility functions
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatPrice = (price: string): string => {
  return `PKR ${Number(price).toLocaleString()}`;
};

const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "PAID":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    case "HALF_PAID":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="h-3 w-3 mr-1" />
          Half Paid
        </Badge>
      );
    case "UNPAID":
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
          <AlertCircle className="h-3 w-3 mr-1" />
          Unpaid
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPricingTypeBadge = (type: string) => {
  switch (type) {
    case "member":
      return (
        <Badge variant="outline" className="border-blue-300 text-blue-700">
          Member Rate
        </Badge>
      );
    case "guest":
      return (
        <Badge variant="outline" className="border-purple-300 text-purple-700">
          Guest Rate
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

const getPaidByBadge = (paidBy: string) => {
  switch (paidBy) {
    case "MEMBER":
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Member
        </Badge>
      );
    case "GUEST":
      return (
        <Badge variant="secondary" className="bg-purple-50 text-purple-700">
          Guest
        </Badge>
      );
    default:
      return <Badge variant="secondary">{paidBy}</Badge>;
  }
};

const getMemberBalanceColor = (balance: number) => {
  if (balance >= 0) return "text-green-600";
  return "text-red-600";
};

export function BookingDetailsCard({
  booking,
  showFullDetails = true,
  className = "",
}: BookingDetailsCardProps) {
  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const hasGuestInfo = booking.guestName && booking.pricingType === "guest";
  const hasOutOfOrders = booking.room.outOfOrders && booking.room.outOfOrders.length > 0;

  // Check if booking overlaps with any out-of-order periods
  const overlappingOutOfOrders = hasOutOfOrders
    ? booking.room.outOfOrders.filter(oo => {
      const bookingStart = new Date(booking.checkIn);
      const bookingEnd = new Date(booking.checkOut);
      const ooStart = new Date(oo.startDate);
      const ooEnd = new Date(oo.endDate);
      return bookingStart < ooEnd && bookingEnd > ooStart;
    })
    : [];

  return (
    <Card className={`overflow-hidden border shadow-sm hover:shadow-md transition-shadow  ${className}`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              Booking #{booking.id} - Room {booking.room.roomNumber}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Created {formatDate(booking.createdAt)}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {getPaymentStatusBadge(booking.paymentStatus)}
            {getPricingTypeBadge(booking.pricingType)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Main Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Booking Details */}
          <div className="space-y-4">
            {/* Dates & Duration */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4" />
                Booking Period
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Check-in</Label>
                  <Value>{formatDate(booking.checkIn)}</Value>
                </div>
                <div>
                  <Label>Check-out</Label>
                  <Value>{formatDate(booking.checkOut)}</Value>
                </div>
                <div>
                  <Label>Duration</Label>
                  <Value>{nights} night{nights !== 1 ? 's' : ''}</Value>
                </div>
                <div>
                  <Label>Guests</Label>
                  <Value>
                    {booking.numberOfAdults} adult{booking.numberOfAdults !== 1 ? 's' : ''}
                    {booking.numberOfChildren > 0 && `, ${booking.numberOfChildren} child${booking.numberOfChildren !== 1 ? 'ren' : ''}`}
                  </Value>
                </div>
              </div>
            </div>

            {/* Room Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700">
                <Home className="h-4 w-4" />
                Room Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Room Number</Label>
                  <Value className="font-bold">{booking.room.roomNumber}</Value>
                </div>
                <div>
                  <Label>Room Type</Label>
                  <Value>{booking.room.roomType.type}</Value>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700">
                  <FileText className="h-4 w-4" />
                  Special Requests
                </h3>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                  {booking.specialRequests}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Payment & Member Info */}
          <div className="space-y-4">
            {/* Payment Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700">
                <CreditCard className="h-4 w-4" />
                Payment Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Price:</span>
                  <span className="font-bold text-lg">{formatPrice(booking.totalPrice.toString())}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Paid Amount</Label>
                    <Value className="text-green-600 font-medium">
                      {formatPrice(booking.paidAmount.toString())}
                    </Value>
                  </div>
                  <div>
                    <Label>Pending Amount</Label>
                    <Value className="text-red-600 font-medium">
                      {formatPrice(booking.pendingAmount.toString())}
                    </Value>
                  </div>
                </div>
                <div>
                  <Label>Payment Responsibility</Label>
                  <div className="mt-1">
                    {getPaidByBadge(booking.paidBy)}
                  </div>
                </div>
              </div>
            </div>

            {/* Member Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700">
                <User className="h-4 w-4" />
                Member Information
              </h3>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{booking.member.Name}</div>
                    <div className="text-sm text-gray-600">
                      Membership: #{booking.member.Membership_No}
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${getMemberBalanceColor(booking.member.Balance)}`}>
                    Balance: {formatPrice(booking.member.Balance.toString())}
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information (if applicable) */}
            {hasGuestInfo && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700">
                  <Users className="h-4 w-4" />
                  Guest Information
                </h3>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <div className="space-y-1">
                    <div className="font-medium">{booking.guestName}</div>
                    {booking.guestContact && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {booking.guestContact}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Status Summary */}
        {showFullDetails && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${booking.paymentStatus === "PAID" ? "bg-green-500" :
                    booking.paymentStatus === "HALF_PAID" ? "bg-yellow-500" :
                      "bg-red-500"
                  }`} />
                <span className="text-sm">
                  <span className="font-medium">Payment:</span> {booking.paymentStatus}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-gray-500" />
                <span className="text-sm">
                  <span className="font-medium">Rate Type:</span> {booking.pricingType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-gray-500" />
                <span className="text-sm">
                  <span className="font-medium">Payment By:</span> {booking.paidBy}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper Components
const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-xs font-medium text-gray-500 mb-1 ${className}`}>
    {children}
  </div>
);

const Value = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm ${className}`}>
    {children}
  </div>
);