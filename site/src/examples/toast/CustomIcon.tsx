import { Button, Text, Toast, ToastContent } from "@salt-ds/core";
import {
  CloseIcon,
  ErrorIcon,
  InfoIcon,
  StepSuccessIcon,
  WarningIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const CustomIcon = (): ReactElement => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <Toast
      style={{ width: 260 }}
      icon={<InfoIcon aria-label="info" />}
      status={"info"}
    >
      <ToastContent>
        <Text fontWeight="bolder">Info with Custom Icon</Text>
        <div>Filters have been cleared</div>
      </ToastContent>
      <Button aria-label="Dismiss" appearance="transparent">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
    <Toast
      style={{ width: 260 }}
      icon={<StepSuccessIcon aria-label="success" />}
      status={"success"}
    >
      <ToastContent>
        <Text fontWeight="bolder">Success with Custom Icon</Text>
        <div>The world is connected</div>
      </ToastContent>
      <Button aria-label="Dismiss" appearance="transparent">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
    <Toast
      style={{ width: 260 }}
      icon={<WarningIcon aria-label="warning" />}
      status={"warning"}
    >
      <ToastContent>
        <Text fontWeight="bolder">Warning with Custom Icon</Text>
        <div>There is not enough seasoning</div>
      </ToastContent>
      <Button aria-label="Dismiss" appearance="transparent">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
    <Toast
      style={{ width: 260 }}
      icon={<ErrorIcon aria-label="error" />}
      status={"error"}
    >
      <ToastContent>
        <Text fontWeight="bolder">Error with Custom Icon</Text>
        <div>There is a wild animal here</div>
      </ToastContent>
      <Button aria-label="Dismiss" appearance="transparent">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
  </div>
);
