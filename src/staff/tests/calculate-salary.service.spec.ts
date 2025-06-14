import { Test, TestingModule } from '@nestjs/testing';
import { CalculateSalaryService } from '../calculate-salary.service';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '../../app.constants';
import { NotFoundException } from '@nestjs/common';
import { StaffMember } from '../../../generated/prisma';
import * as utils from '../../utils/get-years-worked.helper';

interface PrismaMock {
  staffMember: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
}

describe('CalculateSalaryService', () => {
  let service: CalculateSalaryService;
  let prismaMock: PrismaMock;

  beforeEach(async () => {
    prismaMock = {
      staffMember: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateSalaryService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CalculateSalaryService>(CalculateSalaryService);
  });

  describe('getMemberSalary', () => {
    it('should calculate salary for a valid staff member', async () => {
      const staffMember = {
        id: 2,
        role: Role.MANAGER,
        joinedDate: '2012-04-15T00:00:00.000Z',
        baseSalary: 1000,
        supervisorId: 1,
      };

      prismaMock.staffMember.findUnique.mockResolvedValue(staffMember);
      jest.spyOn<any, any>(service, 'calculateSalary').mockResolvedValue(1200);

      const result = await service.getMemberSalary(2);

      expect(result).toEqual({ status: 'OK', salary: 1200 });
      expect(prismaMock.staffMember.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
      });
    });

    it('should throw NotFoundException uf staff member does not exist', async () => {
      prismaMock.staffMember.findUnique.mockResolvedValue(null);

      await expect(service.getMemberSalary(12)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSumSalaryOfStaff', () => {
    it('should return the total salary of all staff members', async () => {
      const staffMembers = [
        {
          id: 1,
          role: Role.EMPLOYEE,
          baseSalary: 1000,
          joinedDate: new Date('2020-01-01'),
          supervisorId: 2,
          email: 'test@gmail.com',
          name: 'Staff1',
        },
        {
          id: 2,
          role: Role.MANAGER,
          baseSalary: 2000,
          joinedDate: new Date('2015-01-01'),
          supervisorId: null,
          email: 'test1@gmail.com',
          name: 'Staff2',
        },
        {
          id: 3,
          role: Role.SALES,
          baseSalary: 1500,
          joinedDate: new Date('2018-01-21'),
          supervisorId: null,
          email: 'test1@gmail.com',
          name: 'Staff2',
        },
      ];

      prismaMock.staffMember.findMany.mockResolvedValue(staffMembers);
      jest.spyOn<any, any>(service, 'calculateSalary').mockResolvedValue(2500);

      const result = await service.getSumSalaryOfStaff();

      expect(result).toEqual({ sumSalaries: 7500 });
      expect(prismaMock.staffMember.findMany).toHaveBeenCalled();
    });

    it('should return 0 if no staff members exist', async () => {
      prismaMock.staffMember.findMany.mockResolvedValue([]);

      const result = await service.getSumSalaryOfStaff();

      expect(result).toEqual({ sumSalaries: 0 });
    });
  });

  describe('calculateSalary', () => {
    it('should calculate salary with bonuses correctly', async () => {
      const staffMember = {
        id: 3,
        role: Role.EMPLOYEE,
        baseSalary: 3500,
        supervisorId: null,
      } as StaffMember;

      jest
        .spyOn<any, any>(service, 'calculateSubordinateBonus')
        .mockResolvedValue(0);
      jest.spyOn(utils, 'getYearsWorked').mockImplementation(() => 5);

      const result = await service['calculateSalary'](staffMember);

      expect(result).toBeCloseTo(4025);
    });

    it('should calculate salary with subordinate bonus', async () => {
      const staffMember = {
        id: 3,
        role: Role.MANAGER,
        baseSalary: 2500,
        supervisorId: null,
      } as StaffMember;

      jest
        .spyOn<any, any>(service, 'calculateSubordinateBonus')
        .mockResolvedValue(230);
      jest.spyOn(utils, 'getYearsWorked').mockImplementation(() => 5);

      const result = await service['calculateSalary'](staffMember);

      expect(result).toBeCloseTo(3355);
    });
  });

  describe('calculateSubordinateBonus', () => {
    it('should calculate subordinate bonus for MANAGER correctly', async () => {
      const member = {
        id: 1,
        role: Role.MANAGER,
        baseSalary: 5000,
        joinedDate: new Date('2020-01-01'),
      } as StaffMember;

      const subordinates = [
        { id: 2, baseSalary: 3000 },
        { id: 3, baseSalary: 3500 },
      ] as StaffMember[];

      jest
        .spyOn(service as any, 'getSubordinates')
        .mockResolvedValue(subordinates);
      jest
        .spyOn(service as any, 'calculateSalary')
        .mockImplementation((sub: StaffMember) => sub.baseSalary);

      const result = await service['calculateSubordinateBonus'](member);

      const expectedSubordinateBonus = 0.005 * (3000 + 3500);

      expect(result).toBeCloseTo(expectedSubordinateBonus);
    });

    it('should calculate subordinate bonus for SALES correctly', async () => {
      const member = {
        id: 1,
        role: Role.SALES,
        baseSalary: 4000,
        joinedDate: new Date('2019-01-01'),
      } as StaffMember;

      const subordinates = [
        { id: 2, baseSalary: 2500, supervisorId: 1 },
        { id: 3, baseSalary: 2000, supervisorId: 1 },
      ] as StaffMember[];

      jest
        .spyOn(service as any, 'getSubordinates')
        .mockImplementation((id) => (id === 1 ? subordinates : []));

      jest
        .spyOn(service as any, 'calculateSalary')
        .mockImplementation((sub: StaffMember) => sub.baseSalary);

      const result = await service['calculateSubordinateBonus'](member);

      const expectedSubordinateBonus = 0.003 * (2500 + 2000);

      expect(result).toBeCloseTo(expectedSubordinateBonus);
    });

    it('should return 0 for non-managerial and non-sales roles', async () => {
      const member = {
        id: 1,
        role: Role.EMPLOYEE,
        baseSalary: 4000,
        joinedDate: new Date('2019-01-01'),
      } as StaffMember;

      const result = await service['calculateSubordinateBonus'](member);

      expect(result).toBe(0);
    });

    it('should handle case when there are no subordinates', async () => {
      const member = {
        id: 1,
        role: Role.MANAGER,
        baseSalary: 5000,
        joinedDate: new Date('2020-01-01'),
      } as StaffMember;

      jest.spyOn(service as any, 'getSubordinates').mockResolvedValue([]);

      const result = await service['calculateSubordinateBonus'](member);

      expect(result).toBe(0);
    });
  });
});
