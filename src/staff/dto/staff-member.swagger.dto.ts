import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../app.constants';
import { StaffMember } from '../../../generated/prisma';
import { IsOptional } from 'class-validator';

export class StaffMemberDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  joinedDate: Date;

  @ApiProperty()
  baseSalary: number;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  supervisorId: number;

  @ApiProperty({
    type: [Object],
  })
  @IsOptional()
  subordinates?: StaffMember[];
}

export class SalaryResDto {
  @ApiProperty({ example: 'OK' })
  status: string;

  @ApiProperty({ example: 20456, description: 'Staff member salary' })
  salary: number;
}

export class SumSalariesDto {
  @ApiProperty({
    example: '300000',
    description: 'Sum of staff members salaries in company',
  })
  sumSalaries: number;
}
