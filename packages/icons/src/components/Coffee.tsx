import { createIcon } from '../icon/createIcon';

export const CoffeeIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="CoffeeIcon">
    <path d="M1 10h8v1H1v-1Zm9-7H9v2h1a1 1 0 1 0 0-2ZM8 2v4h2a2 2 0 1 0 0-4H8Z" />
    <path d="M8 2H2v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V2Zm1-1v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V1h8Z" />
  </svg>,
  "Coffee",
  "coffee"
);
