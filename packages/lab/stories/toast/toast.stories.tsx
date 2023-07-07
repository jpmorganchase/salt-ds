import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Button, FlowLayout } from "@salt-ds/core";
import { Toast, ToastClose, ToastContent, ToastProps } from "@salt-ds/lab";

export default {
  title: "Lab/Toast",
  component: Toast,
} as ComponentMeta<typeof Toast>;

const Template: ComponentStory<typeof Toast> = ({ children, ...args }) => (
  <Toast {...args}>
    <ToastContent>{children}</ToastContent>
    <ToastClose />
  </Toast>
);

export const DefaultInfo = Template.bind({});
DefaultInfo.args = {
  status: "info",
  children: <div>LEI Updated</div>,
};

export const Warning = Template.bind({});
Warning.args = {
  status: "warning",
  children: <div>Pre-Trade Transparency</div>,
};

export const Error = Template.bind({});
Error.args = {
  status: "error",
  children: <div>CIT Check Failed System Error - Bypass Check</div>,
};

export const Success = Template.bind({});
Success.args = {
  status: "success",
  children: <div>Clear Transact</div>,
};

export const HideClose = (args: ToastProps) => (
  <Toast {...args}>
    <ToastContent>LEI Updated</ToastContent>
  </Toast>
);

export const CustomContent = (args: ToastProps) => (
  <Toast {...args}>
    <ToastContent>
      <div>
        <strong>Lorem ipsum</strong>
      </div>
      <div>Lorem ipsum dolor sit amet consectetur adipiscing elit.</div>
      <FlowLayout
        gap={1}
        justify="end"
        style={{ marginTop: "var(--salt-spacing-100)" }}
      >
        <Button>Dismiss</Button>
        <Button variant="cta">Yes</Button>
      </FlowLayout>
    </ToastContent>
  </Toast>
);
