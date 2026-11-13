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
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

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
type InvestigationRegion = "status" | "status-not-atomic" | "polite" | "alert";

const investigationRegionProps = {
  status: { role: "status" },
  "status-not-atomic": { role: "status", "aria-atomic": false },
  polite: { "aria-live": "polite" },
  alert: { role: "alert" },
} as const;

const LiveRegionTest = ({
  id,
  description,
  region = "status",
  children,
}: {
  id: string;
  description: string;
  region?: InvestigationRegion;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  // Clears first, then re-inserts, so the same variant can be re-announced
  // without a separate reset step.
  const handleShow = () => {
    window.clearTimeout(timeoutRef.current);
    setOpen(false);
    timeoutRef.current = window.setTimeout(() => setOpen(true), 500);
  };

  const handleClear = () => {
    window.clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  return (
    <StackLayout gap={1} style={{ width: "100%" }}>
      <Text>
        <strong>{id}</strong>: {description}
      </Text>
      <div {...investigationRegionProps[region]}>{open && children}</div>
      <StackLayout direction="row" gap={1}>
        <Button onClick={handleShow}>Show {id}</Button>
        <Button onClick={handleClear}>Clear {id}</Button>
      </StackLayout>
    </StackLayout>
  );
};

const InvestigationMessage = () => <p>Maintenance on Saturday.</p>;

export const AnnouncedInvestigation: StoryFn<typeof SystemStatus> = () => {
  const hiddenLabelId = useId();
  const externalLabelId = useId();

  return (
    <StackLayout gap={4} style={{ width: 640 }}>
      <Text>
        Press Show to insert the content into the live region. Pressing Show
        again clears and re-inserts it after 500ms.
      </Text>

      <LiveRegionTest
        id="A"
        description='role="status". Icon-only button named with aria-label.'
      >
        <InvestigationMessage />
        <button type="button">View status</button>
        <button type="button" aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </button>
      </LiveRegionTest>

      <LiveRegionTest
        id="B"
        description='role="status". Button with visible text "Dismiss" and aria-label.'
      >
        <InvestigationMessage />
        <button type="button">View status</button>
        <button type="button" aria-label="Dismiss system status">
          Dismiss
        </button>
      </LiveRegionTest>

      <LiveRegionTest
        id="C"
        description='role="status". Icon button named with visually hidden text.'
      >
        <InvestigationMessage />
        <button type="button">View status</button>
        <button type="button">
          <CloseIcon aria-hidden />
          <span className="salt-visuallyHidden">Dismiss system status</span>
        </button>
      </LiveRegionTest>

      <LiveRegionTest
        id="D"
        description='role="status". Icon button named with aria-labelledby, pointing to a hidden element.'
      >
        <InvestigationMessage />
        <button type="button">View status</button>
        <span id={hiddenLabelId} hidden>
          Dismiss system status
        </span>
        <button type="button" aria-labelledby={hiddenLabelId}>
          <CloseIcon aria-hidden />
        </button>
      </LiveRegionTest>

      <Text id={externalLabelId}>Dismiss system status</Text>
      <LiveRegionTest
        id="E"
        description='role="status". Icon button named with aria-labelledby, pointing to visible text outside the live region (shown above).'
      >
        <InvestigationMessage />
        <button type="button">View status</button>
        <button type="button" aria-labelledby={externalLabelId}>
          <CloseIcon aria-hidden />
        </button>
      </LiveRegionTest>

      <LiveRegionTest
        id="F"
        description='role="status". Icon button named only with a title attribute.'
      >
        <InvestigationMessage />
        <button type="button">View status</button>
        <button type="button" title="Dismiss system status">
          <CloseIcon aria-hidden />
        </button>
      </LiveRegionTest>

      <LiveRegionTest
        id="G"
        description='role="status". No buttons. Inline span with role="img" and aria-label="Warning".'
      >
        <p>
          Maintenance on Saturday.{" "}
          <span role="img" aria-label="Warning">
            ⚠
          </span>
        </p>
      </LiveRegionTest>

      <LiveRegionTest
        id="H"
        description='role="status". aria-label button between two paragraphs.'
      >
        <InvestigationMessage />
        <button type="button" aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </button>
        <p>Thank you.</p>
      </LiveRegionTest>

      <LiveRegionTest
        id="I"
        region="status-not-atomic"
        description='Same as A, but role="status" with aria-atomic="false".'
      >
        <InvestigationMessage />
        <button type="button">View status</button>
        <button type="button" aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </button>
      </LiveRegionTest>

      <LiveRegionTest
        id="J"
        region="polite"
        description='Same as A, but aria-live="polite" instead of role="status".'
      >
        <InvestigationMessage />
        <button type="button">View status</button>
        <button type="button" aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </button>
      </LiveRegionTest>

      <LiveRegionTest
        id="K"
        region="alert"
        description='Same as A, but role="alert" instead of role="status".'
      >
        <InvestigationMessage />
        <button type="button">View status</button>
        <button type="button" aria-label="Dismiss system status">
          <CloseIcon aria-hidden />
        </button>
      </LiveRegionTest>

      <LiveRegionTest
        id="L"
        description='role="status". Salt SystemStatus as in the docs example: OnSolidButton with CloseIcon and aria-label.'
      >
        <SystemStatus>
          <SystemStatusContent>
            <Text color="inherit">Maintenance on Saturday.</Text>
          </SystemStatusContent>
          <SystemStatusActions>
            <OnSolidButton>View status</OnSolidButton>
            <OnSolidButton aria-label="Dismiss system status">
              <CloseIcon aria-hidden />
            </OnSolidButton>
          </SystemStatusActions>
        </SystemStatus>
      </LiveRegionTest>

      <LiveRegionTest
        id="M"
        description='role="status". Salt SystemStatus with the dismiss button named by visually hidden text.'
      >
        <SystemStatus>
          <SystemStatusContent>
            <Text color="inherit">Maintenance on Saturday.</Text>
          </SystemStatusContent>
          <SystemStatusActions>
            <OnSolidButton>View status</OnSolidButton>
            <OnSolidButton>
              <CloseIcon aria-hidden />
              <span className="salt-visuallyHidden">Dismiss system status</span>
            </OnSolidButton>
          </SystemStatusActions>
        </SystemStatus>
      </LiveRegionTest>

      <StackLayout gap={1}>
        <Text>
          <strong>N</strong>: Static buttons, not in a live region. Tab to each
          one, and inspect AXTitle and AXDescription in Accessibility
          Inspector.
        </Text>
        <StackLayout direction="row" gap={1}>
          <button type="button" aria-label="N1 aria-label">
            <CloseIcon aria-hidden />
          </button>
          <button type="button">
            <CloseIcon aria-hidden />
            <span className="salt-visuallyHidden">N2 visually hidden text</span>
          </button>
          <button type="button" title="N3 title">
            <CloseIcon aria-hidden />
          </button>
          <button type="button" aria-label="N4 aria-label">
            Dismiss
          </button>
        </StackLayout>
      </StackLayout>
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
