import { createIcon } from "../icon/createIcon";

export const CreditCardIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="CreditCardIcon">
    <path d="M5 7H2v1h3V7zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0z" />
    <path d="M0 9V3a1 1 0 0 1 1-1h10c.552 0 1 .446 1 .998v6.003A1 1 0 0 1 11 10H1a1 1 0 0 1-1-1zm1-5h10v-.502A.498.498 0 0 0 10.5 3h-9a.5.5 0 0 0-.5.5V4zm0 1v3.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.499V5H1z" />
  </svg>,
  "CreditCard",
  "credit card"
);
