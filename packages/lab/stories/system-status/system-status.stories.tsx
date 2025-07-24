import {
  Banner,
  BannerActions,
  BannerContent,
  Button,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/System Status",
  component: SystemStatus,
} as Meta<typeof SystemStatus>;

export const Info: StoryFn<typeof SystemStatus> = (props) => (
  <div style={{ width: 500 }}>
    <SystemStatus {...props}>
      <SystemStatusContent>
        <Text color="inherit">New feature updates are available</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);

export const Success: StoryFn<typeof SystemStatus> = (props) => (
  <div style={{ width: 500 }}>
    <SystemStatus status="success" {...props}>
      <SystemStatusContent>
        <Text color="inherit">Your operation was completed successfully.</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);

export const Error: StoryFn<typeof SystemStatus> = (props) => (
  <div style={{ width: 500 }}>
    <SystemStatus status="error" {...props}>
      <SystemStatusContent>
        <Text color="inherit">System failure. Please try again.</Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);

export const Warning: StoryFn<typeof SystemStatus> = (props) => (
  <div style={{ width: 500 }}>
    <SystemStatus status="warning" {...props}>
      <SystemStatusContent>
        <Text color="inherit">
          The system will be down for scheduled maintenance starting Friday,
          June 21 from 11:00PM EST – 1:00AM EST Saturday, June 22
        </Text>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);

export const WithTitle: StoryFn<typeof SystemStatus> = (props) => (
  <div style={{ width: 500 }}>
    <SystemStatus status="error" {...props}>
      <SystemStatusContent>
        <StackLayout gap={0.5}>
          <Text color="inherit">
            <strong>Connection interrupted</strong>
          </Text>
          <Text color="inherit">Please refresh the page.</Text>
        </StackLayout>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);

export const Placement: StoryFn<typeof SystemStatus> = (props) => {
  return (
    <StackLayout
      style={{
        width: "98vw",
        background: "var( --salt-container-primary-background)",
      }}
    >
      <SystemStatus {...props}>
        <SystemStatusContent>
          <Text color="inherit">New feature updates are available.</Text>
        </SystemStatusContent>
      </SystemStatus>
      <StackLayout
        gap={4.5}
        style={{
          padding:
            "var(--salt-spacing-100) var(--salt-spacing-300) calc(var(--salt-spacing-100)*4.5) ",
        }}
      >
        <Text styleAs="display2"> Payment Activity</Text>
        <Banner status="warning" variant="secondary">
          <BannerContent role="status">
            You have outstanding checks more than 30 days old. Review to prevent
            fraud.
          </BannerContent>
          <BannerActions>
            <Button aria-label="refresh" variant="secondary">
              <CloseIcon />
            </Button>
          </BannerActions>
        </Banner>
      </StackLayout>
    </StackLayout>
  );
};
