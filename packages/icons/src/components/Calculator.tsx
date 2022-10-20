import { createIcon } from "../icon/createIcon";

export const CalculatorIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="CalculatorIcon">
    <path d="M11 1H1v10h10V1ZM0 0v12h12V0H0Z" />
    <path d="M8 2h1v4H8V2Z" />
    <path d="M9 2H8v1.5H6.5v1H8V6h1V4.5h1.5v-1H9V2ZM2.207 6.5l-.707.707 1.06 1.06L1.5 9.329l.707.708 1.06-1.061 1.061 1.06.708-.707-1.061-1.06 1.06-1.06-.707-.708-1.06 1.06-1.06-1.06Zm-.707-3h4v1h-4v-1Zm5 5.5h4v1h-4V9Zm0-2h4v1h-4V7Z" />
  </svg>,
  "Calculator",
  "calculator"
);
