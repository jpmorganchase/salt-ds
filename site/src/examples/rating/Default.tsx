import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <Rating aria-label="Rating" defaultValue={3} />
);
