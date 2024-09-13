import { Card, StackLayout } from "@salt-ds/core";
import { HeaderBlock } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Accent = (): ReactElement => {
  return (
    <StackLayout style={{ width: "512px" }}>
      <Card style={{ padding: 0 }}>
        <HeaderBlock
          accent={true}
          header="A Header Block with an accent bar."
          preheader="This is a preheader."
          description="This is a description."
        />
      </Card>
      <Card style={{ padding: 0 }}>
        <HeaderBlock
          accent={false}
          header="A Header Block without an accent bar."
          preheader="This is a preheader."
          description="This is a description."
        />
      </Card>
    </StackLayout>
  );
};
