import { getYearsWorked } from './get-years-worked.helper';

describe('getYearsWorked', () => {
  const mockCurrentDate = new Date('2025-06-15T00:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockCurrentDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('return 0, if joinedDate is current date', () => {
    const joinedDate = new Date('2025-06-15');
    expect(getYearsWorked(joinedDate)).toBe(0);
  });

  it('return 0, if joinedDate is in this year, but after current date', () => {
    const joinedDate = new Date('2025-12-01');
    expect(getYearsWorked(joinedDate)).toBe(0);
  });

  it('return 0, if joinedDate less than 1 year', () => {
    const joinedDate = new Date('2024-07-01');
    expect(getYearsWorked(joinedDate)).toBe(0);
  });

  it('return 1, if joinedDate exactly one year ago', () => {
    const joinedDate = new Date('2024-06-15');
    expect(getYearsWorked(joinedDate)).toBe(1);
  });

  it('return correct count of years, if joinedDate was many years ago', () => {
    const joinedDate = new Date('2000-06-12');
    expect(getYearsWorked(joinedDate)).toBe(25);
  });

  it('correctly takes into account the day and month', () => {
    const joinedDate = new Date('2024-06-15');
    expect(getYearsWorked(joinedDate)).toBe(1);

    const joinedDate2 = new Date('2024-06-16');
    expect(getYearsWorked(joinedDate2)).toBe(0);
  });
});
