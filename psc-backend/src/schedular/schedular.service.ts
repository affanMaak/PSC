import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SchedularService {
  private readonly logger = new Logger(SchedularService.name);

  constructor(private prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkScheduledOutOfOrder() {
    const MAX_RETRIES = 5;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        await this.prismaService.$transaction(async (tx) => {
          const now = new Date();

          // Get current date at midnight in local time
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );

          // STEP 1 — Find rooms that should be marked as "currently out of order"
          // Rooms that have active out-of-order periods overlapping with today
          const roomsWithActiveOutOfOrder = await tx.room.findMany({
            where: {
              outOfOrders: {
                some: {
                  AND: [
                    { startDate: { lte: today } },
                    { endDate: { gte: today } },
                  ],
                },
              },
            },
            include: {
              outOfOrders: {
                where: {
                  AND: [
                    { startDate: { lte: today } },
                    { endDate: { gte: today } },
                  ],
                },
              },
            },
          });

          // Update rooms that should be marked as out-of-order
          const roomsToMarkOutOfOrder = roomsWithActiveOutOfOrder
            .filter((room) => room.isActive) // Only mark if currently active
            .map((room) => room.id);

          if (roomsToMarkOutOfOrder.length > 0) {
            const markOutOfOrderResult = await tx.room.updateMany({
              where: {
                id: { in: roomsToMarkOutOfOrder },
                isActive: true,
              },
              data: {
                isActive: false,
              },
            });

            this.logger.log(
              `Marked ${markOutOfOrderResult.count} rooms as inactive due to out-of-order periods.`,
            );
          }

          // STEP 2 — Find rooms that should be reactivated
          // Rooms that don't have any active out-of-order periods today
          const allRooms = await tx.room.findMany({
            where: {
              isActive: false,
            },
            include: {
              outOfOrders: {
                where: {
                  endDate: { gte: today }, // Only consider ongoing or future periods
                },
              },
            },
          });

          const roomsToReactivate = allRooms
            .filter((room) => {
              // Room should be reactivated if it has NO out-of-order periods covering today
              const hasActiveOutOfOrderToday = room.outOfOrders.some(
                (oo) => oo.startDate <= today && oo.endDate >= today,
              );
              return !hasActiveOutOfOrderToday;
            })
            .map((room) => room.id);

          if (roomsToReactivate.length > 0) {
            const reactivateResult = await tx.room.updateMany({
              where: {
                id: { in: roomsToReactivate },
                isActive: false,
              },
              data: {
                isActive: true,
              },
            });

            this.logger.log(
              `Reactivated ${reactivateResult.count} rooms (no active out-of-order periods today).`,
            );
          }

          // STEP 3 — Clean up expired out-of-order records (optional, for data cleanup)
          // Remove out-of-order records that ended more than 30 days ago
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const cleanupResult = await tx.roomOutOfOrder.deleteMany({
            where: {
              endDate: { lt: thirtyDaysAgo },
            },
          });

          if (cleanupResult.count > 0) {
            this.logger.log(
              `Cleaned up ${cleanupResult.count} expired out-of-order records.`,
            );
          }
        });

        // Success: exit retry loop
        return;
      } catch (err) {
        if (err.code === 'P2034') {
          retries++;
          this.logger.warn(
            `Deadlock detected. Retry ${retries}/${MAX_RETRIES}...`,
          );
          await new Promise((res) => setTimeout(res, 200)); // small delay
        } else {
          throw err;
        }
      }
    }

    this.logger.error('Failed after maximum deadlock retries.');
  }

  // hold expiry check
  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkRoomHoldExpiry() {
    this.logger.log(`Checking for expired room holds...`);
    const now = new Date();

    const expiredHolds = await this.prismaService.room.updateMany({
      where: {
        onHold: true,
        holdExpiry: { lt: now },
      },
      data: {
        onHold: false,
        holdExpiry: null,
        holdBy: null,
      },
    });
    if (expiredHolds.count > 0) {
      this.logger.log(`Released ${expiredHolds.count} expired room holds.`);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateRoomReservationStatus() {
    this.logger.log(`Updating Room Reservation Status`);

    try {
      // Get current date at start of day for fair comparison
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find all active reservations (reservations that include today)
      // A reservation is active if: reservedFrom <= today AND reservedTo >= today
      const activeReservations =
        await this.prismaService.roomReservation.findMany({
          where: {
            reservedFrom: { lt: tomorrow }, // Starts before tomorrow (includes today)
            reservedTo: { gte: today }, // Ends on or after today
          },
          select: {
            roomId: true,
          },
        });

      const activeRoomIds = [
        ...new Set(activeReservations.map((r) => r.roomId)),
      ];

      // Update all rooms in one go
      await this.prismaService.$transaction([
        // Set isReserved = true for rooms with active reservations
        this.prismaService.room.updateMany({
          where: { id: { in: activeRoomIds } },
          data: { isReserved: true },
        }),
        // Set isReserved = false for rooms without active reservations
        this.prismaService.room.updateMany({
          where: { id: { notIn: activeRoomIds }, isReserved: true },
          data: { isReserved: false },
        }),
      ]);

      this.logger.log(`Updated ${activeRoomIds.length} rooms as reserved`);
    } catch (error) {
      this.logger.error('Error updating room reservation status:', error);
    }
  }
}
