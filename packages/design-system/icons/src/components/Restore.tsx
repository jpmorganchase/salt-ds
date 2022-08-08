import { createIcon } from "../icon/createIcon";

export const RestoreIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="RestoreIcon">
    <path d="M12 12V0H0v6h.996V3.008h10.008v7.996H6V12z" />
    <path d="m3.996 12-1.395-1.395 3-3-1.207-1.207-3 3-1.395-1.395v3.996z" />
  </svg>,
  "Restore",
  "restore"
);
