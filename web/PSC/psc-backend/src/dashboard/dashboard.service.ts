import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberStatus, PaymentStatus, VoucherStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of 6 months ago

    // 1. Member Stats
    const [totalMembers, activeMembers, deactivatedMembers, blockedMembers] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { Status: MemberStatus.ACTIVE } }),
      this.prisma.member.count({ where: { Status: MemberStatus.DEACTIVATED } }),
      this.prisma.member.count({ where: { Status: MemberStatus.BLOCKED } }),
    ]);

    // 2. Upcoming Bookings
    const [roomBookings, hallBookings, lawnBookings, photoshootBookings] = await Promise.all([
      this.prisma.roomBooking.count({ where: { checkIn: { gt: now } } }),
      this.prisma.hallBooking.count({ where: { bookingDate: { gt: now } } }),
      this.prisma.lawnBooking.count({ where: { bookingDate: { gt: now } } }),
      this.prisma.photoshootBooking.count({ where: { bookingDate: { gt: now } } }),
    ]);

    // 3. Payment Status (Aggregate from all bookings)
    // We'll fetch counts for each status from each booking table
    const paymentStats = {
      UNPAID: 0,
      HALF_PAID: 0,
      PAID: 0,
    };

    const bookingTables = ['roomBooking', 'hallBooking', 'lawnBooking', 'photoshootBooking'];
    
    for (const table of bookingTables) {
      const unpaid = await (this.prisma[table] as any).count({ where: { paymentStatus: PaymentStatus.UNPAID } });
      const halfPaid = await (this.prisma[table] as any).count({ where: { paymentStatus: PaymentStatus.HALF_PAID } });
      const paid = await (this.prisma[table] as any).count({ where: { paymentStatus: PaymentStatus.PAID } });
      
      paymentStats.UNPAID += unpaid;
      paymentStats.HALF_PAID += halfPaid;
      paymentStats.PAID += paid;
    }

    // 4. Monthly Trend (Last 6 months)
    // We'll group by month. Since Prisma doesn't support complex group by date functions easily across DBs,
    // we'll fetch data and aggregate in JS or use raw query. Raw query is better for performance but type safety is tricky.
    // Let's fetch vouchers for revenue and bookings for counts.
    
    // Revenue from Vouchers
    const vouchers = await this.prisma.paymentVoucher.findMany({
      where: {
        status: VoucherStatus.CONFIRMED,
        issued_at: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        issued_at: true,
      },
    });

    // Bookings count (aggregate all types)
    // We need to fetch dates for all bookings in last 6 months
    const [rooms, halls, lawns, photoshoots] = await Promise.all([
      this.prisma.roomBooking.findMany({ where: { checkIn: { gte: sixMonthsAgo } }, select: { checkIn: true } }),
      this.prisma.hallBooking.findMany({ where: { bookingDate: { gte: sixMonthsAgo } }, select: { bookingDate: true } }),
      this.prisma.lawnBooking.findMany({ where: { bookingDate: { gte: sixMonthsAgo } }, select: { bookingDate: true } }),
      this.prisma.photoshootBooking.findMany({ where: { bookingDate: { gte: sixMonthsAgo } }, select: { bookingDate: true } }),
    ]);

    const monthlyData = new Map<string, { bookings: number; revenue: number }>();

    // Initialize map for last 6 months
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const key = d.toLocaleString('default', { month: 'short' }); // e.g., "Nov"
      monthlyData.set(key, { bookings: 0, revenue: 0 });
    }

    // Helper to add to map
    const addToMap = (date: Date, type: 'bookings' | 'revenue', value: number) => {
      const key = date.toLocaleString('default', { month: 'short' });
      if (monthlyData.has(key)) {
        const entry = monthlyData.get(key)!;
        entry[type] += value;
      }
    };

    // Process Revenue
    vouchers.forEach(v => addToMap(v.issued_at, 'revenue', Number(v.amount)));

    // Process Bookings
    rooms.forEach(b => addToMap(b.checkIn, 'bookings', 1));
    halls.forEach(b => addToMap(b.bookingDate, 'bookings', 1));
    lawns.forEach(b => addToMap(b.bookingDate, 'bookings', 1));
    photoshoots.forEach(b => addToMap(b.bookingDate, 'bookings', 1));

    // Convert map to array and reverse to show chronological order
    const monthlyTrend = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .reverse();

    return {
      totalMembers,
      activeMembers,
      deactivatedMembers,
      blockedMembers,
      upcomingBookings: {
        room: roomBookings,
        hall: hallBookings,
        lawn: lawnBookings,
        photoshoot: photoshootBookings,
      },
      paymentsUnpaid: paymentStats.UNPAID,
      paymentsHalfPaid: paymentStats.HALF_PAID,
      paymentsPaid: paymentStats.PAID,
      monthlyTrend,
    };
  }
}
