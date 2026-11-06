import {
  Button,
  FlexLayout,
  OnSolidButton,
  StackLayout,
  Text,
  useAriaAnnouncer,
  type ValidationStatus,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  SystemStatus,
  SystemStatusActions,
  SystemStatusContent,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

// POC stories for manually testing how a dynamically shown System Status is
// announced by screen readers. Not part of the component's public docs.
export default {
  title: "Lab/System Status/Announcer POC",
  component: SystemStatus,
} as Meta<typeof SystemStatus>;

interface DemoProps {
  description: string;
  message: string;
  status?: ValidationStatus;
  /** `"none"` removes the built-in `role="status"` from SystemStatus. */
  role?: "status" | "alert" | "none";
  /** Announce `message` through the AriaAnnouncerProvider when shown. */
  announceAs?: "polite" | "assertive";
  /** Keep an empty `role="status"` container mounted and insert into it. */
  preMountedRegion?: boolean;
  /** Render "View status" and dismiss buttons inside the SystemStatus. */
  withActions?: boolean;
}

const Demo = ({
  description,
  message,
  status = "info",
  role = "status",
  announceAs,
  preMountedRegion,
  withActions,
}: DemoProps) => {
  const [open, setOpen] = useState(false);
  const { announce } = useAriaAnnouncer();

  const show = () => {
    setOpen(true);
    if (announceAs) {
      announce(message, { ariaLive: announceAs });
    }
  };

  const roleProps =
    role === "status" ? {} : { role: role === "none" ? undefined : role };

  const systemStatus = open && (
    <SystemStatus status={status} {...roleProps}>
      <SystemStatusContent>
        <Text color="inherit">{message}</Text>
      </SystemStatusContent>
      {withActions && (
        <SystemStatusActions>
          <OnSolidButton>View status</OnSolidButton>
          <OnSolidButton
            aria-label="Dismiss system status"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </OnSolidButton>
        </SystemStatusActions>
      )}
    </SystemStatus>
  );

  return (
    <StackLayout gap={2} style={{ width: 600 }}>
      <Text>{description}</Text>
      <FlexLayout gap={1}>
        <Button onClick={() => (open ? setOpen(false) : show())}>
          {open ? "Hide" : "Show"} system status
        </Button>
        {/* Simulates an event the user did not trigger, e.g. an outage */}
        <Button variant="secondary" onClick={() => setTimeout(show, 3000)}>
          Show in 3 seconds
        </Button>
      </FlexLayout>
      {preMountedRegion ? (
        <div role="status">{systemStatus}</div>
      ) : (
        systemStatus
      )}
    </StackLayout>
  );
};

export const InsertedRoleStatus: StoryFn<typeof SystemStatus> = () => (
  <Demo
    description="Current behaviour: SystemStatus is inserted with its built-in role=status already populated."
    message="New feature updates are available."
  />
);

export const InsertedRoleAlert: StoryFn<typeof SystemStatus> = () => (
  <Demo
    description='SystemStatus is inserted with role="alert" already populated.'
    message="System failure. Please try again."
    status="error"
    role="alert"
  />
);

export const AnnouncerPolite: StoryFn<typeof SystemStatus> = () => (
  <Demo
    description="Built-in role removed. The message is announced politely through useAriaAnnouncer."
    message="New feature updates are available."
    role="none"
    announceAs="polite"
  />
);

export const AnnouncerAssertive: StoryFn<typeof SystemStatus> = () => (
  <Demo
    description="Built-in role removed. The message is announced assertively through useAriaAnnouncer."
    message="System failure. Please try again."
    status="error"
    role="none"
    announceAs="assertive"
  />
);

export const PreMountedLiveRegion: StoryFn<typeof SystemStatus> = () => (
  <Demo
    description='SystemStatus is inserted into an empty role="status" container that is always mounted. Built-in role removed.'
    message="New feature updates are available."
    role="none"
    preMountedRegion
  />
);

export const PreMountedLiveRegionWithActions: StoryFn<
  typeof SystemStatus
> = () => (
  <Demo
    description='Same as PreMountedLiveRegion, with "View status" and dismiss buttons. Listen for whether the button labels are read out with the message.'
    message="Some services are running slower than usual. We're working to restore full performance."
    status="warning"
    role="none"
    preMountedRegion
    withActions
  />
);
