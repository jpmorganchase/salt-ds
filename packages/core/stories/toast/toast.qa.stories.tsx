import { Button, StackLayout, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon, GlobeIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Toast/Toast QA",
  component: Toast,
} as Meta<typeof Toast>;

const UI = () => (
  <StackLayout>
    <Toast>
      <ToastContent>This is a toast</ToastContent>
      <Button appearance="transparent">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast status="info">
      <ToastContent>This is a toast</ToastContent>
      <Button appearance="transparent">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast status="error">
      <ToastContent>This is a toast</ToastContent>
      <Button appearance="transparent">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast status="warning">
      <ToastContent>This is a toast</ToastContent>
      <Button appearance="transparent">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast status="success">
      <ToastContent>This is a toast</ToastContent>
      <Button appearance="transparent">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast icon={<GlobeIcon aria-label="info" />} status={"info"}>
      <ToastContent>Custom icon toast</ToastContent>
      <Button appearance="transparent">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast icon={<GlobeIcon aria-label="error" />} status="error">
      <ToastContent>Custom icon toast</ToastContent>
      <Button appearance="transparent">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast icon={<GlobeIcon aria-label="warning" />} status="warning">
      <ToastContent>Custom icon toast</ToastContent>
      <Button appearance="transparent">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast icon={<GlobeIcon aria-label="success" />} status="success">
      <ToastContent>Custom icon toast</ToastContent>
      <Button appearance="transparent">
        <CloseIcon />
      </Button>
    </Toast>
  </StackLayout>
);

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={1} itemWidthAuto height={600} width={1000} {...props}>
    <UI />
  </QAContainer>
);

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
