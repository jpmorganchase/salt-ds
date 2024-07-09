import {
  Button,
  FlowLayout,
  Link,
  Text,
  Toast,
  ToastContent,
  type ToastProps,
} from "@salt-ds/core";
import { CloseIcon, GlobeIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Core/Toast",
  component: Toast,
} as Meta<typeof Toast>;

const Template: StoryFn<typeof Toast> = ({ children, ...args }) => (
  <Toast {...args} style={{ width: 260 }}>
    <ToastContent>{children}</ToastContent>
    <Button variant="secondary" aria-label="Dismiss">
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
    <Button variant="secondary" aria-label="Dismiss">
      <CloseIcon aria-hidden />
    </Button>
  </Toast>
);

export const Info = Template.bind({});
Info.args = {
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

export const Error: StoryFn<typeof Toast> = () => (
  <div style={{ width: 260 }}>
    <Toast status="error">
      <ToastContent>
        <div>
          <Text>
            <strong>System error</strong>
          </Text>
          <div>Connection timed out. Failed to retrieve data. </div>
        </div>
      </ToastContent>
      <Button variant="secondary" aria-label="Dismiss">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
    <Toast status="error">
      <ToastContent>
        <div>
          <Text>
            <strong>System error</strong>
          </Text>
          <div>Connection timed out. Failed to retrieve data. </div>
        </div>
        <FlowLayout
          gap={1}
          justify="end"
          style={{ marginTop: "var(--salt-spacing-100)" }}
        >
          <Button>Dismiss</Button>
          <Button variant="cta">Try again</Button>
        </FlowLayout>
      </ToastContent>
    </Toast>
  </div>
);

export const Warning: StoryFn<typeof Toast> = () => (
  <div style={{ width: 260 }}>
    <Toast status="warning">
      <ToastContent>
        <div>
          <Text>
            <strong>File access</strong>
          </Text>
          <div>Viewers of this file can see comments and suggestions. </div>
        </div>
      </ToastContent>
      <Button variant="secondary" aria-label="Dismiss">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
    <Toast status="warning">
      <ToastContent>
        <div>
          <Text>
            <strong>File access</strong>
          </Text>
          <div>Viewers of this file can see comments and suggestions. </div>
        </div>
        <FlowLayout gap={1} style={{ marginTop: "var(--salt-spacing-100)" }}>
          <Button variant="cta" style={{ width: "100%" }}>
            Edit permissions
          </Button>
          <Button style={{ width: "100%" }}>Dismiss</Button>
        </FlowLayout>
      </ToastContent>
    </Toast>
  </div>
);

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

export const SingleLine = (args: ToastProps) => (
  <div style={{ width: 260 }}>
    <Toast {...args}>
      <ToastContent>
        <div>This is a toast message.</div>
      </ToastContent>
      <Button variant="secondary" aria-label="Dismiss">
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
    <Toast {...args}>
      <ToastContent>
        <div>This is a toast message.</div>
      </ToastContent>
    </Toast>
  </div>
);

export const CustomIcon = Template.bind({});
CustomIcon.args = {
  status: "success",
  icon: <GlobeIcon aria-label="success" />,
  children: (
    <div>
      <Text>
        <strong>Connection established</strong>
      </Text>
      <div>A connection has successfully been established.</div>
    </div>
  ),
};
