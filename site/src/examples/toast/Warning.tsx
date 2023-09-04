import { ReactElement } from "react";
import { Button, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const Warning = (): ReactElement => (
  <Toast status="warning" style={{ width: 260 }}>
    <ToastContent>
      <Text>
        <strong>File access</strong>
      </Text>
      <div>Viewers of this file can see comments and suggestions. </div>
    </ToastContent>
    <Button variant="secondary">
      <CloseIcon />
    </Button>
  </Toast>
);
