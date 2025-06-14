import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, StaffMember } from '../../generated/prisma';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async createStaff(
    data: Prisma.StaffMemberUncheckedCreateInput,
  ): Promise<StaffMember> {
    const staffMemberExist = await this.prisma.staffMember.findUnique({
      where: { email: data.email },
    });

    if (staffMemberExist) {
      throw new ConflictException(
        'The person with this email already works in company.',
      );
    }

    const newStaff = await this.prisma.staffMember.create({
      data,
    });

    return newStaff;
  }

  async updateStaff(
    staffId: number,
    data: Prisma.StaffMemberUpdateInput,
  ): Promise<StaffMember> {
    const staffMemberExist = await this.prisma.staffMember.findUnique({
      where: { id: staffId },
    });

    if (!staffMemberExist) {
      throw new NotFoundException('The person does not work in company.');
    }

    return this.prisma.staffMember.update({
      where: { id: staffId },
      data,
    });
  }

  async deleteStaff(staffId: number): Promise<StaffMember> {
    const staffMemberExist = await this.prisma.staffMember.findUnique({
      where: { id: staffId },
    });

    if (!staffMemberExist) {
      throw new NotFoundException('The person does not work in company.');
    }

    return this.prisma.staffMember.delete({
      where: { id: staffId },
    });
  }

  async getStaffMemberWithSubs(
    staffId: number,
  ): Promise<StaffMember & { subordinates: StaffMember[] }> {
    const member = await this.prisma.staffMember.findUnique({
      where: { id: staffId },
      include: {
        subordinates: true,
      },
    });

    if (!member) {
      throw new NotFoundException('The person does not work in company');
    }

    return member;
  }

  async getStaffMembers(): Promise<StaffMember[]> {
    return this.prisma.staffMember.findMany();
  }
}
