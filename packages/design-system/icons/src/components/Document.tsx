import { createIcon } from "../icon/createIcon";

export const DocumentIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="DocumentIcon">
    <path d="M7 5V1h1v3h3v1H7z" />
    <path d="M9 0v1H2v11H1V0h8zm2 2v2h-1V2h1zm-1-1v1H9V1h1z" />
    <path d="M1 11h10v1H1v-1zm9-6h1v6h-1V5z" />
  </svg>,
  "Document",
  "document"
);
