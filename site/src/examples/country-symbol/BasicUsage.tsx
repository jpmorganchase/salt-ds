import { ReactElement } from "react";
import { FlowLayout } from "@salt-ds/core";
import { TT, FR, AU, PT } from "@salt-ds/countries";

export const BasicUsage = (): ReactElement => (
  <FlowLayout>
    <TT />
    <FR />
    <FR />
    <PT />
  </FlowLayout>
);
