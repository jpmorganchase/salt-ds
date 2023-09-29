import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  Banner,
  BannerActions,
  BannerContent,
  BannerProps,
  Button,
  Link,
  StackLayout,
  Text,
  ValidationStatus,
} from "@salt-ds/core";
import { CloseIcon, RefreshIcon } from "@salt-ds/icons";

export default {
  title: "Core/Banner",
  component: Banner,
} as Meta<typeof Banner>;

export const Default: StoryFn<typeof Banner> = (props) => (
  <div style={{ width: 500 }}>
    <Banner {...props}>
      <BannerContent>
        There has been an update to the terms and conditions
      </BannerContent>
    </Banner>
  </div>
);

export const Static: StoryFn<typeof Banner> = (props) => (
  <div style={{ width: 500 }}>
    <Banner {...props}>
      <BannerContent>This component is deprecated.</BannerContent>
    </Banner>
  </div>
);

export const Interactive: StoryFn<typeof Banner> = (props) => (
  <div style={{ width: 500 }}>
    <Banner status="warning" {...props}>
      <BannerContent>
        Unfortunately this release contains some serious bugs in the List
        Builder component. These have been fixed in{" "}
        <a href="./32.1.0">v32.1.0</a> so we recommend skipping this release and
        upgrading directly to v32.1.0 or later.
      </BannerContent>
      <BannerActions>
        <Button aria-label="close" variant="secondary">
          <CloseIcon />
        </Button>
      </BannerActions>
    </Banner>
  </div>
);

export const Inline: StoryFn<typeof Banner> = (props) => (
  <StackLayout gap={3} style={{ width: 800 }}>
    <Text styleAs="h3">
      <strong>Terms and conditions</strong>
    </Text>
    <Banner {...props}>
      <BannerContent>
        There has been an update to the terms and conditions
      </BannerContent>
    </Banner>
    <Text>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </Text>
    <Text>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </Text>
  </StackLayout>
);

export const Issue: StoryFn<typeof Banner> = () => {
  return (
    <StackLayout gap={3} style={{ width: 800 }}>
      <Banner status="error" role="alert">
        <BannerContent>
          <Text>
            <strong>Failed to connect to the server</strong>
          </Text>
          Error connecting to the server. Please refresh
        </BannerContent>
        <BannerActions>
          <Button aria-label="refresh" variant="secondary">
            <RefreshIcon />
          </Button>
        </BannerActions>
      </Banner>
      <Text styleAs="h1">Title</Text>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </Text>
    </StackLayout>
  );
};

export const Warning: StoryFn<typeof Banner> = () => {
  return (
    <StackLayout gap={3} style={{ width: 800 }}>
      <Banner status="warning">
        <BannerContent role="status">
          System is under increased load
        </BannerContent>
        <BannerActions>
          <Button aria-label="refresh" variant="secondary">
            <RefreshIcon />
          </Button>
        </BannerActions>
      </Banner>
      <Text styleAs="h1">Title</Text>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </Text>
    </StackLayout>
  );
};

export const Success: StoryFn<typeof Banner> = () => {
  return (
    <Banner status="success" style={{ width: 500 }}>
      <BannerContent role="status">Database updated</BannerContent>
    </Banner>
  );
};
const statuses: { status: ValidationStatus; content: string }[] = [
  {
    status: "info",
    content: "You are now using version 3.32.4",
  },
  {
    status: "warning",
    content: "We were not able to find your details",
  },
  {
    status: "error",
    content: "Your password will expire in 3 days",
  },
  {
    status: "success",
    content: "Document signed",
  },
];

export const StatusesPrimary: StoryFn<typeof Banner> = (props) => {
  const { status, ...restProps } = props;

  return (
    <StackLayout style={{ width: 500 }}>
      {statuses.map((example, i) => (
        <Banner status={example.status} {...restProps} key={i}>
          <BannerContent>{example.content}</BannerContent>
        </Banner>
      ))}
    </StackLayout>
  );
};

export const StatusesSecondary: StoryFn<typeof Banner> = () => (
  <StatusesPrimary variant="secondary" />
);

export const Dismissible = () => {
  const [open, setOpen] = useState(true);

  const onClose = () => {
    setOpen(false);
  };

  const reset = () => {
    setOpen(true);
  };
  return (
    <div style={{ width: 500 }}>
      {!open && <Button onClick={reset}>Reset</Button>}
      {open && (
        <Banner>
          <BannerContent>You are now using version 3.32.4</BannerContent>
          <BannerActions>
            <Button
              aria-label="close banner"
              variant="secondary"
              onClick={onClose}
            >
              <CloseIcon />
            </Button>
          </BannerActions>
        </Banner>
      )}
    </div>
  );
};

export const MultipleLines = (props: BannerProps) => {
  return (
    <div style={{ width: 500 }}>
      <Banner status="error" {...props}>
        <BannerContent>
          <Text>
            <strong>Information missing in form submission</strong>
          </Text>
          <div>
            <ul style={{ paddingLeft: 0 }}>
              <li>Username</li>
              <li>Password</li>
            </ul>
          </div>
        </BannerContent>
      </Banner>
    </div>
  );
};

export const MultipleBanners: StoryFn<typeof Banner> = () => {
  return (
    <StackLayout gap={3} style={{ width: 800 }}>
      {statuses.map((example, i) => (
        <Banner status={example.status} key={i}>
          <BannerContent>{example.content}</BannerContent>
        </Banner>
      ))}
      <Text styleAs="h1">Title</Text>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </Text>
    </StackLayout>
  );
};

export const MultipleActions: StoryFn<typeof Banner> = (args) => {
  return (
    <Banner {...args} style={{ width: 500 }}>
      <BannerContent>The one-time PIN you entered has expired</BannerContent>
      <BannerActions>
        <Link>See more</Link>
        <Button aria-label="refresh" variant="secondary">
          <RefreshIcon />
        </Button>
      </BannerActions>
    </Banner>
  );
};
