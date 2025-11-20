import { Member, Voucher, DateStatus } from "@/types/room-booking.type";

export type HallBookingTime = "MORNING" | "EVENING" | "NIGHT";
export type PricingType = "member" | "guest";
export type PaymentStatus = "UNPAID" | "HALF_PAID" | "PAID";

export interface Hall {
  id: number;
  name: string;
  capacity: number;
  chargesMembers: number;
  chargesGuests: number;
  isActive: boolean;
  isBooked: boolean;
  isOutOfService?: boolean;
  outOfServiceFrom?: string;
  outOfServiceTo?: string;
  outOfServiceReason?: string;
}

export interface HallBooking {
  id: number;
  Membership_No: string;
  memberName: string;
  memberId: number;
  hallId: number;
  hallName?: string;
  bookingDate: string;
  eventType: string;
  bookingTime: HallBookingTime;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  pricingType: PricingType;
  paidAmount: number;
  pendingAmount: number;
  member?: Member;
  hall?: Hall;
}

export interface HallBookingForm {
  membershipNo: string;
  memberName: string;
  memberId: string;
  category: "Hall";
  hallId: string;
  bookingDate: string;
  eventType: string;
  eventTime: HallBookingTime;
  pricingType: PricingType;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  pendingAmount: number;
  paymentMode: "CASH";
}

export type HallVoucher = Voucher;

export type HallDateStatus = DateStatus;

