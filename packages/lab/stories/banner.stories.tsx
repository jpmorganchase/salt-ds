import { Banner, BannerProps, Link } from "@jpmorganchase/uitk-lab";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FC, ReactNode, RefAttributes, useState } from "react";
import { Panel, StackLayout, ToolkitProvider } from "@jpmorganchase/uitk-core";

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
    <h1>{name} - ( Touch, Low, Medium, High )</h1>
    <StackLayout gap={2}>
      Touch
      <ToolkitProvider density="touch">{children}</ToolkitProvider>
      Low
      <ToolkitProvider density="low">{children}</ToolkitProvider>
      Medium
      <ToolkitProvider density="medium">{children}</ToolkitProvider>
      High
      <ToolkitProvider density="high">{children}</ToolkitProvider>
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

export const All: ComponentStory<typeof Banner> = () => (
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

const ExampleBanner = ({ status, emphasis }: BannerProps) => {
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
          emphasis={emphasis}
        >
          Banners appear inline on the page
        </Banner>
      )}
    </div>
  );
};

export const Info: ComponentStory<typeof Banner> = () => {
  return <ExampleBanner status={"info"} />;
};

export const Error: ComponentStory<typeof Banner> = () => {
  return <ExampleBanner status={"error"} />;
};

export const Warning: ComponentStory<typeof Banner> = () => {
  return <ExampleBanner status={"warning"} />;
};

export const Success: ComponentStory<typeof Banner> = () => {
  return <ExampleBanner status={"success"} />;
};

export const HighEmphasis: ComponentStory<typeof Banner> = () => {
  return <ExampleBanner emphasis="high" status={"success"} />;
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
