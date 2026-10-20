import { OnSolidButton, StackLayout, Text } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  SystemStatus,
  SystemStatusActions,
  SystemStatusContent,
  type SystemStatusProps,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";
import type { FC } from "react";

export default {
  title: "Lab/System Status/System Status QA",
  component: SystemStatus,
} as Meta<typeof SystemStatus>;

const BasicSystemStatusExample: FC<SystemStatusProps> = ({ status }) => {
  return (
    <SystemStatus status={status}>
      <SystemStatusContent>
        <StackLayout gap={0.5}>
          <Text color="inherit" fontWeight="bolder">
            Title
          </Text>
          <Text color="inherit">Example custom renderer</Text>
        </StackLayout>
      </SystemStatusContent>
    </SystemStatus>
  );
};

const InfoSystemStatus = () => <BasicSystemStatusExample status={"info"} />;
const ErrorSystemStatus = () => <BasicSystemStatusExample status={"error"} />;
const WarningSystemStatus = () => (
  <BasicSystemStatusExample status={"warning"} />
);
const SuccessSystemStatus = () => (
  <BasicSystemStatusExample status={"success"} />
);
const WithCloseButtonSystemStatusExample: FC<SystemStatusProps> = ({
  status,
}) => {
  return (
    <SystemStatus status={status}>
      <SystemStatusContent>
        <StackLayout gap={0.5}>
          <Text color="inherit" fontWeight="bolder">
            Title
          </Text>
          <Text color="inherit">Example custom renderer</Text>
        </StackLayout>
      </SystemStatusContent>
      <SystemStatusActions>
        <OnSolidButton aria-label="Dismiss">
          <CloseIcon aria-hidden />
        </OnSolidButton>
      </SystemStatusActions>
    </SystemStatus>
  );
};
const WithActionsSystemStatusExample: FC<SystemStatusProps> = ({ status }) => {
  return (
    <SystemStatus status={status}>
      <SystemStatusContent>
        <Text color="inherit">Example custom renderer</Text>
      </SystemStatusContent>
      <SystemStatusActions>
        <OnSolidButton>Action</OnSolidButton>
        <OnSolidButton aria-label="Dismiss">
          <CloseIcon aria-hidden />
        </OnSolidButton>
      </SystemStatusActions>
    </SystemStatus>
  );
};
export const ExamplesGrid: StoryFn = (props) => (
  <QAContainer cols={1} itemPadding={10} height={600} width={1000} {...props}>
    <InfoSystemStatus />
    <ErrorSystemStatus />
    <WarningSystemStatus />
    <SuccessSystemStatus />
    <WithCloseButtonSystemStatusExample />
    <WithActionsSystemStatusExample status="error" />
  </QAContainer>
);

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
