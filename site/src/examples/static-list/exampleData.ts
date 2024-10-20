export const eventsData = [
  "Team meeting",
  "Meeting with John",
  "Optional meeting",
  "External meeting",
  "Team lunch",
  "Training event",
  "Coffee break",
  "Conference",
  "Meeting with Jane",
];

export type ListEvent = {
  title: string;
  time: string;
  link?: string;
};
export const complexEventsData = [
  { title: "Team meeting", time: "09:00 to 10:00", link: "#" },
  {
    title: "Meeting with John",
    time: "10:00 to 11:00",
    link: "#",
  },
  {
    title: "Optional meeting",
    time: "11:00 to 12:00",
    link: "#",
  },
  { title: "Team lunch", time: "12:00 to 13:00" },
];
