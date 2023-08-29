import { ReactElement } from "react";
import { Button, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const Info = (): ReactElement => (
  <Toast style={{ width: 260 }}>
    <ToastContent>
      <Text>
        <strong>File update</strong>
      </Text>
      <div>A new version of this file is available with 37 updates. </div>
    </ToastContent>
    <Button variant="secondary">
      <CloseIcon />
    </Button>
  </Toast>
);
