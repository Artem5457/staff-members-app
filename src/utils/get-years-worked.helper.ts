export const getYearsWorked = (date: Date): number => {
  const currentDate = new Date();
  const joinedDate = date;

  let yearsDifference = currentDate.getFullYear() - joinedDate.getFullYear();

  if (
    currentDate.getMonth() < joinedDate.getMonth() ||
    (currentDate.getMonth() === joinedDate.getMonth() &&
      currentDate.getDate() < joinedDate.getDate())
  ) {
    yearsDifference--;
  }

  return yearsDifference >= 0 ? yearsDifference : 0;
};
