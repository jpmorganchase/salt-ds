import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Link, StackLayout, ValidationStatus } from "@salt-ds/core";
import { Banner, BannerProps } from "@salt-ds/lab";

export default {
  title: "Lab/Banner",
  component: Banner,
} as ComponentMeta<typeof Banner>;

export const Statuses: ComponentStory<typeof Banner> = (props) => {
  const { status, ...restProps } = props;

  const statuses: ValidationStatus[] = ["info", "error", "warning", "success"];

  return (
    <StackLayout style={{ width: "60vw" }}>
      {statuses.map((status) => (
        <Banner
          onClose={() => {
            console.log("onClose triggered");
          }}
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

export const HideClose = (props: BannerProps) => {
  const { onClose, ...restProps } = props;

  return (
    <div style={{ width: "60vw" }}>
      <Banner {...restProps}>Banner with no close icon</Banner>
    </div>
  );
};

export const MultipleLines = (props: BannerProps) => (
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
