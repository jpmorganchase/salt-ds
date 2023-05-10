import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  Banner,
  BannerCloseButton,
  BannerContent,
  BannerProps,
  Button,
  Link,
  StackLayout,
  ValidationStatus,
} from "@salt-ds/core";

export default {
  title: "Core/Banner",
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

export const Controlled = () => {
  const [open, setOpen] = useState(true);
  const handleClick = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div style={{ width: "50vw" }}>
      {open ? (
        <Banner>
          <BannerContent>Controlled banner</BannerContent>
          <BannerCloseButton onClick={onClose} />
        </Banner>
      ) : (
        <Button onClick={handleClick}>Show banner</Button>
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
              Banner example containing multiple lines. This is supposed to
              showcase the alignment of the status icon, content and close
              button within the Banner.
            </div>
            <Link href={"#"}>Link example...</Link>
          </BannerContent>
          <BannerCloseButton onClick={onClose} />
        </Banner>
      )}
    </div>
  );
};
