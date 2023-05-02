import { MouseEvent, useState } from 'react'
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Link, StackLayout, ValidationStatus } from "@salt-ds/core";
import { Banner, BannerProps } from "@salt-ds/lab";

export default {
  title: "Lab/Banner",
  component: Banner,
} as ComponentMeta<typeof Banner>;

export const Statuses: ComponentStory<typeof Banner> = (props) => {
  const { status, onClose, ...restProps } = props;

  const statuses: ValidationStatus[] = ["info", "error", "warning", "success"];

  return (
    <StackLayout style={{ width: "60vw" }}>
      {statuses.map((status) => (
        <Banner
          status={status}
          {...restProps}
        >
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
  const { onClose: onCloseProp, ...restProps } = props;

  const [open, setOpen] = useState(true)

  const onClose = (e: MouseEvent<HTMLButtonElement>) => {
    setOpen(false)
    onCloseProp?.(e)
  }

  return (
    <div style={{ width: "60vw" }}>
      {open && (
        <Banner {...restProps} onClose={onClose}>Banner with no close icon</Banner>
      )}
    </div>
  );
};

export const MultipleLines = ({ onClose, ...props }: BannerProps) => (
  <div style={{ width: "60vw" }}>
    <Banner {...props}>
      <div>
        Our guidance for hyphen and dash usage differs from that of the “AP
        Stylebook” and is aligned with the “J.P. Morgan Brand Guidelines” (also
        known as the Masterbrand guide).
      </div>
      <Link href={"#"}>Read more...</Link>
    </Banner>
  </div>
);
