import { createIcon } from "../icon/createIcon";

export const ThumbsDownIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="ThumbsDownIcon">
    <path d="M12 7h-2V0h2v7zm-5.5 5c-.847 0-1.428-.62-1.494-1.36L5 10.5V8H1c-.557 0-.942-.345-.994-.875L0 7l.007-.425A12.5 12.5 0 0 1 1.02 2.056l.175-.387.504-1.068c.178-.356.435-.553.77-.593l.13-.007h5.4c.557 0 .942.345.994.875l.006.125v6l-1 2v2c0 .557-.345.942-.875.994l-.125.006h-.5zM6 7v3.5c0 .261.156.453.403.493L6.5 11H7V8.764l1-1.999V1l-5.386.001-.009.026-.504 1.068a11.48 11.48 0 0 0-1.07 4.076l-.022.421L1.002 7h5z" />
  </svg>,
  "ThumbsDown",
  "thumbs down"
);
