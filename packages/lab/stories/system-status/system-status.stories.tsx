import {
  Banner,
  BannerContent,
  Button,
  H1,
  Link,
  OnSolidButton,
  StackLayout,
  Text,
  type ValidationStatus,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  SystemStatus,
  SystemStatusActions,
  SystemStatusContent,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ReactNode, useId, useRef, useState } from "react";

export default {
  title: "Lab/System Status",
  component: SystemStatus,
} as Meta<typeof SystemStatus>;

const messages: { status: ValidationStatus; message: string }[] = [
  { status: "info", message: "New feature updates are available" },
  { status: "success", message: "Your operation was completed successfully." },
  {
    status: "warning",
    message:
      "The system will be down for scheduled maintenance starting Friday, June 21 from 11:00PM EST – 1:00AM EST Saturday, June 22",
  },
  {
    status: "error",
    message: "Some services are unavailable. Refresh the page to try again.",
  },
];

const titledMessages: {
  status: ValidationStatus;
  title: string;
  description: string;
}[] = [
  {
    status: "info",
    title: "New features available",
    description: "Refresh the page to start using them.",
  },
  {
    status: "success",
    title: "Maintenance complete",
    description: "All services are running normally.",
  },
  {
    status: "warning",
    title: "Scheduled maintenance",
    description:
      "The system will be down from 11:00PM EST Friday, June 21 to 1:00AM EST Saturday, June 22.",
  },
  {
    status: "error",
    title: "Connection interrupted",
    description: "Please refresh the page.",
  },
];

export const Default: StoryFn<typeof SystemStatus> = (args) => (
  <div style={{ width: 600 }}>
    <SystemStatus {...args}>
      <SystemStatusContent>
        <Text color="inherit">New feature updates are available</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);

export const Statuses: StoryFn<typeof SystemStatus> = () => (
  <StackLayout gap={1} style={{ width: 600 }}>
    {messages.map(({ status, message }) => (
      <SystemStatus key={status} status={status}>
        <SystemStatusContent>
          <Text color="inherit">{message}</Text>
        </SystemStatusContent>
      </SystemStatus>
    ))}
  </StackLayout>
);

export const WithTitle: StoryFn<typeof SystemStatus> = () => (
  <StackLayout gap={1} style={{ width: 600 }}>
    {titledMessages.map(({ status, title, description }) => (
      <SystemStatus key={status} status={status}>
        <SystemStatusContent>
          <StackLayout gap={0.5}>
            <Text color="inherit" fontWeight="bolder">
              {title}
            </Text>
            <Text color="inherit">{description}</Text>
          </StackLayout>
        </SystemStatusContent>
      </SystemStatus>
    ))}
  </StackLayout>
);

export const CustomContent: StoryFn<typeof SystemStatus> = (args) => (
  <div style={{ width: 600 }}>
    <SystemStatus status="warning" {...args}>
      <SystemStatusContent>
        <Text color="inherit">
          Some services are running slower than usual.{" "}
          <Link href="#" color="inherit">
            View service status
          </Link>
        </Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);

export const WithActions: StoryFn<typeof SystemStatus> = () => (
  <StackLayout gap={1} style={{ width: 600 }}>
    <SystemStatus>
      <SystemStatusContent>
        <Text color="inherit">New feature updates are available</Text>
      </SystemStatusContent>
      <SystemStatusActions>
        <OnSolidButton aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </OnSolidButton>
      </SystemStatusActions>
    </SystemStatus>
    <SystemStatus status="error">
      <SystemStatusContent>
        <Text color="inherit">
          Some services are unavailable. Refresh the page to try again.
        </Text>
      </SystemStatusContent>
      <SystemStatusActions>
        <OnSolidButton>Try again</OnSolidButton>
        <OnSolidButton aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </OnSolidButton>
      </SystemStatusActions>
    </SystemStatus>
  </StackLayout>
);

export const Announced: StoryFn<typeof SystemStatus> = () => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleDismiss = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <StackLayout gap={3} align="center" style={{ width: 600 }}>
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
              <OnSolidButton onClick={handleDismiss}>
                <CloseIcon aria-hidden />
                <span className="salt-visuallyHidden">
                  Dismiss system status
                </span>
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

