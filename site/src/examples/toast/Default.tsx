import { ReactElement } from "react";
import { Button, Link, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const Default = (): ReactElement => (
  <Toast style={{ width: 260 }}>
    <ToastContent>
      <Text>
        Updated to v2.0.0. See <Link href="#">What's new</Link>
      </Text>
    </ToastContent>
    <Button variant="secondary" aria-label="Dismiss">
      <CloseIcon aria-hidden />
    </Button>
  </Toast>
);
