import { createIcon } from "../icon/createIcon";

export const AddDocumentIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="AddDocumentIcon">
    <path d="M10 4V2h1v9h-1V5H7V1H1V0h8v1H8v3h2zm0-3v1H9V1h1z" />
    <path d="M2 1v10h9v1H1V1h1z" />
    <path d="M6 5v2h2v1H5.999L6 10H5l-.001-2.001L3 8V7l2-.001V5h1z" />
  </svg>,
  "AddDocument",
  "add document"
);
