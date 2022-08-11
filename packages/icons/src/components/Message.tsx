import { createIcon } from "../icon/createIcon";

export const MessageIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="MessageIcon">
    <path d="M12 1v10H0V1h12zM1 2.504l5 3.864 5-3.864V2H1v.504zm0 1.264V10h10V3.768L6 7.632 1 3.768z" />
  </svg>,
  "Message",
  "message"
);
