// Mock data for the admin portal

export const mockMembers = [
  { Sno: 1, Membership_No: "PSC001", Name: "Ahmed Khan", Email: "ahmed@example.com", Contact_No: "0300-1234567", Status: "ACTIVE", Balance: 5000, totalBookings: 12, lastBookingDate: "2025-11-05" },
  { Sno: 2, Membership_No: "PSC002", Name: "Fatima Ali", Email: "fatima@example.com", Contact_No: "0321-9876543", Status: "ACTIVE", Balance: 2500, totalBookings: 8, lastBookingDate: "2025-11-08" },
  { Sno: 3, Membership_No: "PSC003", Name: "Usman Tariq", Email: "usman@example.com", Contact_No: "0333-4567890", Status: "DEACTIVATED", Balance: 0, totalBookings: 3, lastBookingDate: "2025-09-20" },
  { Sno: 4, Membership_No: "PSC004", Name: "Ayesha Malik", Email: "ayesha@example.com", Contact_No: "0345-1112233", Status: "ACTIVE", Balance: 15000, totalBookings: 25, lastBookingDate: "2025-11-10" },
  { Sno: 5, Membership_No: "PSC005", Name: "Hassan Raza", Email: "hassan@example.com", Contact_No: "0301-5556677", Status: "BLOCKED", Balance: -3000, totalBookings: 5, lastBookingDate: "2025-10-15" },
];

export const mockAdmins = [
  { id: 1, name: "Super Admin", email: "super@psc.com", role: "SUPER_ADMIN" },
  { id: 2, name: "Admin User", email: "admin@psc.com", role: "ADMIN" },
];

export const mockRoomTypes = [
  { id: 1, type: "Studio", pricePerDayMember: 3000, pricePerDayGuest: 4500 },
  { id: 2, type: "Deluxe", pricePerDayMember: 5000, pricePerDayGuest: 7500 },
  { id: 3, type: "Suite", pricePerDayMember: 8000, pricePerDayGuest: 12000 },
];

export const mockRooms = [
  { id: 1, roomNumber: "101", roomType: "Studio", isActive: true, isOutOfOrder: false, description: "Standard studio room" },
  { id: 2, roomNumber: "102", roomType: "Studio", isActive: true, isOutOfOrder: false, description: "Studio with garden view" },
  { id: 3, roomNumber: "201", roomType: "Deluxe", isActive: true, isOutOfOrder: false, description: "Deluxe double bed" },
  { id: 4, roomNumber: "301", roomType: "Suite", isActive: false, isOutOfOrder: true, outOfOrderReason: "Renovation", description: "Presidential suite" },
];

export const mockHalls = [
  { id: 1, name: "Sub Hall", capacity: 50, chargesMembers: 20000, chargesGuests: 30000, isActive: true, isOutOfService: false },
  { id: 2, name: "Main Hall", capacity: 200, chargesMembers: 50000, chargesGuests: 75000, isActive: true, isOutOfService: false },
  { id: 3, name: "Banquet Hall", capacity: 500, chargesMembers: 150000, chargesGuests: 200000, isActive: true, isOutOfService: false },
  { id: 4, name: "Conference Hall", capacity: 100, chargesMembers: 35000, chargesGuests: 50000, isActive: true, isOutOfService: false },
];

export const mockLawnCategories = [
  { id: 1, category: "Standard Lawn" },
  { id: 2, category: "Premium Lawn" },
  { id: 3, category: "VIP Lawn" },
];

export const mockLawns = [
  { id: 1, lawnCategory: "Standard Lawn", description: "Small outdoor lawn", minGuests: 50, maxGuests: 200, memberCharges: 40000, guestCharges: 60000 },
  { id: 2, lawnCategory: "Premium Lawn", description: "Large lawn with fountain", minGuests: 200, maxGuests: 500, memberCharges: 100000, guestCharges: 150000 },
  { id: 3, lawnCategory: "VIP Lawn", description: "Exclusive VIP lawn area", minGuests: 300, maxGuests: 800, memberCharges: 200000, guestCharges: 300000 },
];

export const mockPhotoshoot = [
  { id: 1, description: "Indoor photoshoot studio with lighting", memberChargesPerHour: 5000, guestChargesPerHour: 8000 },
];

export const mockSports = [
  { id: 1, activity: "Swimming Pool", description: "Olympic size pool", isActive: true, charges: [{ type: "PER_DAY", memberCharges: 500, guestCharges: 1000 }] },
  { id: 2, activity: "Tennis Court", description: "Professional tennis court", isActive: true, charges: [{ type: "PER_HOUR", memberCharges: 300, guestCharges: 500 }] },
  { id: 3, activity: "Gym", description: "Fully equipped fitness center", isActive: true, charges: [{ type: "PER_MONTH", memberCharges: 5000, guestCharges: 8000 }] },
];

export const mockRoomBookings = [
  { id: 1, memberName: "Ahmed Khan", roomNumber: "101", checkIn: "2025-11-15 14:00", checkOut: "2025-11-17 12:00", totalPrice: 6000, paymentStatus: "PAID", pricingType: "member" },
  { id: 2, memberName: "Ayesha Malik", roomNumber: "201", checkIn: "2025-11-20 15:00", checkOut: "2025-11-22 11:00", totalPrice: 10000, paymentStatus: "HALF_PAID", pricingType: "member" },
  { id: 3, memberName: "Guest - Ali Hassan", roomNumber: "102", checkIn: "2025-11-18 16:00", checkOut: "2025-11-19 12:00", totalPrice: 4500, paymentStatus: "UNPAID", pricingType: "guest" },
];

