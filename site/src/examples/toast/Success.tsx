import { Button, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Success = (): ReactElement => (
  <Toast status="success" style={{ width: 260 }}>
    <ToastContent>
      <Text fontWeight="bolder">File uploaded</Text>
      <div>
        The project file has been successfully uploaded to the shared drive.
      </div>
    </ToastContent>
    <Button appearance="transparent" aria-label="Dismiss">
      <CloseIcon aria-hidden />
    </Button>
  </Toast>
);
