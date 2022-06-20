import { createIcon } from "../icon/createIcon";

export const ErrorSecondaryIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="ErrorSecondaryIcon">
    <path d="m0 3 3-3h6.005L12 3v6l-3 3H3L0 9V3zm1 .414v5.172L3.414 11h5.172L11 8.586V3.414L8.59 1H3.414L1 3.414z" />
    <path d="M7 7H5V2h2zm0 1.5c0 .269-.093.502-.279.701s-.422.299-.708.299-.526-.095-.721-.285S5 8.787 5 8.5s.097-.525.292-.715.435-.285.721-.285.522.1.708.299S7 8.232 7 8.5z" />
  </svg>,
  "ErrorSecondary",
  "error secondary"
);
