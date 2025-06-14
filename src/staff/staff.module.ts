import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { IsNotEmployeeSupervisor } from './validators/is-not-employee-supervisor.validator';
import { CalculateSalaryService } from './calculate-salary.service';

@Module({
  imports: [PrismaModule],
  controllers: [StaffController],
  providers: [StaffService, IsNotEmployeeSupervisor, CalculateSalaryService],
})
export class StaffModule {}
