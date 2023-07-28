import { ComponentMeta, Story } from "@storybook/react";
import { Button, StackLayout, Toast, ToastContent } from "@salt-ds/core";
import { QAContainer, QAContainerProps } from "docs/components";
import { CloseIcon } from "@salt-ds/icons";

export default {
  title: "Core/Toast/QA",
  component: Toast,
} as ComponentMeta<typeof Toast>;

export const ExamplesGrid: Story<QAContainerProps> = (props) => (
  <QAContainer cols={1} itemWidthAuto height={600} width={1000} {...props}>
    <StackLayout>
      <Toast>
        <ToastContent>This is a toast</ToastContent>
        <Button variant="secondary"><CloseIcon /></Button>
      </Toast>
      <Toast status="error">
        <ToastContent>This is a toast</ToastContent>
        <Button variant="secondary"><CloseIcon /></Button>
      </Toast>
      <Toast status="warning">
        <ToastContent>This is a toast</ToastContent>
        <Button variant="secondary"><CloseIcon /></Button>
      </Toast>
      <Toast status="success">
        <ToastContent>This is a toast</ToastContent>
        <Button variant="secondary"><CloseIcon /></Button>
      </Toast>
    </StackLayout>
  </QAContainer>
);

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
