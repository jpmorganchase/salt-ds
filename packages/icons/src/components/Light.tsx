import { createIcon } from "../icon/createIcon";

export const LightIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="LightIcon">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
    />
    <path d="M0 5.5h2v1H0v-1Zm2.11-4.096 1.415 1.414-.707.707-1.414-1.414.707-.707ZM1.404 9.89l1.414-1.415.707.707-1.414 1.414-.707-.707ZM5.5 12v-2h1v2h-1ZM10 5.5h2v1h-2v-1Zm-.818 2.975 1.414 1.414-.707.707-1.414-1.414.707-.707Zm-.707-5.657 1.414-1.414.707.707-1.414 1.414-.707-.707ZM5.5 2V0h1v2h-1Z" />
  </svg>,
  "Light",
  "light"
);
