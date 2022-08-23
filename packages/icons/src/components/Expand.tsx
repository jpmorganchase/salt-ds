import { createIcon } from "../icon/createIcon";

export const ExpandIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="ExpandIcon">
    <path d="M0 0h4v1H1.707l2.889 2.889-.707.707L1 1.707V4H0V0zm12 12H8v-1h2.293L7.404 8.111l.707-.707L11 10.293V8h1v4zm0-12v4h-1V1.707L8.111 4.596l-.707-.707L10.293 1H8V0h4zM0 12V8h1v2.293l2.889-2.889.707.707L1.707 11H4v1H0z" />
  </svg>,
  "Expand",
  "expand"
);
