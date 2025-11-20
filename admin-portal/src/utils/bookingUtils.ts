import { Booking, Room, DateStatus } from "@/types/room-booking.type";
import { BookingForm } from "@/types/room-booking.type";

export const getBookedDatesForRoom = (bookings: Booking[], roomId: string) => {
  const bookedDates: { start: Date; end: Date; bookingId: number }[] = [];

  bookings.forEach((booking) => {
    if (
      booking.roomId?.toString() === roomId ||
      booking.room?.id?.toString() === roomId
    ) {
      bookedDates.push({
        start: new Date(booking.checkIn),
        end: new Date(booking.checkOut),
        bookingId: booking.id,
      });
    }
  });

  return bookedDates;
};

export const getRoomStatusDates = (room: Room): Date[] => {
  // This would typically come from your API
  // For now, returning empty array - implement based on your room status data
  return [];
};

export const getDateStatuses = (
  roomId: string,
  bookings: Booking[],
  rooms: Room[]
): DateStatus[] => {
  const dateStatuses: DateStatus[] = [];

  if (!roomId) return dateStatuses;

  const room = rooms.find((r) => r.id.toString() === roomId);
  if (!room) return dateStatuses;

  // Mark booked dates
  const bookedDates = getBookedDatesForRoom(bookings, roomId);
  bookedDates.forEach((booking) => {
    const currentDate = new Date(booking.start);
    while (currentDate <= booking.end) {
      dateStatuses.push({
        date: new Date(currentDate),
        status: "BOOKED",
        bookingId: booking.bookingId,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  // Mark out-of-order dates
  if (room.isOutOfOrder) {
    const today = new Date();
    const outOfOrderEnd =
      room.outOfOrderTo || new Date(today.getFullYear() + 1, 0, 1); // Default to next year if no end date

    const currentDate = new Date(today);
    while (currentDate <= outOfOrderEnd) {
      if (
        !dateStatuses.some(
          (ds) => ds.date.toDateString() === currentDate.toDateString()
        )
      ) {
        dateStatuses.push({
          date: new Date(currentDate),
          status: "OUT_OF_ORDER",
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Mark reserved dates
  if (room.isReserved && room.reservedFrom && room.reservedTo) {
    const currentDate = new Date(room.reservedFrom);
    while (currentDate <= new Date(room.reservedTo)) {
      if (
        !dateStatuses.some(
          (ds) => ds.date.toDateString() === currentDate.toDateString()
        )
      ) {
        dateStatuses.push({
          date: new Date(currentDate),
          status: "RESERVED",
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return dateStatuses;
};

export const isDateInRange = (date: Date, start: Date, end: Date) => {
  return date >= start && date <= end;
};

export const calculatePrice = (
  roomTypeId: string,
  pricingType: string,
  checkIn: string,
  checkOut: string,
  roomTypes: any[]
) => {
  if (!roomTypeId || !checkIn || !checkOut) return 0;

  const roomType = roomTypes.find((t: any) => t.id.toString() === roomTypeId);
  if (!roomType) return 0;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const days = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days <= 0) return 0;

  const pricePerDay =
    pricingType === "member"
      ? parseInt(roomType.priceMember)
      : parseInt(roomType.priceGuest);

  return days * pricePerDay;
};

export const calculateAccountingValues = (
  paymentStatus: string,
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

export const initialFormState: BookingForm = {
  membershipNo: "",
  memberName: "",
  memberId: "",
  category: "Room",
  roomTypeId: "",
  roomId: "",
  pricingType: "member",
  checkIn: "",
  checkOut: "",
  totalPrice: 0,
  paymentStatus: "UNPAID",
  paidAmount: 0,
  pendingAmount: 0,
  paymentMode: "CASH",
  numberOfAdults: 1,
  numberOfChildren: 0,
  specialRequests: "",
};
