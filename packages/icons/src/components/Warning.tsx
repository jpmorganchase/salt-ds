import { createIcon } from "../icon/createIcon";

export const WarningIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="WarningIcon">
    <path d="M6 0 0 12h12L6 0zM5 4.5h2V8H5V4.5zm2 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
  </svg>,
  "Warning",
  "warning"
);
