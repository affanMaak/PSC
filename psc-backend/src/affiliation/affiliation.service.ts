import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
  ) {}

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

  async createAffiliatedClub(payload: CreateAffiliatedClubDto) {
    return await this.prismaService.affiliatedClub.create({
      data: {
        name: payload.name,
        location: payload.location,
        contactNo: payload.contactNo,
        email: payload.email,
        description: payload.description,
        isActive: payload.isActive ?? true,
      },
    });
  }

  async updateAffiliatedClub(payload: UpdateAffiliatedClubDto) {
    if (!payload.id) {
      throw new HttpException(
        'Affiliated club ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if club exists
    await this.getAffiliatedClubById(payload.id);

    return await this.prismaService.affiliatedClub.update({
      where: { id: Number(payload.id) },
      data: {
        name: payload.name,
        location: payload.location,
        contactNo: payload.contactNo,
        email: payload.email,
        description: payload.description,
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

  async getAffiliatedClubRequests(status?: string) {
    const where = status ? { status: status as RequestStatus } : {};

    return await this.prismaService.affiliatedClubRequest.findMany({
      where,
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
    await this.getAffiliatedClubById(payload.affiliatedClubId);

    return await this.prismaService.affiliatedClubRequest.create({
      data: {
        membershipNo: payload.membershipNo,
        affiliatedClubId: payload.affiliatedClubId,
        guestCount: payload.guestCount || 0,
        purpose: payload.purpose,
      },
      include: {
        affiliatedClub: true,
      },
    });
  }

  async updateRequestStatus(payload: UpdateRequestStatusDto) {
    if (!payload.id) {
      throw new HttpException('Request ID is required', HttpStatus.BAD_REQUEST);
    }

    // Check if request exists
    await this.getRequestById(payload.id);

    const updateData: any = {
      status: payload.status,
    };

    if (payload.status === 'APPROVED') {
      updateData.approvedDate = new Date();
    } else if (payload.status === 'REJECTED') {
      updateData.rejectedDate = new Date();
    }

    return await this.prismaService.affiliatedClubRequest.update({
      where: { id: Number(payload.id) },
      data: updateData,
      include: {
        affiliatedClub: true,
      },
    });
  }

  async deleteRequest(id: number) {
    if (!id) {
      throw new HttpException('Request ID is required', HttpStatus.BAD_REQUEST);
    }

    // Check if request exists
    await this.getRequestById(id);

    return await this.prismaService.affiliatedClubRequest.delete({
      where: { id: Number(id) },
    });
  }

  // send mail to member
  private async mailToMember(
    status: 'APPROVED' | 'REJECTED',
    memberId: string,
    request: any,
    clubId: number,
    purpose?: string,
  ) {
    // fetch member
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: memberId },
      select: {
        Membership_No: true,
        Name: true,
        Email: true,
        Contact_No: true,
      },
    });

    // fetch club
    const club = await this.prismaService.affiliatedClub.findFirst({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
      },
    });
    const message = sendMailMemberAff(
      status,
      member,
      club,
      purpose || '',
      request.id,
      request.requestedDate,
    );

    return await this.mailerService.sendMail(
      member?.Email!,
      `${club?.name} Visit Request – ${status} (Request ID: ${request?.id})`,
      message,
    );
  }
  // send mail to club
  private async mailToClub(
    memberId: string,
    request: any,
    clubId: number,
    purpose?: string,
  ) {
    // fetch member
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: memberId },
      select: {
        Membership_No: true,
        Name: true,
        Email: true,
        Contact_No: true,
      },
    });

    // fetch club
    const club = await this.prismaService.affiliatedClub.findFirst({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
      },
    });
    const message = sendMailClubAff(
      member,
      club,
      purpose || '',
      request.id,
      request.requestedDate,
    );

    return await this.mailerService.sendMail(
      club?.email!,
      `${member?.Name} Visit Request – (Request ID: ${request?.id})`,
      message,
    );
  }

  // handle approval/rejection
  async handleAction(status: 'APPROVED' | 'REJECTED', requestId: number) {
    // fetch request
    const request = await this.prismaService.affiliatedClubRequest.findFirst({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found!');

    // send mails
    const sentMember = await this.mailToMember(
      status,
      request.membershipNo,
      request,
      Number(request.affiliatedClubId),
      request.purpose!,
    );

    if (!sentMember)
      throw new UnprocessableEntityException("Couldn't send mail to member");
    console.log('Member sent: ', sentMember);

    if (status === 'APPROVED') {
      const sentClub = await this.mailToClub(
        request.membershipNo,
        request,
        Number(request.affiliatedClubId),
        request.purpose!,
      );

      if (!sentClub)
        throw new UnprocessableEntityException("Couldn't send mail to member");
      console.log('club sent: ', sentClub);
    }

    // toggle state in db
    return await this.prismaService.affiliatedClubRequest.update({
      where: { id: requestId },
      data: {
        status,
      },
    });
  }
}
