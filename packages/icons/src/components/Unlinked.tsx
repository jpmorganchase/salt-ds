import { createIcon } from "@jpmorganchase/uitk-core";

export const UnlinkedIcon = createIcon(
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 12"
    data-testid="UnlinkedIcon"
  >
    <path d="m3.924 3.902.844.766c-.085.06-.166.128-.243.204L1.73 7.667a1.847 1.847 0 0 0 2.612 2.612l1.492-1.494.751.78-1.541 1.543A2.955 2.955 0 1 1 .865 6.929l2.786-2.786c.087-.087.178-.167.273-.241zm4.097 4.202-.863-.954.108.12c.068-.051.133-.107.194-.169l2.795-2.795a1.847 1.847 0 0 0-2.612-2.612L6.151 3.187l-.751-.78L6.941.865a2.955 2.955 0 1 1 4.179 4.179L8.334 7.83a3.024 3.024 0 0 1-.29.255zM0 4h2.5V3H0zm3-1.5h1V0H3zM12 8H9.5v1H12zM9 9.5H8V12h1z" />
  </svg>,
  "Unlinked",
  "unlinked"
);
