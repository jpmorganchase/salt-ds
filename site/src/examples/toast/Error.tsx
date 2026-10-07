import { Button, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Error = (): ReactElement => (
  <Toast status="error" style={{ width: 260 }}>
    <ToastContent>
      <Text fontWeight="bolder">A system error occurred</Text>
      <div>The connection timed out and failed to retrieve data.</div>
    </ToastContent>
    <Button appearance="transparent" aria-label="Dismiss">
      <CloseIcon aria-hidden />
    </Button>
  </Toast>
);
