import { Button, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Warning = (): ReactElement => (
  <Toast status="warning" style={{ width: 260 }}>
    <ToastContent>
      <Text>
        <strong>File access</strong>
      </Text>
      <div>Viewers of this file can see comments and suggestions. </div>
    </ToastContent>
    <Button appearance="transparent" aria-label="Dismiss">
      <CloseIcon aria-hidden />
    </Button>
  </Toast>
);
