import { createIcon } from "../icon/createIcon";

export const UnlockedIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="UnlockedIcon">
    <path d="M0 4h12v8H0V4zm1 1v6h10V5H1z" />
    <path d="M8 0a2 2 0 0 1 2 2H9a1 1 0 0 0-1-1H4a1 1 0 0 0-.993.883L3 2v3H2V2C2 .946 2.816.082 3.851.005L4 0h4zm-.5 7.5a1.5 1.5 0 1 1-3.001-.001A1.5 1.5 0 0 1 7.5 7.5z" />
    <path d="M5.5 8h1v2h-1V8z" />
  </svg>,
  "Unlocked",
  "unlocked"
);
