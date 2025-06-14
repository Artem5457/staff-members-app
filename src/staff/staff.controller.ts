import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import { StaffMember } from '../../generated/prisma';
import { STAFF_BASE_SALARY } from '../app.constants';
import { CalculateSalaryService, SalaryRes } from './calculate-salary.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SalaryResDto,
  StaffMemberDto,
  SumSalariesDto,
} from './dto/staff-member.swagger.dto';

@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly calculateSalaryService: CalculateSalaryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all staff members' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved staff members',
    type: [StaffMemberDto],
  })
  async getStaffMembers(): Promise<StaffMember[]> {
    return this.staffService.getStaffMembers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff member with subordinates' })
  @ApiParam({ name: 'id', description: 'Staff member ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Staff member with subordinates retrieved',
    type: StaffMemberDto,
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async getStaffWithSubs(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.getStaffMemberWithSubs(id);
  }

  @Get(':id/salary')
  @ApiOperation({ summary: 'Get salary for a staff member' })
  @ApiParam({ name: 'id', description: 'Staff member ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Salary retrieved successfully',
    type: SalaryResDto,
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async getMemberSalary(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SalaryRes> {
    return this.calculateSalaryService.getMemberSalary(id);
  }

  @Get('salary/sum')
  @ApiOperation({ summary: 'Get sum of all salaries' })
  @ApiResponse({
    status: 200,
    description: 'Sum of salaries calculated successfully',
    type: SumSalariesDto,
  })
  async getSalariesSum(): Promise<{ sumSalaries: number }> {
    return this.calculateSalaryService.getSumSalaryOfStaff();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiResponse({
    status: 201,
    description: 'Staff member created successfully',
    type: StaffMemberDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Staff member already exists' })
  async createStaff(@Body() data: CreateStaffDto): Promise<StaffMember> {
    return this.staffService.createStaff({
      ...data,
      baseSalary: STAFF_BASE_SALARY[data.role],
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing staff member' })
  @ApiParam({ name: 'id', description: 'Staff member ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Staff member updated successfully',
    type: StaffMemberDto,
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async updateStaff(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateStaffDto,
  ): Promise<StaffMember> {
    return this.staffService.updateStaff(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a staff member' })
  @ApiParam({ name: 'id', description: 'Staff member ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Staff member deleted successfully',
    type: StaffMemberDto,
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async deleteStaff(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StaffMember> {
    return this.staffService.deleteStaff(id);
  }
}
