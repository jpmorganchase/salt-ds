import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Link, StackLayout, ValidationStatus } from "@salt-ds/core";
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
  const { status, onClose, ...restProps } = props;

  const statuses: ValidationStatus[] = ["info", "error", "warning", "success"];

  return (
    <StackLayout style={{ width: "60vw" }}>
      {statuses.map((status) => (
        <Banner status={status} {...restProps}>
          {" "}
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
  const handleClick = () => {
    setOpen(false);
  };
  return (
    <div style={{ width: "60vw" }}>
      <Banner {...props} open={open}>
        <BannerContent>Banner with no close icon</BannerContent>
        <BannerCloseButton onClick={handleClick} />
      </Banner>
    </div>
  );
};

export const MultipleLines = ({ onClose, ...props }: BannerProps) => {
  const [open, setOpen] = useState(true);
  const handleClick = () => {
    setOpen(false);
  };
  return (
    <div style={{ width: "60vw" }}>
      <Banner {...props} open={open}>
        <BannerContent>
          <div>
            Our guidance for hyphen and dash usage differs from that of the “AP
            Stylebook” and is aligned with the “J.P. Morgan Brand Guidelines”
            (also known as the Masterbrand guide).
          </div>
          <Link href={"#"}>Read more...</Link>
        </BannerContent>
        <BannerCloseButton onClick={handleClick} />
      </Banner>
    </div>
  );
};
