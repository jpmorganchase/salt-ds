import { OnSolidButton, Text } from "@salt-ds/core";
import {
  SystemStatus,
  SystemStatusActions,
  SystemStatusContent,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Error = (): ReactElement => (
  <SystemStatus status="error" role="alert">
    <SystemStatusContent>
      <Text color="inherit">System failure. Please try again.</Text>
    </SystemStatusContent>
    <SystemStatusActions>
      <OnSolidButton>Try again</OnSolidButton>
    </SystemStatusActions>
  </SystemStatus>
);
