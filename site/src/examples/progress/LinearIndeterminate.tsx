import {
  Button,
  LinearProgress,
  Text,
  Toast,
  ToastContent,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const LinearIndeterminate = (): ReactElement => {
  return (
    <Toast status="info">
      <ToastContent>
        <div>
          <Text>
            <strong>File uploading</strong>
          </Text>
          <Text>File upload to shared drive in progress.</Text>
          <LinearProgress aria-label="Download" />
        </div>
      </ToastContent>
      <Button appearance="transparent" aria-label="Dismiss">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
  );
};
