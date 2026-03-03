import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <Rating aria-label="Rating" disabled defaultValue={3} />
);
