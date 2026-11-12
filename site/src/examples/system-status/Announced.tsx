import { Button, OnSolidButton, StackLayout, Text } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  SystemStatus,
  SystemStatusActions,
  SystemStatusContent,
} from "@salt-ds/lab";
import { type ReactElement, useRef, useState } from "react";

export const Announced = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleDismiss = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <StackLayout gap={3} align="center" style={{ width: "100%" }}>
      {/* Always mounted so screen readers announce content added to it. */}
      <div role="status" style={{ width: "100%" }}>
        {open && (
          <SystemStatus>
            <SystemStatusContent>
              <Text color="inherit">
                Scheduled maintenance is planned for Saturday from 08:00 to
                10:00 UTC. Some services may be unavailable.
              </Text>
            </SystemStatusContent>
            <SystemStatusActions>
              <OnSolidButton>View status</OnSolidButton>
              <OnSolidButton
                aria-label="Dismiss system status"
                onClick={handleDismiss}
              >
                <CloseIcon aria-hidden />
              </OnSolidButton>
            </SystemStatusActions>
          </SystemStatus>
        )}
      </div>
      <Button ref={triggerRef} onClick={() => setOpen(true)}>
        Show system status
      </Button>
    </StackLayout>
  );
};
