import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationDto } from './dtos/notification';
import { v4 as uuid } from 'uuid';
import { MemberStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }


    @Post("send-msg")
    async enqueueNotification(@Body("payload") payload: NotificationDto) {
        let allEmails = new Map<string, any>();

        // Helper to add emails to the map
        const addEmails = (list: any[]) => {
            list.forEach(e => {
                if (e.Email) allEmails.set(e.Email, e);
            });
        };

        if (payload.sendToAll) {
            const list = await this.notificationService.getEmailsAll("ALL");
            addEmails(list);
        } else {
            // Check individual status flags
            if (payload.sendToActive) {
                const list = await this.notificationService.getEmailsAll("ACTIVE");
                addEmails(list);
            }
            if (payload.sendToDeactivated) {
                const list = await this.notificationService.getEmailsAll("DEACTIVATED");
                addEmails(list);
            }
            if (payload.sendToBlocked) {
                const list = await this.notificationService.getEmailsAll("BLOCKED");
                addEmails(list);
            }

            // Check manual recipients
            if (Array.isArray(payload.recipients) && payload.recipients.length > 0) {
                const list = await this.notificationService.getEmails(payload.recipients);
                addEmails(list);
            }
        }

        // create notification for member sno
        const noti_created = await this.notificationService.createNoti({
            title: payload.title,
            description: payload.description,
        });

        for (const [emailStr, emailObj] of allEmails) {
            await this.notificationService.enqueue({
                id: uuid(),
                status: "PENDING",
                noti_created: noti_created.id,
                recipient: emailStr,
            });
        }
    }

    


    @Get("notifications")
    async getNotifications() {
        return this.notificationService.getNotifications();
    }

    @Patch("update-seen")
    async updateSeen(@Body("notiID") notiID: number) {
        return this.notificationService.updateSeen(notiID);
    }



}
