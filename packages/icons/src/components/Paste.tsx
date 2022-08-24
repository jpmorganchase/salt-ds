import { createIcon } from "../icon/createIcon";

export const PasteIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="PasteIcon">
    <path d="M3 1v1H2v9h8V2H9V1h2v11H1V1h2z" />
    <path d="M9 0v3H3V0h6zM8 1H4v1h4V1z" />
  </svg>,
  "Paste",
  "paste"
);