// TEMPORARY: screen reader investigation, remove before merging.
const LiveRegionTest = ({
  name,
  atomic,
  children,
}: {
  name: string;
  atomic?: boolean;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <StackLayout gap={1} style={{ width: "100%" }}>
      <Text styleAs="h3">{name}</Text>
      <div role="status" aria-atomic={atomic}>
        {open && children}
      </div>
      <StackLayout direction="row" gap={1}>
        <Button onClick={() => setOpen(true)}>Show {name}</Button>
        <Button onClick={() => setOpen(false)}>Reset {name}</Button>
      </StackLayout>
    </StackLayout>
  );
};

export const AnnouncedInvestigation: StoryFn<typeof SystemStatus> = () => {
  const labelId = useId();
  return (
    <StackLayout gap={3} style={{ width: 600 }}>
      <LiveRegionTest name="A">
        <p>Maintenance on Saturday.</p>
        <button type="button">View status</button>
        <button type="button" aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </button>
      </LiveRegionTest>
      <LiveRegionTest name="B">
        <p>Maintenance on Saturday.</p>
        <button type="button">View status</button>
        <button type="button" aria-label="Dismiss system status">
          Dismiss
        </button>
      </LiveRegionTest>
      <LiveRegionTest name="C">
        <p>Maintenance on Saturday.</p>
        <button type="button">View status</button>
        <button type="button">
          <CloseIcon aria-hidden />
          <span className="salt-visuallyHidden">Dismiss system status</span>
        </button>
      </LiveRegionTest>
      <LiveRegionTest name="D">
        <p>Maintenance on Saturday.</p>
        <button type="button">View status</button>
        <span id={labelId} hidden>
          Dismiss system status
        </span>
        <button type="button" aria-labelledby={labelId}>
          <CloseIcon aria-hidden />
        </button>
      </LiveRegionTest>
      <LiveRegionTest name="E">
        <p>
          Maintenance on Saturday.{" "}
          <span role="img" aria-label="Warning">
            ⚠
          </span>
        </p>
      </LiveRegionTest>
      <LiveRegionTest name="F" atomic={false}>
        <p>Maintenance on Saturday.</p>
        <button type="button">View status</button>
        <button type="button" aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </button>
      </LiveRegionTest>
      <LiveRegionTest name="G">
        <p>Maintenance on Saturday.</p>
        <button type="button" aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </button>
        <p>Thank you.</p>
      </LiveRegionTest>
    </StackLayout>
  );
};

export const LongContent: StoryFn<typeof SystemStatus> = (args) => (
  <div style={{ width: 600 }}>
    <SystemStatus status="warning" {...args}>
      <SystemStatusContent>
        <StackLayout gap={0.5}>
          <Text color="inherit" fontWeight="bolder">
            Scheduled maintenance
          </Text>
          <Text color="inherit">
            The system will be down for scheduled maintenance starting Friday,
            June 21 from 11:00PM EST – 1:00AM EST Saturday, June 22. During this
            time you won't be able to sign in, view your accounts or make
            payments. Any payments scheduled during the maintenance window will
            be processed once the system is back online.
          </Text>
        </StackLayout>
      </SystemStatusContent>
      <SystemStatusActions>
        <OnSolidButton>View details</OnSolidButton>
        <OnSolidButton aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </OnSolidButton>
      </SystemStatusActions>
    </SystemStatus>
  </div>
);

export const Placement: StoryFn<typeof SystemStatus> = (args) => (
  <StackLayout gap={0}>
    <SystemStatus {...args}>
      <SystemStatusContent>
        <Text color="inherit">New feature updates are available.</Text>
      </SystemStatusContent>
      <SystemStatusActions>
        <OnSolidButton aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </OnSolidButton>
      </SystemStatusActions>
    </SystemStatus>
    <StackLayout
      style={{
        padding: "var(--salt-spacing-300) var(--salt-layout-page-margin)",
      }}
    >
      <H1 styleAs="display2">Payment activity</H1>
      <Banner status="warning" variant="secondary">
        <BannerContent>
          You have outstanding checks more than 30 days old. Review to prevent
          fraud.
        </BannerContent>
      </Banner>
    </StackLayout>
  </StackLayout>
);

Placement.parameters = {
  layout: "fullscreen",
};
