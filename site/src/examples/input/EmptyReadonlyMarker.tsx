import { FlowLayout, Input } from "@salt-ds/core";
import type { ReactElement } from "react";

export const EmptyReadonlyMarker = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
    <Input readOnly />
    <Input readOnly emptyReadOnlyMarker="*" />
  </FlowLayout>
);
