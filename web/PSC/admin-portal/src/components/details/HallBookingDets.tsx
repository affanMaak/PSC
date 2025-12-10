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
  Clock as TimeIcon,
  PartyPopper,
} from "lucide-react";
import { HallBooking } from "@/types/hall-booking.type";

interface OutOfOrderPeriod {
  id: number;
  hallId: number;
  reason: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Hall {
  name: string;
  outOfOrders: OutOfOrderPeriod[];
}

interface Member {
  Sno: number;
  Membership_No: string;
  Name: string;
  Balance: number;
}


interface HallBookingDetailsCardProps {
  booking: HallBooking;
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

const getEventTypeDisplay = (eventType: string): string => {
  const eventTypes: Record<string, string> = {
    "mehandi": "Mehandi",
    "barat": "Barat",
    "walima": "Walima",
    "birthday": "Birthday Party",
    "corporate": "Corporate Event",
    "wedding": "Wedding",
    "other": "Other Event",
  };
  return eventTypes[eventType] || eventType.charAt(0).toUpperCase() + eventType.slice(1);
};

const getTimeSlotDisplay = (time: string): string => {
  const timeSlots: Record<string, string> = {
    "MORNING": "Morning (8:00 AM - 2:00 PM)",
    "EVENING": "Evening (2:00 PM - 8:00 PM)",
    "NIGHT": "Night (8:00 PM - 12:00 AM)",
  };
  return timeSlots[time] || time;
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

const getTimeSlotIcon = (time: string) => {
  switch (time) {
    case "MORNING":
      return "🌅";
    case "EVENING":
      return "🌇";
    case "NIGHT":
      return "🌃";
    default:
      return "⏰";
  }
};

export function HallBookingDetailsCard({
  booking,
  showFullDetails = true,
  className = "",
}: HallBookingDetailsCardProps) {
  const hasGuestInfo = booking.guestName && booking.pricingType === "guest";
  const hasOutOfOrders = booking.hall.outOfOrders && booking.hall.outOfOrders.length > 0;

  return (
    <Card className={`overflow-hidden border shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              Hall Booking #{booking.id} - {booking.hall.name}
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
          {/* Left Column - Event Details */}
          <div className="space-y-4">
            {/* Event Date & Time */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4" />
                Event Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event Date</Label>
                  <Value>{formatDate(booking.bookingDate)}</Value>
                </div>
                <div>
                  <Label>Event Time</Label>
                  <Value className="flex items-center gap-2">
                    <span>{getTimeSlotIcon(booking.bookingTime)}</span>
                    {getTimeSlotDisplay(booking.bookingTime)}
                  </Value>
                </div>
                <div className="col-span-2">
                  <Label>Event Type</Label>
                  <Value className="flex items-center gap-2">
                    <PartyPopper className="h-4 w-4 text-purple-600" />
                    {getEventTypeDisplay(booking.eventType)}
                  </Value>
                </div>
              </div>
            </div>

            {/* Hall Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700">
                <Home className="h-4 w-4" />
                Hall Details
              </h3>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="font-medium text-blue-800">{booking.hall.name}</div>
                <div className="text-sm text-blue-600 mt-1">
                  Hall ID: #{booking.hallId}
                </div>
              </div>
            </div>

            {/* Guest Count */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700">
                <Users className="h-4 w-4" />
                Guest Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number of Guests</Label>
                  <Value className="font-bold text-lg">{booking.numberOfGuests.toLocaleString()}</Value>
                </div>
                <div>
                  <Label>Price per Guest</Label>
                  <Value>
                    {formatPrice((Number(booking.totalPrice) / booking.numberOfGuests).toFixed(2))}
                  </Value>
                </div>
              </div>
            </div>
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
                  <span className="font-bold text-lg">{formatPrice(booking.totalPrice)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Paid Amount</Label>
                    <Value className="text-green-600 font-medium">
                      {formatPrice(booking.paidAmount)}
                    </Value>
                  </div>
                  <div>
                    <Label>Pending Amount</Label>
                    <Value className="text-red-600 font-medium">
                      {formatPrice(booking.pendingAmount)}
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

        {/* Out of Order Periods Warning */}
        {hasOutOfOrders && showFullDetails && (
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Hall Maintenance Periods
            </h3>
            <div className="space-y-2">
              {booking.hall.outOfOrders.map((period) => {
                const eventDate = new Date(booking.bookingDate);
                const periodStart = new Date(period.startDate);
                const periodEnd = new Date(period.endDate);
                const isOverlapping = eventDate >= periodStart && eventDate <= periodEnd;
                
                return (
                  <div
                    key={period.id}
                    className={`p-3 rounded-md border text-sm ${
                      isOverlapping
                        ? "bg-red-50 border-red-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </div>
                        <div className="text-gray-600 mt-1">{period.reason}</div>
                      </div>
                      {isOverlapping && (
                        <Badge variant="destructive" className="text-xs">
                          Affects This Booking
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Summary */}
        {showFullDetails && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  booking.paymentStatus === "PAID" ? "bg-green-500" :
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
                <TimeIcon className="h-3 w-3 text-gray-500" />
                <span className="text-sm">
                  <span className="font-medium">Time Slot:</span> {booking.bookingTime}
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