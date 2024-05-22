import { ReactElement } from "react";
import { Button, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const Default = (): ReactElement => (
  <Toast style={{ width: 260 }}>
    <ToastContent>
      <Text>
        A new question has been posted with the [salt-ds] tag in Stack Overflow.
      </Text>
    </ToastContent>
    <Button variant="secondary">
      <CloseIcon />
    </Button>
  </Toast>
);
