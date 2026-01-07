import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Basic = (): ReactElement => (
  <Rating onValueChange={(value) => console.log(value)}/>
);
