import { ReactElement } from "react";
import { Button, Link, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const Default = (): ReactElement => (
  <Toast>
    <ToastContent>
      <Text>
        Updated to latest version of Salt. See{" "}
        <Link href="https://github.com/jpmorganchase/salt-ds/releases">
          what's new
        </Link>
        .
      </Text>
    </ToastContent>
    <Button variant="secondary" aria-label="Dismiss">
      <CloseIcon aria-hidden />
    </Button>
  </Toast>
);
