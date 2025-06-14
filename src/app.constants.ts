export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  SALES = 'SALES',
}

export const STAFF_BASE_SALARY: Record<Role, number> = {
  [Role.EMPLOYEE]: 40000,
  [Role.MANAGER]: 60000,
  [Role.SALES]: 50000,
};

export const MAX_PERCENTAGE: Record<Role, number> = {
  [Role.EMPLOYEE]: 30,
  [Role.MANAGER]: 40,
  [Role.SALES]: 35,
};

export const YEAR_BONUS: Record<Role, number> = {
  [Role.EMPLOYEE]: 0.03,
  [Role.MANAGER]: 0.05,
  [Role.SALES]: 0.01,
};
