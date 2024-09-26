export const eventsData = [
  "Team meeting",
  "Meeting with John",
  "Optional meeting",
  "External Meeting",
  "Team Lunch",
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
  { title: "Team meeting", time: "09:00 - 10:00", link: "#" },
  {
    title: "Meeting with John",
    time: "10:00 - 11:00",
    link: "#",
  },
  {
    title: "Optional meeting",
    time: "11:00 - 12:00",
    link: "#",
  },
  { title: "Team Lunch", time: "12:00 - 13:00" },
];
