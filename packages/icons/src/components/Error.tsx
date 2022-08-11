import { createIcon } from "../icon/createIcon";

export const ErrorIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="ErrorIcon">
    <path d="M3 0 0 3v6l3 3h6l3-3V3L9 0H3zm2 2h2v5H5V2zm2 6.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
  </svg>,
  "Error",
  "error"
);
