import { createIcon } from "../icon/createIcon";

export const DeleteIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="DeleteIcon">
    <path d="M5 4v6H4V4h1zm2 0v6H6V4h1z" />
    <path d="M4 0h3a1 1 0 0 1 1 1v1h3v1h-1v7.25A1.75 1.75 0 0 1 8.25 12H3a2 2 0 0 1-2-2V3H0V2h3V1a1 1 0 0 1 1-1zm5 3H2v7a1 1 0 0 0 1 1h5.25a.75.75 0 0 0 .75-.75V3zM7 2v-.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5V2h3z" />
  </svg>,
  "Delete",
  "delete"
);
