import {
  Button,
  FlowLayout,
  Link,
  StackLayout,
  Text,
  Toast,
  ToastContent,
  type ToastProps,
} from "@salt-ds/core";
import { CloseIcon, GlobeIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Core/Toast",
  component: Toast,
} as Meta<typeof Toast>;

const Template: StoryFn<typeof Toast> = ({ children, ...args }) => (
  <Toast {...args} style={{ width: 260 }}>
    <ToastContent>{children}</ToastContent>
    <Button appearance="transparent" aria-label="Dismiss">
      <CloseIcon aria-hidden />
    </Button>
  </Toast>
);

export const Default: StoryFn<typeof Toast> = (args) => (
  <Toast {...args}>
    <ToastContent>
      <Text>
        Updated to latest version of Salt. See{" "}
        <Link href="https://github.com/jpmorganchase/salt-ds/releases">
          what's new
        </Link>
        .
      </Text>
    </ToastContent>
    <Button appearance="transparent" aria-label="Dismiss">
      <CloseIcon aria-hidden />
    </Button>
  </Toast>
);

export const Info = Template.bind({});
Info.args = {
  status: "info",
  children: (
    <StackLayout gap={0}>
      <Text>
        <strong>File update</strong>
      </Text>
      <Text>A new version of this file is available with 37 updates. </Text>
    </StackLayout>
  ),
};

export const Error: StoryFn<typeof Toast> = () => (
  <div style={{ width: 260 }}>
    <Toast status="error">
      <ToastContent>
        <StackLayout gap={0}>
          <Text>
            <strong>System error</strong>
          </Text>
          <Text>Connection timed out. Failed to retrieve data. </Text>
        </StackLayout>
      </ToastContent>
      <Button appearance="transparent" aria-label="Dismiss">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
    <Toast status="error">
      <ToastContent>
        <StackLayout gap={1}>
          <StackLayout gap={0}>
            <Text>
              <strong>System error</strong>
            </Text>
            <Text>Connection timed out. Failed to retrieve data. </Text>
          </StackLayout>
          <FlowLayout gap={1} justify="end">
            <Button>Dismiss</Button>
            <Button sentiment="accented">Try again</Button>
          </FlowLayout>
        </StackLayout>
      </ToastContent>
    </Toast>
  </div>
);

export const Warning: StoryFn<typeof Toast> = () => (
  <div style={{ width: 260 }}>
    <Toast status="warning">
      <ToastContent>
        <StackLayout gap={0}>
          <Text>
            <strong>File access</strong>
          </Text>
          <Text>Viewers of this file can see comments and suggestions. </Text>
        </StackLayout>
      </ToastContent>
      <Button appearance="transparent" aria-label="Dismiss">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
    <Toast status="warning">
      <ToastContent>
        <StackLayout gap={1}>
          <StackLayout gap={0}>
            <Text>
              <strong>File access</strong>
            </Text>
            <Text>Viewers of this file can see comments and suggestions. </Text>
          </StackLayout>
          <FlowLayout gap={1}>
            <Button sentiment="accented" style={{ width: "100%" }}>
              Edit permissions
            </Button>
            <Button style={{ width: "100%" }}>Dismiss</Button>
          </FlowLayout>
        </StackLayout>
      </ToastContent>
    </Toast>
  </div>
);

export const Success = Template.bind({});
Success.args = {
  status: "success",
  children: (
    <StackLayout gap={0}>
      <Text>
        <strong>Project file upload</strong>
      </Text>
      <Text>Project file has successfully uploaded to the shared drive. </Text>
    </StackLayout>
  ),
};

export const SingleLine = (args: ToastProps) => (
  <div style={{ width: 260 }}>
    <Toast {...args}>
      <ToastContent>
        <Text>This is a toast message.</Text>
      </ToastContent>
      <Button appearance="transparent" aria-label="Dismiss">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
    <Toast {...args}>
      <ToastContent>
        <Text>This is a toast message.</Text>
      </ToastContent>
    </Toast>
  </div>
);

export const CustomIcon = Template.bind({});
CustomIcon.args = {
  status: "success",
  icon: <GlobeIcon aria-label="success" />,
  children: (
    <StackLayout gap={0}>
      <Text>
        <strong>Connection established</strong>
      </Text>
      <Text>A connection has successfully been established.</Text>
    </StackLayout>
  ),
};
