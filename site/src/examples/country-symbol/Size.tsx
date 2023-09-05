import { ReactElement } from "react";
import { FlowLayout } from "@salt-ds/core";
import { MX } from "@salt-ds/countries";

export const Size = (): ReactElement => (
  <FlowLayout>
    <MX size={1} />
    <MX size={2} />
    <MX size={3} />
    <MX size={4} />
  </FlowLayout>
);
