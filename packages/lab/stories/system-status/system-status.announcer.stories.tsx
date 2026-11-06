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
import { type CSSProperties, useState } from "react";

// POC stories for manually testing how a dynamically shown System Status is
// announced by screen readers. Not part of the component's public docs.
export default {
  title: "Lab/System Status/Announcer POC",
  component: SystemStatus,
} as Meta<typeof SystemStatus>;

const structureStyle: CSSProperties = {
  margin: 0,
  padding: "var(--salt-spacing-100)",
  overflow: "auto",
  background: "var(--salt-container-secondary-background)",
  fontFamily: "var(--salt-text-code-fontFamily)",
};

interface DemoProps {
  /** What the story does. */
  description: string;
  /** Sketch of the markup, showing what is on the page from the start. */
  structure: string;
  /** What to pay attention to when testing this story. */
  listenFor?: string;
  message: string;
  status?: ValidationStatus;
  /** `"none"` replaces the built-in `role="status"` of SystemStatus. */
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
  structure,
  listenFor,
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

  const roleProps = role === "status" ? {} : { role };

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
      <StackLayout gap={1}>
        <Text>{description}</Text>
        <pre style={structureStyle}>{structure}</pre>
        {listenFor && <Text>{listenFor}</Text>}
        <Text color="secondary">
          How to test: start a screen reader and activate "Show system status".
          Then hide it, activate "Show in 3 seconds" and move focus elsewhere on
          the page while you wait, as you would when an outage happens without
          you triggering it.
        </Text>
      </StackLayout>
      <FlexLayout gap={1}>
        <Button onClick={() => (open ? setOpen(false) : show())}>
          {open ? "Hide" : "Show"} system status
        </Button>
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
    description='Current behaviour. SystemStatus is added to the page when you show it. It has its built-in role="status", and its text is added at the same time as the element.'
    structure={`<SystemStatus role="status">   ← added when shown
  message
</SystemStatus>`}
    message="New feature updates are available."
  />
);

export const InsertedRoleAlert: StoryFn<typeof SystemStatus> = () => (
  <Demo
    description='SystemStatus is added to the page when you show it. It has role="alert" instead of the default, and its text is added at the same time as the element.'
    structure={`<SystemStatus role="alert">    ← added when shown
  message
</SystemStatus>`}
    message="System failure. Please try again."
    status="error"
    role="alert"
  />
);

export const AnnouncerPolite: StoryFn<typeof SystemStatus> = () => (
  <Demo
    description="SystemStatus is added to the page without a live region role. The same message is sent to useAriaAnnouncer, which writes it into a polite live region that is already on the page (rendered by SaltProvider) and removes it again after 300 ms."
    structure={`<div aria-live="polite">         ← already on the page
  message                         ← added by announce(), removed after 300 ms
</div>

<SystemStatus role="none">        ← added when shown
  message
</SystemStatus>`}
    message="New feature updates are available."
    role="none"
    announceAs="polite"
  />
);

export const AnnouncerAssertive: StoryFn<typeof SystemStatus> = () => (
  <Demo
    description="Same as AnnouncerPolite, but the message is written into the assertive live region instead of the polite one."
    structure={`<div aria-live="assertive">      ← already on the page
  message                         ← added by announce(), removed after 300 ms
</div>

<SystemStatus role="none">        ← added when shown
  message
</SystemStatus>`}
    message="System failure. Please try again."
    status="error"
    role="none"
    announceAs="assertive"
  />
);

export const PreMountedLiveRegion: StoryFn<typeof SystemStatus> = () => (
  <Demo
    description='An empty container with role="status" is on the page from the start. When you show the system status, it is added inside that container. SystemStatus has role="none", so the container is the only live region.'
    structure={`<div role="status">               ← already on the page, empty
  <SystemStatus role="none">      ← added when shown
    message
  </SystemStatus>
</div>`}
    message="New feature updates are available."
    role="none"
    preMountedRegion
  />
);

export const PreMountedLiveRegionWithActions: StoryFn<
  typeof SystemStatus
> = () => (
  <Demo
    description='Same as PreMountedLiveRegion, with "View status" and dismiss buttons inside the system status, so they are inside the live region.'
    structure={`<div role="status">               ← already on the page, empty
  <SystemStatus role="none">      ← added when shown
    message
    <button>View status</button>
    <button aria-label="Dismiss system status" />
  </SystemStatus>
</div>`}
    listenFor="Listen for whether the button labels are read out together with the message."
    message="Some services are running slower than usual. We're working to restore full performance."
    status="warning"
    role="none"
    preMountedRegion
    withActions
  />
);

export const AnnouncerWithActions: StoryFn<typeof SystemStatus> = () => (
  <Demo
    description='Same as AnnouncerPolite, with "View status" and dismiss buttons in the system status. Only the message string is sent to the announcer.'
    structure={`<div aria-live="polite">         ← already on the page
  message                         ← added by announce(), removed after 300 ms
</div>

<SystemStatus role="none">        ← added when shown
  message
  <button>View status</button>
  <button aria-label="Dismiss system status" />
</SystemStatus>`}
    listenFor="Listen for whether the button labels are read out together with the message."
    message="Some services are running slower than usual. We're working to restore full performance."
    status="warning"
    role="none"
    announceAs="polite"
    withActions
  />
);
