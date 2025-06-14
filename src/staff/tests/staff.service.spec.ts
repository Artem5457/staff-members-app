import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from '../staff.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma';
import { Role } from '../../app.constants';

describe('StaffService', () => {
  let service: StaffService;
  let prismaMock: {
    staffMember: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      staffMember: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
  });

  describe('createStaff', () => {
    it('should create a staff member successfully', async () => {
      const newStaff = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: Role.EMPLOYEE,
        baseSalary: 40000,
      };

      prismaMock.staffMember.findUnique.mockResolvedValue(null);
      prismaMock.staffMember.create.mockResolvedValue(newStaff);

      const result = await service.createStaff({
        email: 'test@example.com',
        name: 'Test User',
        role: Role.EMPLOYEE,
        baseSalary: 40000,
      } as Prisma.StaffMemberUncheckedCreateInput);

      expect(result).toEqual(newStaff);
      expect(prismaMock.staffMember.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(prismaMock.staffMember.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          role: Role.EMPLOYEE,
          baseSalary: 40000,
        },
      });
    });

    it('should throw ConflictException if staff member already exists', async () => {
      prismaMock.staffMember.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Existing User',
      });

      await expect(
        service.createStaff({
          email: 'test@example.com',
          name: 'Test User',
          role: Role.EMPLOYEE,
          baseSalary: 40000,
        } as Prisma.StaffMemberUncheckedCreateInput),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.staffMember.create).not.toHaveBeenCalled();
    });
  });

  describe('updateStaff', () => {
    it('should update a staff member successfully', async () => {
      const staffId = 1;
      const updateData = { name: 'Updated Name' };
      const updatedStaff = {
        id: 1,
        email: 'test@example.com',
        name: 'Updated Name',
      };

      prismaMock.staffMember.findUnique.mockResolvedValue(updatedStaff);
      prismaMock.staffMember.update.mockResolvedValue(updatedStaff);

      const result = await service.updateStaff(
        staffId,
        updateData as Prisma.StaffMemberUpdateInput,
      );

      expect(result).toEqual(updatedStaff);
      expect(prismaMock.staffMember.update).toHaveBeenCalledWith({
        where: { id: staffId },
        data: updateData,
      });
    });

    it('should throw NotFoundException if staff member does not exist', async () => {
      prismaMock.staffMember.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStaff(1, {
          name: 'New Name',
        } as Prisma.StaffMemberUpdateInput),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.staffMember.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteStaff', () => {
    it('should delete a staff member successfully', async () => {
      const staffId = 1;
      const staffMember = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      };

      prismaMock.staffMember.findUnique.mockResolvedValue(staffMember);
      prismaMock.staffMember.delete.mockResolvedValue(staffMember);

      const result = await service.deleteStaff(staffId);

      expect(result).toEqual(staffMember);
      expect(prismaMock.staffMember.delete).toHaveBeenCalledWith({
        where: { id: staffId },
      });
    });

    it('should throw NotFoundException if staff member does not exist', async () => {
      prismaMock.staffMember.findUnique.mockResolvedValue(null);

      await expect(service.deleteStaff(1)).rejects.toThrow(NotFoundException);

      expect(prismaMock.staffMember.delete).not.toHaveBeenCalled();
    });
  });

  describe('getStaffMemberWithSubs', () => {
    it('should get a staff member with subordinates successfully', async () => {
      const staffMemberWithSubs = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        subordinates: [
          { id: 2, email: 'sub@example.com', name: 'Subordinate User' },
        ],
      };

      prismaMock.staffMember.findUnique.mockResolvedValue(staffMemberWithSubs);

      const result = await service.getStaffMemberWithSubs(1);

      expect(result).toEqual(staffMemberWithSubs);
      expect(prismaMock.staffMember.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { subordinates: true },
      });
    });

    it('should throw NotFoundException if staff member does not exist', async () => {
      prismaMock.staffMember.findUnique.mockResolvedValue(null);

      await expect(service.getStaffMemberWithSubs(1)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.staffMember.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { subordinates: true },
      });
    });
  });

  describe('getStaffMembers', () => {
    it('should get all staff members successfully', async () => {
      const staffMembers = [
        { id: 1, email: 'test@example.com', name: 'Test User' },
        { id: 2, email: 'sub@example.com', name: 'Subordinate User' },
      ];

      prismaMock.staffMember.findMany.mockResolvedValue(staffMembers);

      const result = await service.getStaffMembers();

      expect(result).toEqual(staffMembers);
      expect(prismaMock.staffMember.findMany).toHaveBeenCalled();
    });
  });
});