export const mockHallBookings = [
  { id: 1, memberName: "Fatima Ali", hallName: "Main Hall", bookingDate: "2025-12-05", eventType: "Barat", bookingTime: "EVENING", totalPrice: 50000, paymentStatus: "PAID", pricingType: "member" },
  { id: 2, memberName: "Ahmed Khan", hallName: "Banquet Hall", bookingDate: "2025-12-15", eventType: "Walima", bookingTime: "NIGHT", totalPrice: 150000, paymentStatus: "HALF_PAID", pricingType: "member" },
];

export const mockLawnBookings = [
  { id: 1, memberName: "Ayesha Malik", lawnName: "Premium Lawn", bookingDate: "2025-11-25", guestsCount: 350, totalPrice: 100000, paymentStatus: "UNPAID", pricingType: "member" },
  { id: 2, memberName: "Hassan Raza", lawnName: "Standard Lawn", bookingDate: "2025-12-01", guestsCount: 150, totalPrice: 40000, paymentStatus: "PAID", pricingType: "member" },
];

export const mockPhotoshootBookings = [
  { id: 1, memberName: "Fatima Ali", bookingDate: "2025-11-30", bookingHours: 3, totalPrice: 15000, paymentStatus: "PAID", pricingType: "member" },
];

export const mockPaymentVouchers = [
  { id: 1, memberId: "PSC001", voucherNo: "V-2025-001", date: "2025-11-01", amount: 6000, type: "Room Booking", status: "PAID" },
  { id: 2, memberId: "PSC001", voucherNo: "V-2025-002", date: "2025-10-15", amount: 50000, type: "Hall Booking", status: "PAID" },
  { id: 3, memberId: "PSC002", voucherNo: "V-2025-003", date: "2025-11-05", amount: 100000, type: "Lawn Booking", status: "HALF_PAID" },
  { id: 4, memberId: "PSC004", voucherNo: "V-2025-004", date: "2025-11-08", amount: 15000, type: "Photoshoot", status: "PAID" },
  { id: 5, memberId: "PSC005", voucherNo: "V-2025-005", date: "2025-10-20", amount: 40000, type: "Lawn Booking", status: "UNPAID" },
];

export const mockAffiliatedClubRequests = [
  { id: 1, memberName: "Ahmed Khan", membershipNo: "PSC001", clubName: "Islamabad Club", requestDate: "2025-11-10", requestType: "PERSONAL", guestCount: 0, purpose: "Personal workout session", status: "PENDING" },
  { id: 2, memberName: "Fatima Ali", membershipNo: "PSC002", clubName: "Lahore Gymkhana", requestDate: "2025-11-08", requestType: "GUEST", guestCount: 4, guestNames: "Ali Hassan, Sara Ahmed, Bilal Khan, Ayesha Siddiqui", purpose: "Business meeting with clients", status: "APPROVED" },
  { id: 3, memberName: "Ayesha Malik", membershipNo: "PSC004", clubName: "Karachi Club", requestDate: "2025-11-05", requestType: "GUEST", guestCount: 2, guestNames: "Usman Tariq, Zainab Malik", purpose: "Social gathering with guests", status: "REJECTED" },
];

export const mockMemberBookingHistory = [
  { id: 1, type: "Room", name: "Studio 101", date: "2025-02-15", amount: 6000, status: "COMPLETED" },
  { id: 2, type: "Hall", name: "Main Hall", date: "2025-02-20", amount: 50000, status: "COMPLETED" },
  { id: 3, type: "Lawn", name: "Premium Lawn", date: "2025-03-01", amount: 100000, status: "UPCOMING" },
  { id: 4, type: "Photoshoot", name: "Studio Session", date: "2025-03-10", amount: 15000, status: "COMPLETED" },
];

export const getDashboardStats = () => ({
  totalMembers: mockMembers.length,
  activeMembers: mockMembers.filter(m => m.Status === "ACTIVE").length,
  deactivatedMembers: mockMembers.filter(m => m.Status === "DEACTIVATED").length,
  blockedMembers: mockMembers.filter(m => m.Status === "BLOCKED").length,
  totalBookings: mockRoomBookings.length + mockHallBookings.length + mockLawnBookings.length + mockPhotoshootBookings.length,
  upcomingBookings: {
    room: mockRoomBookings.filter(b => new Date(b.checkIn) > new Date()).length,
    hall: mockHallBookings.filter(b => new Date(b.bookingDate) > new Date()).length,
    lawn: mockLawnBookings.filter(b => new Date(b.bookingDate) > new Date()).length,
    photoshoot: mockPhotoshootBookings.filter(b => new Date(b.bookingDate) > new Date()).length,
  },
  paymentsUnpaid: [...mockRoomBookings, ...mockHallBookings, ...mockLawnBookings, ...mockPhotoshootBookings].filter(b => b.paymentStatus === "UNPAID").length,
  paymentsHalfPaid: [...mockRoomBookings, ...mockHallBookings, ...mockLawnBookings, ...mockPhotoshootBookings].filter(b => b.paymentStatus === "HALF_PAID").length,
  paymentsPaid: [...mockRoomBookings, ...mockHallBookings, ...mockLawnBookings, ...mockPhotoshootBookings].filter(b => b.paymentStatus === "PAID").length,
});
