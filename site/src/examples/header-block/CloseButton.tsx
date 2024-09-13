import { Card, StackLayout } from "@salt-ds/core";
import { HeaderBlock } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const CloseButton = (): ReactElement => {
  return (
    <StackLayout style={{ width: "512px" }}>
      <Card style={{ padding: 0 }}>
        <HeaderBlock header="Header Block" onClose={() => {}} accent={true} />
      </Card>
      <Card style={{ padding: 0 }}>
        <HeaderBlock
          accent={true}
          header="A Header Block with a preheader and a description."
          preheader="This is a preheader."
          description="This is a description."
          onClose={() => {}}
        />
      </Card>
      <Card style={{ padding: 0 }}>
        <HeaderBlock
          status="success"
          header="Status: success"
          onClose={() => {}}
        />
      </Card>
    </StackLayout>
  );
};
