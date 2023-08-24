import { ReactElement } from "react";
import { FlowLayout, Input } from "@salt-ds/core";

export const EmptyReadonlyMarker = (): ReactElement => (
    <FlowLayout style={{width: "256px"}}>
      <Input readOnly />
      <Input readOnly emptyReadOnlyMarker="*" />
    </FlowLayout>
);
