import { DateInputSingle } from "@salt-ds/date-components";
import type { ReactElement } from "react";

export const EmptyReadOnlyMarker = (): ReactElement => (
  <div style={{ width: "250px" }}>
    <DateInputSingle emptyReadOnlyMarker="-" readOnly />
  </div>
);
