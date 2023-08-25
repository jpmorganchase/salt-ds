import { ReactElement } from "react";
import { Button, FlowLayout, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const Error = (): ReactElement => (
  <div style={{ width: 260 }}>
    <Toast status="error">
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
    {/* <Toast status="error">
      <ToastContent>
        <div>
          <Text>
            <strong>System error</strong>
          </Text>
          <div>Connection timed out. Failed to retrieve data. </div>
        </div>
        <FlowLayout
          gap={1}
          justify="end"
          style={{ marginTop: "var(--salt-spacing-100)" }}
        >
          <Button>Dismiss</Button>
          <Button variant="cta">Try again</Button>
        </FlowLayout>
      </ToastContent>
    </Toast> */}
  </div>
);
