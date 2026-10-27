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
import { useState } from "react";

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
  { status: "error", message: "System failure. Please try again." },
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
        <OnSolidButton aria-label="Dismiss">
          <CloseIcon aria-hidden />
        </OnSolidButton>
      </SystemStatusActions>
    </SystemStatus>
    <SystemStatus status="error">
      <SystemStatusContent>
        <Text color="inherit">System failure. Please try again.</Text>
      </SystemStatusContent>
      <SystemStatusActions>
        <OnSolidButton>Try again</OnSolidButton>
        <OnSolidButton aria-label="Dismiss">
          <CloseIcon aria-hidden />
        </OnSolidButton>
      </SystemStatusActions>
    </SystemStatus>
  </StackLayout>
);

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
        <OnSolidButton aria-label="Dismiss">
          <CloseIcon aria-hidden />
        </OnSolidButton>
      </SystemStatusActions>
    </SystemStatus>
  </div>
);

export const Placement: StoryFn<typeof SystemStatus> = (args) => {
  const [open, setOpen] = useState(true);

  return (
    <StackLayout gap={0}>
      {open && (
        <SystemStatus {...args}>
          <SystemStatusContent>
            <Text color="inherit">New feature updates are available.</Text>
          </SystemStatusContent>
          <SystemStatusActions>
            <OnSolidButton aria-label="Dismiss" onClick={() => setOpen(false)}>
              <CloseIcon aria-hidden />
            </OnSolidButton>
          </SystemStatusActions>
        </SystemStatus>
      )}
      <StackLayout
        align="start"
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
        {!open && (
          <Button onClick={() => setOpen(true)}>Show system status</Button>
        )}
      </StackLayout>
    </StackLayout>
  );
};

Placement.parameters = {
  layout: "fullscreen",
};
