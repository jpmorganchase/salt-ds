import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
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
} as ComponentMeta<typeof Banner>;

export const Default: ComponentStory<typeof Banner> = (props) => (
  <div style={{ width: 500 }}>
    <Banner {...props}>
      <BannerContent>Default banner</BannerContent>
    </Banner>
  </div>
);

export const Static: ComponentStory<typeof Banner> = (props) => (
  <div style={{ width: 500 }}>
    <Banner {...props}>
      <BannerContent>This component is deprecated.</BannerContent>
    </Banner>
  </div>
);

export const Interactive: ComponentStory<typeof Banner> = (props) => (
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

export const Inline: ComponentStory<typeof Banner> = (props) => (
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

export const Issue: ComponentStory<typeof Banner> = () => {
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

export const Warning: ComponentStory<typeof Banner> = () => {
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

export const Success: ComponentStory<typeof Banner> = () => {
  return (
    <Banner status="success" style={{ width: 500 }}>
      <BannerContent role="status">Database updated</BannerContent>
    </Banner>
  );
};

export const StatusesPrimary: ComponentStory<typeof Banner> = (props) => {
  const { status, ...restProps } = props;

  const statuses: ValidationStatus[] = ["info", "error", "warning", "success"];

  return (
    <StackLayout style={{ width: 500 }}>
      {statuses.map((status, i) => (
        <Banner status={status} {...restProps} key={i}>
          <BannerContent>Banners with status {status}.</BannerContent>
        </Banner>
      ))}
    </StackLayout>
  );
};

export const StatusesSecondary: ComponentStory<typeof Banner> = () => (
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
          <BannerContent>Controlled banner</BannerContent>
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
            <strong>Invalid Form</strong>
          </Text>
          <div>
            <ul style={{ paddingLeft: 0 }}>
              <li>Missing username</li>
              <li>Missing password</li>
            </ul>
          </div>
        </BannerContent>
      </Banner>
    </div>
  );
};

export const MultipleBanners: ComponentStory<typeof Banner> = () => {
  return (
    <StackLayout gap={3} style={{ width: 800 }}>
      <Banner status="info">
        <BannerContent>This is an info banner</BannerContent>
      </Banner>
      <Banner status="error">
        <BannerContent>This is an error banner</BannerContent>
      </Banner>
      <Banner status="warning">
        <BannerContent>This is a warning banner</BannerContent>
      </Banner>
      <Banner status="success">
        <BannerContent>This is a success banner</BannerContent>
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

export const MultipleActions: ComponentStory<typeof Banner> = (args) => {
  return (
    <Banner {...args} style={{ width: 500 }}>
      <BannerContent>This is a banner</BannerContent>
      <BannerActions>
        <Link>See more</Link>
        <Button aria-label="refresh" variant="secondary">
          <RefreshIcon />
        </Button>
      </BannerActions>
    </Banner>
  );
};
