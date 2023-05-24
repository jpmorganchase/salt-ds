import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  Banner,
  BannerProps,
  Button,
  SplitLayout,
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
  <div style={{ width: "500px" }}>
    <Banner {...props}>Default banner</Banner>
  </div>
);

export const Inline: ComponentStory<typeof Banner> = (props) => (
  <StackLayout gap={3}>
    <Text styleAs="h3">
      <strong>Terms and conditions</strong>
    </Text>
    <div style={{ width: 500 }}>
      <Banner {...props}>
        There has been an update to the terms and conditions
      </Banner>
    </div>
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
    <StackLayout gap={3}>
      <Banner status="error" role="alert">
        <SplitLayout
          startItem={
            <>
              <Text>
                <strong>Failed to connect to the server</strong>
              </Text>
              Error connecting to the server. Please refresh
            </>
          }
          endItem={
            <Button aria-label="refresh" variant="secondary">
              <RefreshIcon />
            </Button>
          }
        />
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
    <StackLayout gap={3}>
      <Banner status="warning" role="status">
        <SplitLayout
          startItem={"System is under increased load"}
          endItem={
            <Button aria-label="refresh" variant="secondary">
              <RefreshIcon />
            </Button>
          }
        />
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
    <Banner status="success" role="status">
      Database updated
    </Banner>
  );
};

export const StatusesPrimary: ComponentStory<typeof Banner> = (props) => {
  const { status, ...restProps } = props;

  const statuses: ValidationStatus[] = ["info", "error", "warning", "success"];

  return (
    <StackLayout style={{ width: "500px" }}>
      {statuses.map((status, i) => (
        <Banner status={status} {...restProps} key={i}>
          Banners with status {status}.
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
    <div style={{ width: "500px" }}>
      {!open && <Button onClick={reset}>Reset</Button>}
      {open && (
        <Banner>
          Controlled banner
          <Button
            aria-label="close banner"
            variant="secondary"
            onClick={onClose}
          >
            <CloseIcon />
          </Button>
        </Banner>
      )}
    </div>
  );
};

export const MultipleLines = (props: BannerProps) => {
  return (
    <div style={{ width: 500 }}>
      <Banner status="error" {...props}>
        <Text>
          <strong>Invalid Form</strong>
        </Text>
        <div>
          <ul style={{ paddingLeft: 0 }}>
            <li>Missing username</li>
            <li>Missing password</li>
          </ul>
        </div>
      </Banner>
    </div>
  );
};

export const MultipleBanners: ComponentStory<typeof Banner> = () => {
  return (
    <StackLayout gap={3}>
      <Banner status="info">This is an info banner</Banner>
      <Banner status="error">This is an error banner</Banner>
      <Banner status="warning">This is an warning banner</Banner>
      <Banner status="success">This is an success banner</Banner>
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
