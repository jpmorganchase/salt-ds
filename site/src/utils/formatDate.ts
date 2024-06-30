export const formatDate = (date: Date): string => {
  if (isNaN(date.getTime())) {
    return "Not yet defined";
  }
  const formatter = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedDate = formatter.format(date);
  const [day, month, year] = formattedDate.split(" ");

  const monthNumber = date.getMonth() + 1;
  const quarter = Math.floor((monthNumber - 1) / 3) + 1;

  return `${day} ${month} ${year} (Q${quarter})`;
};
