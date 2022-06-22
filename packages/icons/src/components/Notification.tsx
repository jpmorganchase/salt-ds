import { createIcon } from "../icon/createIcon";

export const NotificationIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="NotificationIcon">
    <path d="M2 6V3a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v3c.201 1.141.534 1.807 1 2h1v1H0V8h1c.466-.193.799-.859 1-2zm7.608 2c-.273-.467-.461-1.079-.593-1.827L9 6V3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3l-.015.173c-.132.748-.32 1.36-.593 1.827h7.216zM6 12c-.828 0-1.5-.621-1.5-1.389V10h3v.611C7.5 11.379 6.828 12 6 12z" />
  </svg>,
  "Notification",
  "notification"
);
