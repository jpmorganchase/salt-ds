import { createIcon } from "../icon/createIcon";

export const UnlockedIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="UnlockedIcon">
    <path d="M7.5 7.5a1.5 1.5 0 0 1-1 1.415V10h-1V8.915a1.5 1.5 0 1 1 2-1.415z" />
    <path d="M3 2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h1a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2H0v8h12V4H3V2zm-2 9V5h10v6H1z" />
  </svg>,
  "Unlocked",
  "unlocked"
);
