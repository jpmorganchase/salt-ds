import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Button, FlowLayout, Text } from "@salt-ds/core";
import { Toast, ToastContent, ToastProps } from "@salt-ds/lab";
import { CloseIcon } from "@salt-ds/icons";

export default {
  title: "Lab/Toast",
  component: Toast,
} as ComponentMeta<typeof Toast>;

const Template: ComponentStory<typeof Toast> = ({ children, ...args }) => (
  <Toast {...args}>
    <ToastContent>{children}</ToastContent>
    <Button variant="secondary">
      <CloseIcon />
    </Button>
  </Toast>
);

export const DefaultInfo = Template.bind({});
DefaultInfo.args = {
  status: "info",
  children: (
    <div>
      <Text>
        <strong>File update</strong>
      </Text>
      <div>A new version of this file is available with 37 updates. </div>
    </div>
  ),
};

export const Warning = Template.bind({});
Warning.args = {
  status: "warning",
  children: (
    <div>
      <Text>
        <strong>File access</strong>
      </Text>
      <div>Viewers of this file can see comments and suggestions. </div>
    </div>
  ),
};

export const Error = Template.bind({});
Error.args = {
  status: "error",
  children: (
    <div>
      <Text>
        <strong>System error</strong>
      </Text>
      <div>Connection timed out. Failed to retrieve data. </div>
    </div>
  ),
};

export const Success = Template.bind({});
Success.args = {
  status: "success",
  children: (
    <div>
      <Text>
        <strong>Project file upload</strong>
      </Text>
      <div>Project file has successfully uploaded to the shared drive. </div>
    </div>
  ),
};

export const NoCloseButton = (args: ToastProps) => (
  <Toast {...args}>
    <ToastContent>LEI Updated</ToastContent>
  </Toast>
);

export const SingleLine = (args: ToastProps) => (
  <FlowLayout style={{ width: 352 }}>
    <Toast {...args}>
      <ToastContent>
        <div>This is a toast message. This is a toast message.</div>
      </ToastContent>
      <Button variant="secondary">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast {...args}>
      <ToastContent>
        <div>This is a toast message. This is a toast message.</div>
      </ToastContent>
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
      <Button variant="secondary">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast {...args}>
      <ToastContent>
        <Text>
          <strong>Toast title</strong>
        </Text>
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
