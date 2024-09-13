import { Card, StackLayout } from "@salt-ds/core";
import { HeaderBlock } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Padding = (): ReactElement => {
  return (
    <StackLayout style={{ width: "512px" }}>
      <Card style={{ padding: 0 }}>
        <HeaderBlock
          accent={true}
          header="A Header Block"
          preheader="This is a preheader."
          description="This is a description."
          padding="100"
        />
      </Card>
      <Card style={{ padding: 0 }}>
        <HeaderBlock
          accent={true}
          header="A Header Block"
          preheader="This is a preheader."
          description="This is a description."
          padding="200"
        />
      </Card>
      <Card style={{ padding: 0 }}>
        <HeaderBlock
          accent={true}
          header="A Header Block"
          preheader="This is a preheader."
          description="This is a description."
          padding="300"
        />
      </Card>
    </StackLayout>
  );
};
