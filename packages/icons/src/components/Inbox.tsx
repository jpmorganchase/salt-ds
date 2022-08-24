import { createIcon } from "../icon/createIcon";

export const InboxIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="InboxIcon">
    <path d="M12 3v9H0V3h1v4h3a2 2 0 1 0 4 0h3v1H8.829a3.001 3.001 0 0 1-5.658 0H1v3h10V3h1z" />
    <path d="M7 3V0H5v3H3l3 4 3-4H7z" />
  </svg>,
  "Inbox",
  "inbox"
);
