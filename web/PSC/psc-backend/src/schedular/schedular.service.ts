import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SchedularService {
  private readonly logger = new Logger(SchedularService.name);

  constructor(private prismaService: PrismaService) { }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkScheduledOutOfOrder() {
    const MAX_RETRIES = 5;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        await this.prismaService.$transaction(async (tx) => {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

          // ─────────────────────────── ROOMS ───────────────────────────
          const roomsWithActiveOutOfOrder = await tx.room.findMany({
            where: {
              outOfOrders: {
                some: {
                  AND: [{ startDate: { lte: today } }, { endDate: { gt: today } }],
                },
              },
            },
          });

          const roomsToMarkInactive = roomsWithActiveOutOfOrder
            .filter((room) => room.isActive)
            .map((room) => room.id);

          if (roomsToMarkInactive.length > 0) {
            await tx.room.updateMany({
              where: { id: { in: roomsToMarkInactive } },
              data: { isActive: false },
            });
            this.logger.log(`Marked ${roomsToMarkInactive.length} rooms as inactive.`);
          }

          const roomsToReactivate = await tx.room.findMany({
            where: {
              isActive: false,
              outOfOrders: {
                none: {
                  AND: [{ startDate: { lte: today } }, { endDate: { gt: today } }],
                },
              },
            },
            select: { id: true },
          });

          if (roomsToReactivate.length > 0) {
            await tx.room.updateMany({
              where: { id: { in: roomsToReactivate.map((r) => r.id) } },
              data: { isActive: true },
            });
            this.logger.log(`Reactivated ${roomsToReactivate.length} rooms.`);
          }

          // ─────────────────────────── HALLS ───────────────────────────
          const hallsWithActiveOutOfOrder = await tx.hall.findMany({
            where: {
              outOfOrders: {
                some: {
                  AND: [{ startDate: { lte: today } }, { endDate: { gt: today } }],
                },
              },
            },
          });

          const hallsToMarkInactive = hallsWithActiveOutOfOrder
            .filter((hall) => hall.isActive)
            .map((hall) => hall.id);

          if (hallsToMarkInactive.length > 0) {
            await tx.hall.updateMany({
              where: { id: { in: hallsToMarkInactive } },
              data: { isActive: false },
            });
            this.logger.log(`Marked ${hallsToMarkInactive.length} halls as inactive.`);
          }

          const hallsToReactivate = await tx.hall.findMany({
            where: {
              isActive: false,
              outOfOrders: {
                none: {
                  AND: [{ startDate: { lte: today } }, { endDate: { gt: today } }],
                },
              },
            },
            select: { id: true },
          });

          if (hallsToReactivate.length > 0) {
            await tx.hall.updateMany({
              where: { id: { in: hallsToReactivate.map((h) => h.id) } },
              data: { isActive: true },
            });
            this.logger.log(`Reactivated ${hallsToReactivate.length} halls.`);
          }

          // ─────────────────────────── LAWNS ───────────────────────────
          const lawnsWithActiveOutOfOrder = await tx.lawn.findMany({
            where: {
              outOfOrders: {
                some: {
                  AND: [{ startDate: { lte: today } }, { endDate: { gt: today } }],
                },
              },
            },
          });

          const lawnsToMarkOutOfService = lawnsWithActiveOutOfOrder
            .filter((lawn) => !lawn.isOutOfService)
            .map((lawn) => lawn.id);

          if (lawnsToMarkOutOfService.length > 0) {
            await tx.lawn.updateMany({
              where: { id: { in: lawnsToMarkOutOfService } },
              data: { isOutOfService: true },
            });
            this.logger.log(`Marked ${lawnsToMarkOutOfService.length} lawns as out of service.`);
          }

          const lawnsToRestoreService = await tx.lawn.findMany({
            where: {
              isOutOfService: true,
              outOfOrders: {
                none: {
                  AND: [{ startDate: { lte: today } }, { endDate: { gt: today } }],
                },
              },
            },
            select: { id: true },
          });

          if (lawnsToRestoreService.length > 0) {
            await tx.lawn.updateMany({
              where: { id: { in: lawnsToRestoreService.map((l) => l.id) } },
              data: { isOutOfService: false },
            });
            this.logger.log(`Restored service for ${lawnsToRestoreService.length} lawns.`);
          }

          // ─────────────────────────── CLEANUP ───────────────────────────
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          await tx.roomOutOfOrder.deleteMany({ where: { endDate: { lt: thirtyDaysAgo } } });
          await tx.hallOutOfOrder.deleteMany({ where: { endDate: { lt: thirtyDaysAgo } } });
          await tx.lawnOutOfOrder.deleteMany({ where: { endDate: { lt: thirtyDaysAgo } } });
        });

        return;
      } catch (err) {
        if (err.code === 'P2034') {
          retries++;
          this.logger.warn(`Deadlock detected. Retry ${retries}/${MAX_RETRIES}...`);
          await new Promise((res) => setTimeout(res, 200));
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

    const expiredRoomHolds = await this.prismaService.roomHoldings.updateMany({
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
    const expiredHallHolds = await this.prismaService.hallHoldings.updateMany({
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

    // Update lawn holdings
    const expiredLawnHolds = await this.prismaService.lawnHoldings.updateMany({
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
    const totalExpired =
      expiredRoomHolds.count + expiredHallHolds.count + expiredLawnHolds.count;

    if (totalExpired > 0) {
      this.logger.log(
        `Released ${totalExpired} expired holds: ${expiredRoomHolds.count} rooms, ${expiredHallHolds.count} halls, ${expiredLawnHolds.count} lawns`,
      );
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
