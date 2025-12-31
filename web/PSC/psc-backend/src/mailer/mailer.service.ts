import { Inject, Injectable } from '@nestjs/common';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  constructor(@Inject('MAIL_TRANSPORT') private transporter: Transporter) {}

  async sendMail(to: string, cc: any[]= [], subject: string, body: string) {
    return await this.transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to,
      cc,
      subject,
      html: body,
    });
  }
}
