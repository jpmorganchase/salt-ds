import { ReactElement } from "react";
import { FlowLayout } from "@salt-ds/core";
import { TT_Sharp, FR_Sharp, AU_Sharp, PT_Sharp } from "@salt-ds/countries";

export const SharpVariants = (): ReactElement => (
  <FlowLayout>
    <TT_Sharp />
    <FR_Sharp />
    <AU_Sharp />
    <PT_Sharp />
  </FlowLayout>
);
