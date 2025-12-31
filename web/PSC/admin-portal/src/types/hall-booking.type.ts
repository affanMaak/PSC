import { Member, Voucher, DateStatus } from "@/types/room-booking.type";

export type HallBookingTime = "MORNING" | "EVENING" | "NIGHT";
export type PricingType = "member" | "guest";
export type PaymentStatus = "UNPAID" | "HALF_PAID" | "PAID" | "TO_BILL";


export interface HallBooking {
  id: string;
  memberId: string;
  hallId: string;
  bookingDate: string;
  totalPrice: string; // API returns string
  paymentStatus: string;
  pricingType: string;
  paidAmount: string; // API returns string
  pendingAmount: string; // API returns string
  eventType: string;
  bookingTime: string;
  createdAt: string;
  updatedAt: string;
  numberOfGuests: number;
  paidBy?: "MEMBER" | "GUEST";
  guestName?: "",
  guestContact?: "",
  remarks?: string;

  member?: {
    id: string;
    Name: string;
    Membership_No: string;
    Balance: number;
    drAmount: number;
    crAmount: number;
  };
  hall?: {
    id: string;
    name: string;
    capacity: number;
    chargesMembers: number;
    chargesGuests: number;
    outOfOrders?: any[],
  };
  // Add these for backward compatibility
  Membership_No?: string;
  memberName?: string;
  hallName?: string;
}

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  chargesMembers: number;
  chargesGuests: number;
  description: string;
  isActive: boolean;
  isOutOfService: boolean;
  isReserved: boolean;
  isBooked: boolean;
  outOfServiceReason?: string;
  outOfServiceFrom?: string;
  outOfServiceTo?: string;
  paidBy?: "MEMBER" | "GUEST";
  guestName?: "",
  guestContact?: ""
  reservations: any[];
  bookings: HallBooking[];
  images: any[];
}

export interface HallBookingForm {
  membershipNo: string;
  memberName: string;
  memberId: string;
  category: string;
  hallId: string;
  bookingDate: string;
  eventType: string;
  eventTime: string; // Use string instead of HallBookingTime
  pricingType: string; // Use string instead of PricingType
  totalPrice: number;
  paymentStatus: string; // Use string instead of PaymentStatus
  numberOfGuests: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMode: string;
  paidBy?: "MEMBER" | "GUEST";
  guestName?: "",
  guestContact?: ""
  remarks?: string;
}

export type HallVoucher = Voucher;

export type HallDateStatus = DateStatus;

