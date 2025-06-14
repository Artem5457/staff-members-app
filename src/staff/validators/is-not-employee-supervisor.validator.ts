import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Role } from '../../app.constants';
import { PrismaService } from '../../database/prisma.service';
import { StaffMember } from 'generated/prisma';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsNotEmployeeSupervisor implements ValidatorConstraintInterface {
  private supervisor: StaffMember | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async validate(supervisorId: number | null) {
    if (!supervisorId) return true;

    this.supervisor = await this.prisma.staffMember.findUnique({
      where: { id: supervisorId },
    });

    if (this.supervisor) {
      return this.supervisor.role !== Role.EMPLOYEE;
    }

    return false;
  }

  defaultMessage() {
    if (!this.supervisor) {
      return 'This supervisor does not work in company';
    }

    return 'Supervisor cannot have role EMPLOYEE';
  }
}
