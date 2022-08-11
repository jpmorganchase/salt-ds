import { createIcon } from "../icon/createIcon";

export const ClockIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="ClockIcon">
    <path d="M6 3v3H3v1h4V3H6z" />
    <path d="M12 6A6 6 0 1 0 0 6a6 6 0 0 0 12 0zm-1 0A5 5 0 1 1 .999 5.999 5 5 0 0 1 11 6z" />
  </svg>,
  "Clock",
  "clock"
);
