import { Injectable, NotFoundException } from '@nestjs/common';
import { StaffMember } from '../../generated/prisma';
import { PrismaService } from '../database/prisma.service';
import { getYearsWorked } from '../utils/get-years-worked.helper';
import { MAX_PERCENTAGE, Role, YEAR_BONUS } from '../app.constants';

export interface SalaryRes {
  status: string;
  salary: number;
}

@Injectable()
export class CalculateSalaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getMemberSalary(staffId: number): Promise<SalaryRes> {
    const staffMemberExist = await this.prisma.staffMember.findUnique({
      where: { id: staffId },
    });

    if (!staffMemberExist) {
      throw new NotFoundException('The person does not work in company.');
    }

    const salary = await this.calculateSalary(staffMemberExist);

    return {
      status: 'OK',
      salary,
    };
  }

  async getSumSalaryOfStaff(): Promise<{ sumSalaries: number }> {
    const members = await this.prisma.staffMember.findMany();

    const salaries = await Promise.all(
      members.map(async (member) => {
        return this.calculateSalary(member);
      }),
    );
    const sumSalaries = salaries.reduce((result, salary) => result + salary, 0);

    return { sumSalaries };
  }

  private async calculateSalary(member: StaffMember): Promise<number> {
    const { joinedDate, role, baseSalary } = member;

    const yearsWorked = getYearsWorked(joinedDate);
    const maxPercent = MAX_PERCENTAGE[role];
    const yearBonus = YEAR_BONUS[role];
    const yearsWorkedBonus = Math.min(
      yearsWorked * yearBonus,
      maxPercent / 100,
    );

    const subordinateBonus = await this.calculateSubordinateBonus(member);
    const result = baseSalary * (1 + yearsWorkedBonus) + subordinateBonus;
    return Math.round(result * 100) / 100;
  }

  private async calculateSubordinateBonus(
    member: StaffMember,
  ): Promise<number> {
    let subordinateBonus = 0;

    if (member.role === Role.MANAGER) {
      const subs = await this.getSubordinates(member.id);
      const subsSalaries = await Promise.all(
        subs.map((sub) => this.calculateSalary(sub)),
      );

      subordinateBonus =
        0.005 * subsSalaries.reduce((acc, salary) => acc + salary, 0);
    } else if (member.role === Role.SALES) {
      const calculateTotalSalaries = async (id: number): Promise<number> => {
        const subs = await this.getSubordinates(id);

        const salaries = await Promise.all(
          subs.map(async (sub) => {
            const subSalary = await this.calculateSalary(sub);
            const subSubordinatesSalary = await calculateTotalSalaries(sub.id);

            return subSalary + subSubordinatesSalary;
          }),
        );

        return salaries.reduce((acc, salary) => acc + salary, 0);
      };

      subordinateBonus = 0.003 * (await calculateTotalSalaries(member.id));
    }

    return subordinateBonus;
  }

  private async getSubordinates(id: number): Promise<StaffMember[]> {
    return this.prisma.staffMember.findMany({
      where: { supervisorId: id },
    });
  }
}
