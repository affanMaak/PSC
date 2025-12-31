import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  CreateAffiliatedClubDto,
  UpdateAffiliatedClubDto,
  CreateAffiliatedClubRequestDto,
  UpdateRequestStatusDto,
  RequestStatus,
} from './dtos/affiliation.dto';
import { sendMailClubAff, sendMailMemberAff } from 'src/utils/messages';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AffiliationService {
  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerService,
    private cloudinary: CloudinaryService,
  ) { }

  // -------------------- AFFILIATED CLUBS --------------------

  async getAffiliatedClubs() {
    return await this.prismaService.affiliatedClub.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        requests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getAffiliatedClubsActive() {
    return await this.prismaService.affiliatedClub.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        requests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getAffiliatedClubById(id: number) {
    const club = await this.prismaService.affiliatedClub.findUnique({
      where: { id: Number(id) },
      include: {
        requests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!club) {
      throw new HttpException(
        'Affiliated club not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return club;
  }

  async createAffiliatedClub(payload: CreateAffiliatedClubDto, file?: Express.Multer.File) {
    let imageUrl = null;
    if (file) {
      const upload = await this.cloudinary.uploadFile(file);
      imageUrl = upload.url;
    }

    return await this.prismaService.affiliatedClub.create({
      data: {
        name: payload.name,
        location: payload.location,
        contactNo: payload.contactNo,
        email: payload.email,
        description: payload.description,
        image: imageUrl ?? null,
        isActive: payload.isActive ?? true,
      },
    });
  }

  async updateAffiliatedClub(payload: UpdateAffiliatedClubDto, file?: Express.Multer.File) {
    if (!payload.id) {
      throw new HttpException(
        'Affiliated club ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if club exists
    await this.getAffiliatedClubById(payload.id);

    let imageUrl = payload.image; // Keep existing if not replaced
    if (file) {
      const upload = await this.cloudinary.uploadFile(file);
      imageUrl = upload.url;
    }

    return await this.prismaService.affiliatedClub.update({
      where: { id: Number(payload.id) },
      data: {
        name: payload.name,
        location: payload.location,
        contactNo: payload.contactNo,
        email: payload.email,
        description: payload.description,
        image: imageUrl ?? null,
        isActive: payload.isActive,
      },
    });
  }

  async deleteAffiliatedClub(id: number) {
    if (!id) {
      throw new HttpException(
        'Affiliated club ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if club exists
    await this.getAffiliatedClubById(id);

    return await this.prismaService.affiliatedClub.delete({
      where: { id: Number(id) },
    });
  }

  // -------------------- AFFILIATED CLUB REQUESTS --------------------

  async getAffiliatedClubRequests() {
    return await this.prismaService.affiliatedClubRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        affiliatedClub: true,
      },
    });
  }

  async getRequestById(id: number) {
    const request = await this.prismaService.affiliatedClubRequest.findUnique({
      where: { id: Number(id) },
      include: {
        affiliatedClub: true,
      },
    });

    if (!request) {
      throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
    }

    return request;
  }

  async createRequest(payload: CreateAffiliatedClubRequestDto) {
    // Check if club exists
    const club = await this.prismaService.affiliatedClub.findFirst({
      where: { id: payload.affiliatedClubId },
      select: { email: true }
    })
    if (!club) {
      throw new HttpException('Club not found', HttpStatus.NOT_FOUND);
    }

    // Check if member exists
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: payload.membershipNo.toString() },
      select: { Email: true }
    })
    if (!member) {
      throw new HttpException('Member not found', HttpStatus.NOT_FOUND);
    }

    const mailSent = this.sendRequestEmail(member.Email!, club, payload)
    if(!mailSent){
      throw new HttpException('Mail not sent', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return await this.prismaService.affiliatedClubRequest.create({
      data: {
        membershipNo: payload.membershipNo.toString(),
        affiliatedClubId: payload.affiliatedClubId,
        requestedDate: new Date(payload.requestedDate)
      },
      include: {
        affiliatedClub: true,
      },
    });
  }

  private async sendRequestEmail(
    member: string,
    club: any,
    request: any,
  ) {
    const message = this.createRequestEmailContent(member, club, request);
    await this.mailerService.sendMail(
      club.email,
      [member, process.env.NODEMAILER_USER],
      `New Visit Request - ${club.name}`,
      message,
    );
  }

  private createRequestEmailContent(
    member: any,
    club: any,
    request: any,
  ): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
        .content { padding: 20px 0; }
        .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Visit Request</h2>
          <p><strong>Club:</strong> ${club.name}</p>
        </div>
        
        <div class="content">
          <p>Dear ${club.name} Team,</p>
          
          <p>A new visit request has been submitted. Please find the details below:</p>
          
          <div class="details">
            <h3>Request Details:</h3>
            <p><strong>Request ID:</strong> ${request.id}</p>
            <p><strong>Request Date:</strong> ${new Date(request.requestedDate).toLocaleDateString()}</p>
            
            <h3>Member Details:</h3>
            <p><strong>Name:</strong> ${member.Name}</p>
            <p><strong>Membership No:</strong> ${member.Membership_No}</p>
            <p><strong>Email:</strong> ${member.Email}</p>
            <p><strong>Contact No:</strong> ${member.Contact_No}</p>
          </div>
          
          <p>This email has been CC'd to the member and PSC Club for reference.</p>
          
          <p>Please review this request and take appropriate action.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
          <p>© ${new Date().getFullYear()} Club Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
  }



}
