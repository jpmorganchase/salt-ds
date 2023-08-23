import { ReactElement } from "react";
import { Button, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const Success = (): ReactElement => (
  <Toast status="success" style={{ width: 260 }}>
    <ToastContent>
      <Text>
        <strong>Project file upload</strong>
      </Text>
      <div>Project file has successfully uploaded to the shared drive. </div>
    </ToastContent>
    <Button variant="secondary">
      <CloseIcon />
    </Button>
  </Toast>
);
