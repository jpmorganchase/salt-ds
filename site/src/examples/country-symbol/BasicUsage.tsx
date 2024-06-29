import { FlowLayout } from "@salt-ds/core";
import { AU, FR, PT, TT } from "@salt-ds/countries";
import type { ReactElement } from "react";

export const BasicUsage = (): ReactElement => (
  <FlowLayout>
    <TT />
    <FR />
    <AU />
    <PT />
  </FlowLayout>
);
