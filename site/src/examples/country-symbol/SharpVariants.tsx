import { FlowLayout } from "@salt-ds/core";
import { AU_Sharp, FR_Sharp, PT_Sharp, TT_Sharp } from "@salt-ds/countries";
import type { ReactElement } from "react";

export const SharpVariants = (): ReactElement => (
  <FlowLayout>
    <TT_Sharp />
    <FR_Sharp />
    <AU_Sharp />
    <PT_Sharp />
  </FlowLayout>
);
