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

export const NoCloseButton = (args: ToastProps) => (
  <Toast {...args}>
    <ToastContent>LEI Updated</ToastContent>
  </Toast>
);

export const SingleLine = (args: ToastProps) => (
  <FlowLayout style={{ width: 352 }}>
    <Toast {...args}>
      <div>This is a toast message. This is a toast message.</div>
      <ToastClose />
    </Toast>
    <Toast {...args}>
      <div>This is a toast message. This is a toast message.</div>
    </Toast>
  </FlowLayout>
);

export const CustomContent = (args: ToastProps) => (
  <FlowLayout style={{ width: 352 }}>
    <Toast {...args}>
      <ToastContent>
        <div>
          This is a toast message. This is a toast message. This is a toast
          message. This is a toast message.
        </div>
      </ToastContent>
      <ToastClose />
    </Toast>
    <Toast {...args}>
      <ToastContent>
        <div>
          <strong>Toast title</strong>
        </div>
        <div>
          This is a toast message. This is a toast message. This is a toast
          message. This is a toast message.
        </div>
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
  </FlowLayout>
);
