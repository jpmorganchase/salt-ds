import { Meta, StoryFn } from "@storybook/react";
import { Button, StackLayout, Toast, ToastContent } from "@salt-ds/core";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
  QAContainerProps,
} from "docs/components";
import { CloseIcon } from "@salt-ds/icons";

export default {
  title: "Core/Toast/Toast QA",
  component: Toast,
} as Meta<typeof Toast>;

const UI = () => (
  <StackLayout>
    <Toast>
      <ToastContent>This is a toast</ToastContent>
      <Button variant="secondary">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast status="error">
      <ToastContent>This is a toast</ToastContent>
      <Button variant="secondary">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast status="warning">
      <ToastContent>This is a toast</ToastContent>
      <Button variant="secondary">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast status="success">
      <ToastContent>This is a toast</ToastContent>
      <Button variant="secondary">
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
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props
) => (
  <QAContainerNoStyleInjection
    cols={1}
    itemWidthAuto
    height={600}
    width={1000}
    {...props}
  >
    <UI />
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
