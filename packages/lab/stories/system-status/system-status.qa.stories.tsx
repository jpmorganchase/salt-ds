import {
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
import { QAContainer } from "docs/components";

export default {
  title: "Lab/System Status/System Status QA",
  component: SystemStatus,
} as Meta<typeof SystemStatus>;

const statuses: ValidationStatus[] = ["info", "success", "warning", "error"];

const actions = (
  <SystemStatusActions>
    <OnSolidButton>Action</OnSolidButton>
    <OnSolidButton aria-label="Dismiss">
      <CloseIcon aria-hidden />
    </OnSolidButton>
  </SystemStatusActions>
);

export const ExamplesGrid: StoryFn = (props) => (
  <QAContainer cols={1} itemPadding={10} height={600} width={1000} {...props}>
    {statuses.map((status) => (
      <SystemStatus key={status} status={status}>
        <SystemStatusContent>
          <Text color="inherit">Message</Text>
        </SystemStatusContent>
      </SystemStatus>
    ))}
    {statuses.map((status) => (
      <SystemStatus key={status} status={status}>
        <SystemStatusContent>
          <StackLayout gap={0.5}>
            <Text color="inherit" fontWeight="bolder">
              Title
            </Text>
            <Text color="inherit">Description</Text>
          </StackLayout>
        </SystemStatusContent>
      </SystemStatus>
    ))}
    <SystemStatus>
      <SystemStatusContent>
        <Text color="inherit">Message</Text>
      </SystemStatusContent>
      {actions}
    </SystemStatus>
    <SystemStatus status="warning">
      <SystemStatusContent>
        <StackLayout gap={0.5}>
          <Text color="inherit" fontWeight="bolder">
            Title
          </Text>
          <Text color="inherit">
            Description that is long enough to wrap onto several lines, so the
            icon and actions can be checked against the first line of content.
          </Text>
        </StackLayout>
      </SystemStatusContent>
      {actions}
    </SystemStatus>
  </QAContainer>
);

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
