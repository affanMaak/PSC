import { differenceInCalendarDays, addDays } from "date-fns";
import {
  Hall,
  HallBooking,
  HallBookingForm,
  HallBookingTime,
  PricingType,
  PaymentStatus,
} from "@/types/hall-booking.type";
import { DateStatus } from "@/types/room-booking.type";

export const hallInitialFormState: HallBookingForm = {
  membershipNo: "",
  memberName: "",
  memberId: "",
  category: "Hall",
  hallId: "",
  bookingDate: "",
  eventType: "",
  eventTime: "EVENING",
  pricingType: "member",
  totalPrice: 0,
  paymentStatus: "UNPAID",
  paidAmount: 0,
  pendingAmount: 0,
  paymentMode: "CASH",
};

export const calculateHallPrice = (
  halls: Hall[],
  hallId: string,
  pricingType: PricingType
) => {
  if (!hallId) return 0;

  const hall = halls.find((h) => h.id.toString() === hallId);
  if (!hall) return 0;

  return pricingType === "member"
    ? Number(hall.chargesMembers || 0)
    : Number(hall.chargesGuests || 0);
};

export const calculateHallAccountingValues = (
  paymentStatus: PaymentStatus,
  totalPrice: number,
  paidAmount: number
) => {
  let paid = 0;
  let owed = totalPrice;

  if (paymentStatus === "PAID") {
    paid = totalPrice;
    owed = 0;
  } else if (paymentStatus === "HALF_PAID") {
    paid = paidAmount;
    owed = totalPrice - paidAmount;
  }

  return { paid, owed, pendingAmount: owed };
};

export const getHallDateStatuses = (
  hallId: string,
  bookings: HallBooking[],
  halls: Hall[]
): DateStatus[] => {
  if (!hallId) return [];

  const statuses: DateStatus[] = [];
  const selectedHall = halls.find((hall) => hall.id.toString() === hallId);

  // Mark booked dates
  bookings
    .filter((booking) => booking.hallId?.toString() === hallId)
    .forEach((booking) => {
      const bookingDay = new Date(booking.bookingDate);
      statuses.push({
        date: new Date(
          bookingDay.getFullYear(),
          bookingDay.getMonth(),
          bookingDay.getDate()
        ),
        status: "BOOKED",
        bookingId: booking.id,
      });
    });

  // Mark out-of-service ranges
  if (
    selectedHall?.isOutOfService &&
    selectedHall.outOfServiceFrom &&
    selectedHall.outOfServiceTo
  ) {
    const from = new Date(selectedHall.outOfServiceFrom);
    const to = new Date(selectedHall.outOfServiceTo);
    const totalDays = Math.max(differenceInCalendarDays(to, from), 0);

    for (let i = 0; i <= totalDays; i++) {
      const current = addDays(from, i);
      statuses.push({
        date: new Date(
          current.getFullYear(),
          current.getMonth(),
          current.getDate()
        ),
        status: "OUT_OF_ORDER",
      });
    }
  }

  return statuses;
};

