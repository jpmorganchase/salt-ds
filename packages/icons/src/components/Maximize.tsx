import { createIcon } from "@jpmorganchase/uitk-core";

export const MaximizeIcon = createIcon(
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 12"
    data-testid="MaximizeIcon"
  >
    <path d="M12 12V0H0v12h12zM1 3h10v8H1V3z" />
  </svg>,
  "Maximize",
  "maximize"
);
