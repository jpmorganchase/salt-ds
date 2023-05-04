import { MouseEvent, useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Button, Link, StackLayout, ValidationStatus } from "@salt-ds/core";
import { Banner, BannerProps } from "@salt-ds/lab";

export default {
  title: "Lab/Banner",
  component: Banner,
} as ComponentMeta<typeof Banner>;

export const Default: ComponentStory<typeof Banner> = ({
  onClose,
  ...props
}) => (
  <div style={{ width: "60vw" }}>
    <Banner {...props}>Default banner</Banner>
  </div>
);

export const Statuses: ComponentStory<typeof Banner> = (props) => {
  const { status, onClose, ...restProps } = props;

  const statuses: ValidationStatus[] = ["info", "error", "warning", "success"];

  return (
    <StackLayout style={{ width: "60vw" }}>
      {statuses.map((status, i) => (
        <Banner status={status} {...restProps} key={i}>
          Banners with status {status}.
        </Banner>
      ))}
    </StackLayout>
  );
};

export const Emphasized: ComponentStory<typeof Banner> = () => (
  <Statuses emphasize />
);

export const ShowClose = (props: BannerProps) => {
  const onClose = () => {
    console.log("onClose was called");
  };

  return (
    <div style={{ width: "60vw" }}>
      <Banner {...props} onClose={onClose}>
        Banner with no close icon
      </Banner>
    </div>
  );
};

export const MultipleLines = (props: BannerProps) => {
  const onClose = () => {
    console.log("onClose was called");
  };

  return (
    <div style={{ width: "60vw" }}>
      <Banner {...props} onClose={onClose}>
        <div>
          Our guidance for hyphen and dash usage differs from that of the “AP
          Stylebook” and is aligned with the “J.P. Morgan Brand Guidelines”
          (also known as the Masterbrand guide).
        </div>
        <Link href={"#"}>Read more...</Link>
      </Banner>
    </div>
  );
};

export const Conditional = () => {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    console.log("onClose was called");
  };

  return (
    <div style={{ width: "60vw" }}>
      <Button onClick={handleClick}>Show banner</Button>
      {open && <Banner onClose={onClose}>Controlled banner</Banner>}
    </div>
  );
};
