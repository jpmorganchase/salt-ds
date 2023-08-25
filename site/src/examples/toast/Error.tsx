import { ReactElement } from "react";
import { Button, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const Error = (): ReactElement => (
  <Toast status="error" style={{ width: 260 }}>
    <ToastContent>
      <div>
        <Text>
          <strong>System error</strong>
        </Text>
        <div>Connection timed out. Failed to retrieve data. </div>
      </div>
    </ToastContent>
    <Button variant="secondary">
      <CloseIcon />
    </Button>
  </Toast>
);
