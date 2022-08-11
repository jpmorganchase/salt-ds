import { createIcon } from "../icon/createIcon";

export const ErrorSecondaryIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="ErrorSecondaryIcon">
    <path d="M5 2h2v5H5V2zm2 6.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    <path d="M3 0 0 3v6l3 3h6l3-3V3L9 0H3zM1 3.414 3.414 1h5.172L11 3.414v5.172L8.586 11H3.414L1 8.586V3.414z" />
  </svg>,
  "ErrorSecondary",
  "error secondary"
);
