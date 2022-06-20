import { createIcon } from "../icon/createIcon";

export const ClockIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="ClockIcon">
    <path d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0zm0 1a5 5 0 1 0 .001 10.001A5 5 0 0 0 6 1zm1 2v4H3V6h3V3h1z" />
  </svg>,
  "Clock",
  "clock"
);
