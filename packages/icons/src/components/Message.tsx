import { createIcon } from "../icon/createIcon";

export const MessageIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="MessageIcon">
    <path d="M12 1v10H0V1h12zm-1 2.617L6.018 7.473 1 3.628V10h10V3.617zM11 2H1v.368l5.015 3.843L11 2.352V2z" />
  </svg>,
  "Message",
  "message"
);
