import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const ReadOnly = (): ReactElement => (
  <Rating readOnly defaultValue={3} />
);
