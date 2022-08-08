import { createIcon } from "../icon/createIcon";

export const LockedIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="LockedIcon">
    <path d="M4.5 7.5a1.5 1.5 0 1 1 2 1.415V10h-1V8.915a1.5 1.5 0 0 1-1-1.415z" />
    <path d="M0 4h12v8H0V4zm1 1v6h10V5H1z" />
    <path d="M4 1a1 1 0 0 0-1 1v3H2V2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3H9V2a1 1 0 0 0-1-1z" />
  </svg>,
  "Locked",
  "locked"
);
