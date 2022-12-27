import { Banner, BannerProps } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { ReactNode, RefAttributes, useState } from "react";
import { Link, SaltProvider, StackLayout, Panel } from "@salt-ds/core";

export default {
  title: "Lab/Banner",
  component: Banner,
} as Meta<typeof Banner>;

interface ExampleRowProps {
  children: ReactNode;
  name: string;
}

const ExampleRow = ({ name, children }: ExampleRowProps) => (
  <Panel style={{ height: "unset" }}>
    <h1>{name} - ( Touch, Low, Medium, High )</h1>
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

const Examples = () => (
  <>
    <ExampleRow name="Error">
      <Error />
    </ExampleRow>
    <ExampleRow name="Success">
      <Success />
    </ExampleRow>
    <ExampleRow name="Warning">
      <Warning />
    </ExampleRow>
    <ExampleRow name="Info">
      <Info />
    </ExampleRow>
  </>
);

export const All: StoryFn<typeof Banner> = () => (
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
    <Examples />
  </div>
);

All.parameters = {
  axe: {
    skip: true,
  },
};

const ExampleBanner: StoryFn<typeof Banner> = (args) => {
  return (
    <div style={{ width: "95%", minWidth: "60vw" }}>
      <Banner {...args}>Banners appear inline on the page</Banner>
    </div>
  );
};

export const Info: StoryFn<typeof Banner> = () => {
  return <ExampleBanner status={"info"} />;
};

export const Error: StoryFn<typeof Banner> = () => {
  return <ExampleBanner status={"error"}>Action failed</ExampleBanner>;
};

export const Warning: StoryFn<typeof Banner> = () => {
  return (
    <ExampleBanner status={"warning"}>
      System is under increased load
    </ExampleBanner>
  );
};

export const Success: StoryFn<typeof Banner> = () => {
  return <ExampleBanner status={"success"}>Database updated</ExampleBanner>;
};

export const Emphasize: StoryFn<typeof Banner> = () => {
  return (
    <StackLayout gap={2}>
      <Banner emphasize={true}>Emphasized</Banner>
      <Banner emphasize={true} status="warning">
        Emphasized
      </Banner>
      <Banner emphasize={true} status="error">
        Emphasized
      </Banner>
      <Banner emphasize={true} status="success">
        Emphasized
      </Banner>
    </StackLayout>
  );
};

export const Render = (
  props: JSX.IntrinsicAttributes & BannerProps & RefAttributes<HTMLDivElement>
) => {
  const [showBanner, setShowBanner] = useState(true);

  const handleClose = () => {
    setShowBanner(false);
  };

  return (
    <div style={{ width: "95%", minWidth: "60vw" }}>
      {showBanner && (
        <Banner
          onClose={handleClose}
          render={({ Icon, getIconProps, getLabelProps, getLinkProps }) => (
            <>
              <Icon {...getIconProps()} aria-label={"Success"} />
              <span {...getLabelProps()}>
                Example custom renderer
                <Link {...getLinkProps()}>link</Link>
              </span>
            </>
          )}
          status="success"
          {...props}
        />
      )}
    </div>
  );
};

export const Banners = () => {
  return (
    <StackLayout gap={2}>
      <Banner>Banners appear inline on the page</Banner>
      <Banner status="warning">Banners appear inline on the page</Banner>
      <Banner status="error">Banners appear inline on the page</Banner>
      <Banner status="success">Banners appear inline on the page</Banner>
    </StackLayout>
  );
};

export const Dismissible = () => {
  return (
    <Banner
      onClose={() => {
        console.log("Dismissed");
      }}
    >
      Dismissible
    </Banner>
  );
};

export const LinkBanner = () => {
  return (
    <Banner LinkProps={{ href: "javascript:void(0)" }}>
      There has been an update to the terms and conditions
    </Banner>
  );
};
