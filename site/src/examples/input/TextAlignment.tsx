import { ReactElement } from "react";
import { FlowLayout, Input } from "@salt-ds/core";

export const TextAlignment = (): ReactElement => (
    <FlowLayout style={{ maxWidth: "256px" }}>
      <Input defaultValue="Value" />
      <Input
        textAlign="center"
        defaultValue="Value"
      />
      <Input
        textAlign="right"
        defaultValue="Value"
      />
    </FlowLayout>
);
