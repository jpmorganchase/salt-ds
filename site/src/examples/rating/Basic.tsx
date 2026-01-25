import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Basic = (): ReactElement => (
  <Rating onChange={(event, value) => console.log(value)} />
);
