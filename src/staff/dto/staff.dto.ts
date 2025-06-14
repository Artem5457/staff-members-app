import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { Role } from '../../app.constants';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmployeeSupervisor } from '../validators/is-not-employee-supervisor.validator';

export class CreateStaffDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of the staff member',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Smith',
    description: 'Last name of the staff member',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'john.smith@gmail.com',
    description: 'Email address of staff member',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '2024-06-19',
    description: 'Date when staff member joined the company (YYYY-MM-DD)',
    type: String,
    format: 'date',
  })
  @Transform(({ value }: { value: string }) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toISOString();
  })
  @IsDateString(
    { strict: false },
    { message: 'joinedDate must be a valid date in YYYY-MM-DD format' },
  )
  @IsNotEmpty()
  joinedDate: string;

  @ApiProperty({
    enum: Role,
    example: Role.EMPLOYEE,
    description: 'Role of the staff member',
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @ApiProperty({
    example: 2,
    description: 'Supervisor ID (not required for employees)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Validate(IsNotEmployeeSupervisor)
  supervisorId?: number;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}
