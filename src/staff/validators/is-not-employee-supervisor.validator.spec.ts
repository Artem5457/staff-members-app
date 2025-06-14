import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmployeeSupervisor } from './is-not-employee-supervisor.validator';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '../../app.constants';
import { StaffMember } from 'generated/prisma';

describe('IsNotEmployeeSupervisor', () => {
  let validator: IsNotEmployeeSupervisor;

  const prismaMock = {
    staffMember: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsNotEmployeeSupervisor,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    validator = module.get<IsNotEmployeeSupervisor>(IsNotEmployeeSupervisor);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return true if supervisorId is missing', async () => {
      const result = await validator.validate(null);
      expect(result).toBe(true);
      expect(prismaMock.staffMember.findUnique).not.toHaveBeenCalled();
    });

    it('should return false if supervisor is not found', async () => {
      prismaMock.staffMember.findUnique.mockResolvedValue(null);

      const result = await validator.validate(95);
      expect(result).toBe(false);
      expect(prismaMock.staffMember.findUnique).toHaveBeenCalledWith({
        where: { id: 95 },
      });
    });

    it('should return false if the supervisor role — EMPLOYEE', async () => {
      prismaMock.staffMember.findUnique.mockResolvedValue({
        id: 1,
        role: Role.EMPLOYEE,
      });

      const result = await validator.validate(1);
      expect(result).toBe(false);
      expect(prismaMock.staffMember.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return true if the supervisor role is not EMPLOYEE', async () => {
      prismaMock.staffMember.findUnique.mockResolvedValue({
        id: 13,
        role: Role.MANAGER,
      });

      const result = await validator.validate(13);
      expect(result).toBe(true);
      expect(prismaMock.staffMember.findUnique).toHaveBeenCalledWith({
        where: { id: 13 },
      });
    });
  });

  describe('defaultMessage', () => {
    it('should return a message if supervisor is not found', () => {
      validator['supervisor'] = null;

      const message = validator.defaultMessage();
      expect(message).toBe('This supervisor does not work in company');
    });

    it('should return a message if the supervisor role is EMPLOYEE', () => {
      validator['supervisor'] = { id: 1, role: Role.EMPLOYEE } as StaffMember;

      const message = validator.defaultMessage();
      expect(message).toBe('Supervisor cannot have role EMPLOYEE');
    });
  });
});
