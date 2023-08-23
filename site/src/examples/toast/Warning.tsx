import { ReactElement } from "react";
import { Button, FlowLayout, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const Warning = (): ReactElement => (
  <div style={{ width: 260 }}>
    <Toast status="warning">
      <ToastContent>
        <div>
          <Text>
            <strong>File access</strong>
          </Text>
          <div>Viewers of this file can see comments and suggestions. </div>
        </div>
      </ToastContent>
      <Button variant="secondary">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast status="warning">
      <ToastContent>
        <div>
          <Text>
            <strong>File access</strong>
          </Text>
          <div>Viewers of this file can see comments and suggestions. </div>
        </div>
        <FlowLayout gap={1} style={{ marginTop: "var(--salt-spacing-100)" }}>
          <Button variant="cta" style={{ width: "100%" }}>
            Edit permissions
          </Button>
          <Button style={{ width: "100%" }}>Dismiss</Button>
        </FlowLayout>
      </ToastContent>
    </Toast>
  </div>
);
