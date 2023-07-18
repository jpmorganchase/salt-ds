export const formatDate = (date: Date): string => {
    if (isNaN(date.getTime())) {
      return "To be seen";
    } else {
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
      };
  
      const formatter = new Intl.DateTimeFormat(undefined, options);
      const formattedDateParts = formatter.formatToParts(date);
  
      const monthNumber = date.getMonth() + 1;
      const quarter = Math.floor((monthNumber - 1) / 3) + 1;
      const day = formattedDateParts.find((part) => part.type === "day")?.value;
      const month = formattedDateParts.find((part) => part.type === "month")?.value;
      const year = formattedDateParts.find((part) => part.type === "year")?.value;
  
      return `${day} ${month} ${year} (Q${quarter})`;
    }
  };