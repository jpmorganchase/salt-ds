import { createIcon } from "../icon/createIcon";

export const BankCheckIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="BankCheckIcon">
    <path d="M12 2v8H0V2h12zm-1 2H1v5h10V4z" />
    <path d="M2 7h7v1H2V7zm0-2h4v1H2V5zm6 0h2v1H8V5z" />
  </svg>,
  "BankCheck",
  "bank check"
);
