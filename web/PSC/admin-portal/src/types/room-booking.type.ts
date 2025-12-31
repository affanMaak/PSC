export interface Member {
  id: number;
  Name: string;
  email?: string;
  phone?: string;
  membershipNumber?: string;
  Membership_No?: string;
  Balance?: number;
  drAmount?: number;
  crAmount?: number;
}

export interface RoomType {
  id: number;
  type: string;
  priceMember: string;
  priceGuest: string;
}

export interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  roomTypeId: number;
  isActive: boolean;
  isOutOfOrder?: boolean;
  outOfOrderTo?: string;
  isReserved?: boolean;
  reservedFrom?: string;
  reservedTo?: string;
  outOfOrders?: any[]
  reservations?: any[];
  bookings?: any[];
  status?: "AVAILABLE" | "OUT_OF_ORDER" | "RESERVED";
}

export interface Booking {
  id: number;
  Membership_No: string;
  memberName: string;
  roomId: number;
  roomNumber: string;
  roomTypeId: number;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  paymentStatus: "UNPAID" | "HALF_PAID" | "PAID" | "TO_BILL";
  pricingType: "member" | "guest";
  paidBy: "MEMBER" | "GUEST",
  guestContact: "",
  guestName: "",
  paidAmount: number;
  pendingAmount: number;
  member?: Member;
  room?: {
    id: number;
    roomNumber: string;
    outOfOrders?: any[];
    createdAt?: string;
    specialRequests?: string
    roomType: {
      type: string;
      id: number;
    };
  };
  createdAt?: string
  numberOfAdults: number;
  numberOfChildren: number;
  specialRequests?: string;
  remarks?: string;
}

export interface BookingForm {
  membershipNo: string;
  memberName: string;
  memberId: string;
  category: string;
  roomTypeId: string;
  roomId: string;
  pricingType: "member" | "guest";
  paidBy: "MEMBER" | "GUEST",
  guestName: "",
  guestContact: "",
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  paymentStatus: "UNPAID" | "HALF_PAID" | "PAID" | "TO_BILL";
  paidAmount: number;
  pendingAmount: number;
  paymentMode: "CASH";
  numberOfAdults: number;
  numberOfChildren: number;
  specialRequests?: string;
  remarks?: string;
}

export interface Voucher {
  id: number;
  voucher_no: string;
  booking_type: string;
  booking_id: number;
  membership_no: string;
  amount: string;
  payment_mode: string;
  transaction_id: string | null;
  remarks: string;
  voucher_type: "FULL_PAYMENT" | "HALF_PAYMENT";
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  issued_at: string;
  issued_by: string;
}

export interface DateStatus {
  date: Date;
  status: "BOOKED" | "OUT_OF_ORDER" | "RESERVED" | "AVAILABLE";
  bookingId?: number;
  reservationId?: number | string
}