import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { QueueMessage, QueueMeta, QueueStatus } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly META_FILE = path.join(process.cwd(), 'src/notification', 'queue.meta.json');

    private readonly defaultMeta: QueueMeta = {
        readOffset: 0,
        writeOffset: 0,
        totalMessages: 0,
        pendingCount: 0,
        processingCount: 0,
        doneCount: 0,
        failedCount: 0,
    };

    loadMeta(): QueueMeta {
        if (!fs.existsSync(this.META_FILE)) {
            this.saveMeta(this.defaultMeta);
            return { ...this.defaultMeta };
        }
        return JSON.parse(fs.readFileSync(this.META_FILE, 'utf8'));
    }

    saveMeta(meta: QueueMeta): void {
        fs.writeFileSync(this.META_FILE, JSON.stringify(meta, null, 2));
    }

    private readonly QUEUE_FILE = path.join(process.cwd(), 'src/notification', 'queue.jsonl');

    recalc(): void {
        const meta = this.loadMeta();

        if (!fs.existsSync(this.QUEUE_FILE)) {
            Object.assign(meta, this.defaultMeta);
            this.saveMeta(meta);
            return;
        }

        const raw = fs.readFileSync(this.QUEUE_FILE, 'utf8').trim();
        if (!raw) {
            Object.assign(meta, this.defaultMeta);
            this.saveMeta(meta);
            return;
        }

        const lines: QueueMessage[] = raw
            .split('\n')
            .filter(Boolean)
            .map((line) => JSON.parse(line));

        meta.totalMessages = lines.length;
        meta.pendingCount = 0;
        meta.processingCount = 0;
        meta.doneCount = 0;
        meta.failedCount = 0;

        // Calculate readOffset based on contiguous DONE items from the start
        let newReadOffset = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].status === 'DONE') {
                newReadOffset = i + 1;
            } else {
                break;
            }
        }
        meta.readOffset = newReadOffset;

        for (const msg of lines) {
            if (msg.status === 'PENDING') meta.pendingCount++;
            else if (msg.status === 'PROCESSING') meta.processingCount++;
            else if (msg.status === 'DONE') meta.doneCount++;
            else if (msg.status === 'FAILED') meta.failedCount++;
        }

        // Cleanup if all messages are processed (based on readOffset catching up to length)
        if (meta.readOffset === lines.length && lines.length > 0) {
            fs.writeFileSync(this.QUEUE_FILE, '');
            Object.assign(meta, this.defaultMeta);
        }

        this.saveMeta(meta);
    }

    enqueue(msg: QueueMessage): void {
        const meta = this.loadMeta();

        msg.status = msg.status === 'PROCESSING' ? 'FAILED' : 'PENDING';

        let lines: QueueMessage[] = [];
        if (fs.existsSync(this.QUEUE_FILE)) {
            const raw = fs.readFileSync(this.QUEUE_FILE, 'utf8').trim();
            if (raw) {
                lines = raw.split('\n').map((line) => JSON.parse(line));
            }
        }

        const exists = lines.some((l) => l.id === msg.id);
        lines = lines.filter((l) => l.id !== msg.id);
        lines.push(msg);

        if (!exists) {
            meta.writeOffset++;
            this.saveMeta(meta);
        }

        fs.writeFileSync(
            this.QUEUE_FILE,
            lines.map((l) => JSON.stringify(l)).join('\n') + '\n',
        );

        this.recalc();
    }

    dequeue(): QueueMessage | null {
        if (!fs.existsSync(this.QUEUE_FILE)) return null;

        const raw = fs.readFileSync(this.QUEUE_FILE, 'utf8').trim();
        if (!raw) return null;

        const meta = this.loadMeta();

        const lines: QueueMessage[] = raw
            .split('\n')
            .filter(Boolean)
            .map((line) => JSON.parse(line));

        for (let i = meta.readOffset; i < lines.length; i++) {
            const msg = lines[i];

            if (
                msg.status === 'PENDING' ||
                (msg.status === 'FAILED' && (msg.tries ?? 0) < 10)
            ) {
                msg.status = 'PROCESSING';
                msg.tries = (msg.tries ?? 0) + 1;
                lines[i] = msg;

                fs.writeFileSync(
                    this.QUEUE_FILE,
                    lines.map((l) => JSON.stringify(l)).join('\n') + '\n',
                );

                this.recalc();
                return msg;
            }
        }

        return null;
    }

    updateStatus(id: string, status: QueueStatus): void {
        if (!fs.existsSync(this.QUEUE_FILE)) return;

        let lines: QueueMessage[] = fs
            .readFileSync(this.QUEUE_FILE, 'utf8')
            .trim()
            .split('\n')
            .map((line) => JSON.parse(line));

        lines = lines.map((msg) =>
            msg.id === id ? { ...msg, status } : msg,
        );

        fs.writeFileSync(
            this.QUEUE_FILE,
            lines.map((l) => JSON.stringify(l)).join('\n') + '\n',
        );

        this.recalc();
    }

    async getNotifications() {
        return await this.prisma.notification.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getEmails(ids: string[]) {
        return await this.prisma.member.findMany({
            where: {
                Membership_No: {
                    in: ids
                }
            },
            select: {
                Email: true
            }
        });
    }
    async getEmailsAll(recp: MemberStatus | "ALL") {
        if (recp === "ALL") {
            return await this.prisma.member.findMany({
                select: {
                    Email: true
                }
            });
        }
        return await this.prisma.member.findMany({
            where: {
                Status: recp
            },
            select: {
                Email: true
            }
        });
    }
    async getEmailsActive() {
        return await this.prisma.member.findMany({
            where: {
                Status: 'ACTIVE'
            },
            select: {
                Email: true
            }
        });
    }

    async createNoti(noti: {title: string, description: string}){
        return await this.prisma.notification.create({
            data: {
                title: noti.title,
                description: noti.description,
                delivered: false,
            }
        });
    }


    @Cron(CronExpression.EVERY_SECOND)
    async sendNoti() {
        const noti = await this.dequeue();
        if(!noti) return;
        if (noti?.status === "DONE") {
            return;
        }
        const member = await this.prisma.member.findUnique({
            where: {
                Email: noti?.recipient
            },
            select: {
                Sno: true
            }
        });    
        if (!member) {
            return;
        }

        // create deliverednotis
        await this.prisma.deliveredNotis.create({
            data: {
                notificationId: noti?.noti_created!,
                member: member.Sno,
            }
        });

        // update notification status to delivered
        await this.prisma.notification.update({
            where: {
                id: noti?.noti_created!
            },
            data: {
                delivered: true
            }
        });
    }


    async updateSeen(notiID: number){
        return await this.prisma.deliveredNotis.update({
            where: {
                id: notiID
            },
            data: {
                seen: true
            }
        });
    }
}
