import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Button, Link, StackLayout, ValidationStatus } from "@salt-ds/core";
import {
  Banner,
  BannerCloseButton,
  BannerContent,
  BannerProps,
} from "@salt-ds/lab";

export default {
  title: "Lab/Banner",
  component: Banner,
} as ComponentMeta<typeof Banner>;

export const Default: ComponentStory<typeof Banner> = (props) => (
  <div style={{ width: "60vw" }}>
    <Banner {...props}>
      <BannerContent>Default banner</BannerContent>
    </Banner>
  </div>
);

export const Statuses: ComponentStory<typeof Banner> = (props) => {
  const { status, ...restProps } = props;

  const statuses: ValidationStatus[] = ["info", "error", "warning", "success"];

  return (
    <StackLayout style={{ width: "60vw" }}>
      {statuses.map((status, i) => (
        <Banner status={status} {...restProps} key={i}>
          <BannerContent>Banners with status {status}.</BannerContent>
        </Banner>
      ))}
    </StackLayout>
  );
};

export const Emphasized: ComponentStory<typeof Banner> = () => (
  <Statuses emphasize />
);

export const WithClose = (props: BannerProps) => {
  const [open, setOpen] = useState(true);
  const onClose = () => {
    setOpen(false);
  };
  return (
    <div style={{ width: "60vw" }}>
      {open && (
        <Banner {...props}>
          <BannerContent>Banner with close button</BannerContent>
          <BannerCloseButton onClick={onClose} />
        </Banner>
      )}
    </div>
  );
};

export const MultipleLines = (props: BannerProps) => {
  const [open, setOpen] = useState(true);
  const onClose = () => {
    setOpen(false);
  };
  return (
    <div style={{ width: "60vw" }}>
      {open && (
        <Banner {...props}>
          <BannerContent>
            <div>
              Our guidance for hyphen and dash usage differs from that of the
              “AP Stylebook” and is aligned with the “J.P. Morgan Brand
              Guidelines” (also known as the Masterbrand guide).
            </div>
            <Link href={"#"}>Read more...</Link>
          </BannerContent>
          <BannerCloseButton onClick={onClose} />
        </Banner>
      )}
    </div>
  );
};

export const Controlled = () => {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div style={{ width: "60vw" }}>
      {open && (
        <Banner>
          <BannerContent>Controlled banner</BannerContent>
          <BannerCloseButton onClick={onClose} />
        </Banner>
      )}
      <Button onClick={handleClick}>Show banner</Button>
    </div>
  );
};
