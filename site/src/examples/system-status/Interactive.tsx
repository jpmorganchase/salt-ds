import { OnSolidButton, Text } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  SystemStatus,
  SystemStatusActions,
  SystemStatusContent,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Interactive = (): ReactElement => (
  <SystemStatus status="warning">
    <SystemStatusContent>
      <Text color="inherit">
        Some services are running slower than usual. We're working to restore
        full performance.
      </Text>
    </SystemStatusContent>
    <SystemStatusActions>
      <OnSolidButton>View status</OnSolidButton>
      <OnSolidButton aria-label="Dismiss">
        <CloseIcon aria-hidden />
      </OnSolidButton>
    </SystemStatusActions>
  </SystemStatus>
);
