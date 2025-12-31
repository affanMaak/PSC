import { Booking, Room, DateStatus } from "@/types/room-booking.type";
import { BookingForm } from "@/types/room-booking.type";
import { getPakistanDate, getPakistanDateString, normalizeToPakistanDate } from "./pakDate";

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

  const room: any = rooms.find((r) => r.id.toString() === roomId);
  if (!room) return dateStatuses;

  console.log('=== getDateStatuses DEBUG ===');
  console.log('Processing room:', {
    id: room.id,
    roomNumber: room.roomNumber,
    isOutOfOrder: room.isOutOfOrder,
    outOfOrderFrom: room.outOfOrderFrom,
    outOfOrderTo: room.outOfOrderTo,
    reservations: room.reservations,
    bookings: room.bookings
  });

  // Mark booked dates from room.bookings
  if (room.bookings && room.bookings.length > 0) {
    console.log('Processing bookings:', room.bookings);
    room.bookings.forEach((booking) => {
      const start = normalizeToPakistanDate(new Date(booking.checkIn));
      const end = normalizeToPakistanDate(new Date(booking.checkOut));
      const currentDate = new Date(start);

      console.log(`Booking from ${start.toISOString()} to ${end.toISOString()} (PKT)`);

      while (currentDate < end) {
        const dateKey = getPakistanDateString(currentDate);
        if (!dateStatuses.some(ds =>
          getPakistanDateString(ds.date) === dateKey
        )) {
          dateStatuses.push({
            date: new Date(currentDate),
            status: "BOOKED",
            bookingId: booking.id?.toString(),
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  }

  // Mark reserved dates from room.reservations
  if (room.reservations && room.reservations.length > 0) {
    console.log('Processing reservations:', room.reservations);
    room.reservations.forEach((reservation) => {
      const start = normalizeToPakistanDate(new Date(reservation.reservedFrom));
      const end = normalizeToPakistanDate(new Date(reservation.reservedTo));
      const currentDate = new Date(start);

      console.log(`Reservation from ${start.toISOString()} to ${end.toISOString()} (PKT)`);

      while (currentDate < end) {
        const dateKey = getPakistanDateString(currentDate);
        // Only mark as reserved if not already booked
        if (!dateStatuses.some(ds =>
          getPakistanDateString(ds.date) === dateKey && ds.status === "BOOKED"
        )) {
          dateStatuses.push({
            date: new Date(currentDate),
            status: "RESERVED",
            reservationId: reservation.id?.toString(),
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  }

  // Mark out-of-order dates from room.outOfOrders array
  if (room.outOfOrders && room.outOfOrders.length > 0) {
    room.outOfOrders.forEach((oo: any) => {
      const start = normalizeToPakistanDate(new Date(oo.startDate));
      const end = normalizeToPakistanDate(new Date(oo.endDate));
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const dateKey = getPakistanDateString(currentDate);
        const existingIndex = dateStatuses.findIndex(ds =>
          getPakistanDateString(ds.date) === dateKey
        );

        if (existingIndex !== -1) {
          dateStatuses[existingIndex] = {
            date: new Date(currentDate),
            status: "OUT_OF_ORDER",
          };
        } else {
          dateStatuses.push({
            date: new Date(currentDate),
            status: "OUT_OF_ORDER",
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  }

  // Fallback for legacy fields if array is empty
  if ((!room.outOfOrders || room.outOfOrders.length === 0) && room.isOutOfOrder && room.outOfOrderFrom && room.outOfOrderTo) {
    const start = normalizeToPakistanDate(new Date(room.outOfOrderFrom));
    const end = normalizeToPakistanDate(new Date(room.outOfOrderTo));
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateKey = getPakistanDateString(currentDate);
      const existingIndex = dateStatuses.findIndex(ds =>
        getPakistanDateString(ds.date) === dateKey
      );

      if (existingIndex !== -1) {
        dateStatuses[existingIndex] = {
          date: new Date(currentDate),
          status: "OUT_OF_ORDER",
        };
      } else {
        dateStatuses.push({
          date: new Date(currentDate),
          status: "OUT_OF_ORDER",
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
  paidBy: "MEMBER",
  guestName: "",
  guestContact: "",
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
  remarks: "",
};
