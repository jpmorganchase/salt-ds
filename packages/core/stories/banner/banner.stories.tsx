import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  Banner,
  BannerProps,
  Button,
  Link,
  StackLayout,
  ValidationStatus,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export default {
  title: "Core/Banner",
  component: Banner,
} as ComponentMeta<typeof Banner>;

export const Default: ComponentStory<typeof Banner> = (props) => (
  <div style={{ width: "500px" }}>
    <Banner {...props}>Default banner</Banner>
  </div>
);

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

export const Controlled = () => {
  const [open, setOpen] = useState(true);

  const onClose = () => {
    setOpen(false);
  };

  const toggleButton = () => {
    setOpen(!open);
  };
  return (
    <div style={{ width: "500px" }}>
      {open && (
        <Banner>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            Controlled banner
            <Button variant="secondary" onClick={onClose}>
              <CloseIcon />
            </Button>
          </div>
        </Banner>
      )}
      <Button onClick={toggleButton}>toggle banner</Button>
    </div>
  );
};

export const MultipleLines = (props: BannerProps) => {
  const [open, setOpen] = useState(true);
  const onClose = () => {
    setOpen(false);
  };
  return (
    <div style={{ width: "500px" }}>
      {open && (
        <Banner {...props}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div>
              <div>
                Banner example containing multiple lines. This is supposed to
                showcase the alignment of the status icon, content and close
                button within the Banner.
              </div>
              <Link href={"#"}>Link example...</Link>
            </div>
            <Button variant="secondary" onClick={onClose}>
              <CloseIcon />
            </Button>
          </div>
        </Banner>
      )}
    </div>
  );
};
