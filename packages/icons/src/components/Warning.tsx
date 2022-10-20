import { createIcon } from "../icon/createIcon";

export const WarningIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="WarningIcon">
    <path d="M5 8V4.5h2V8H5Zm2 1.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
    <path d="m6 0 6 12H0L6 0ZM1.618 11 6 2.236 10.382 11H1.618Z" />
  </svg>,
  "Warning",
  "warning"
);
