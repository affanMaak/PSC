import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import * as nodemailer from 'nodemailer';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true
    })],
    providers: [
        {
            provide: 'MAIL_TRANSPORT',
            useFactory: async () =>
                nodemailer.createTransport({
                    host: process.env.NODEMAILER_HOST,
                    port: Number(process.env.NODEMAILER_PORT),
                    auth: {
                        user: process.env.NODEMAILER_USER,
                        pass: process.env.NODEMAILER_PASS,
                    },
                    secure: true,
                }),
        },
        MailerService,
    ],
    exports: ["MAIL_TRANSPORT", MailerService]
})
export class MailerModule { }
