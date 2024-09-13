import { Card, StackLayout } from "@salt-ds/core";
import { HeaderBlock } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Status = (): ReactElement => {
  return (
    <StackLayout style={{ width: "512px" }}>
      <Card style={{ padding: 0 }}>
        <HeaderBlock status="info" header="Status: info" onClose={() => {}} />
      </Card>
      <Card style={{ padding: 0 }}>
        <HeaderBlock
          status="success"
          header="Status: success"
          onClose={() => {}}
        />
      </Card>
      <Card style={{ padding: 0 }}>
        <HeaderBlock
          status="warning"
          header="Status: warning"
          onClose={() => {}}
        />
      </Card>
      <Card style={{ padding: 0 }}>
        <HeaderBlock status="error" header="Status: error" onClose={() => {}} />
      </Card>
    </StackLayout>
  );
};
