import { FC, ReactNode, RefAttributes, useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Link, StackLayout, SaltProvider, Panel } from "@salt-ds/core";
import { Banner, BannerProps } from "@salt-ds/lab";

export default {
  title: "Lab/Banner",
  component: Banner,
} as ComponentMeta<typeof Banner>;

interface ExampleRowProps {
  children: ReactNode;
  name: string;
}

const ExampleRow: FC<ExampleRowProps> = ({ name, children }) => (
  <Panel style={{ height: "unset" }}>
    <h1>{name}</h1>
    <StackLayout gap={2}>
      Touch
      <SaltProvider density="touch">{children}</SaltProvider>
      Low
      <SaltProvider density="low">{children}</SaltProvider>
      Medium
      <SaltProvider density="medium">{children}</SaltProvider>
      High
      <SaltProvider density="high">{children}</SaltProvider>
    </StackLayout>
  </Panel>
);


const ExampleBanner = (props: BannerProps) => {
  const { status, emphasize, ...restProps } = props
  const [showBanner, setShowBanner] = useState(true);

  const handleClose = () => {
    setShowBanner(false);
  };

  return (
    <div style={{ width: "95%", minWidth: "60vw" }}>
      {showBanner && (
        <Banner
          //eslint-disable-next-line no-script-url
          LinkProps={{ href: "javascript:void(0)" }}
          onClose={handleClose}
          status={status}
          emphasize={emphasize}
          {...restProps}
        >
          Banners appear inline on the page
        </Banner>
      )}
    </div>
  );
};


export const All: ComponentStory<typeof Banner> = (props) => (
  <div
    style={{
      height: "100%",
      overflowY: "scroll",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    }}
  >
    <ExampleRow name="Error">
      <ExampleBanner {...props} />
    </ExampleRow>
  </div>
);


export const Emphasize: ComponentStory<typeof Banner> = (props) => {
  return <ExampleBanner emphasize={true} {...props} />;
};

export const HideIcon = (props: BannerProps) => (<ExampleBanner hideIcon {...props} />)

export const HideClose = (props: BannerProps) => {
  const { onClose, ...restProps } = props

  return (
    <Banner {...restProps}>
      Banner with no close icon
    </Banner>
  )
}

export const MultipleLines = (props: BannerProps) => (
  <Banner {...props}>
    Our guidance for hyphen and dash usage differs from that of the “AP Stylebook” and is aligned with the “J.P. Morgan Brand Guidelines” (also known as the Masterbrand guide).
  </Banner>
)