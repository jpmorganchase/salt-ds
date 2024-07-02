import { Meta, StoryFn } from "@storybook/react";
import {
  SystemStatus,
  SystemStatusContent,
  StackLayout,
  Text,
} from "@salt-ds/core";

export default {
  title: "Core/System Status",
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
        <StackLayout gap={0.75}>
          <Text color="inherit">
            <strong>Connection interrupted</strong>
          </Text>
          <Text color="inherit">Please refresh the page.</Text>
        </StackLayout>
      </SystemStatusContent>
    </SystemStatus>
  </div>
);
