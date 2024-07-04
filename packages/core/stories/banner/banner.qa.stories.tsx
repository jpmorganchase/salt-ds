import {
  Banner,
  BannerActions,
  BannerContent,
  Button,
  Link,
  type BannerProps
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
} from "docs/components";
import type { FC } from "react";

export default {
  title: "Core/Banner/Banner QA",
  component: Banner,
} as Meta<typeof Banner>;

const BasicBannerExample: FC<BannerProps> = ({ status }) => {
  return (
    <Banner status={status}>
      <BannerContent>
        Example custom renderer <Link href={"#"}>link</Link>
      </BannerContent>
      <BannerActions>
        <Button aria-label="refresh" variant="secondary">
          <CloseIcon />
        </Button>
      </BannerActions>
    </Banner>
  );
};

const InfoBanner = () => <BasicBannerExample status={"info"} />;
const ErrorBanner = () => <BasicBannerExample status={"error"} />;
const WarningBanner = () => <BasicBannerExample status={"warning"} />;
const SuccessBanner = () => <BasicBannerExample status={"success"} />;

export const ExamplesGrid: StoryFn = (props) => (
  <QAContainer cols={1} itemPadding={10} height={600} width={1000} {...props}>
    <InfoBanner />
    <ErrorBanner />
    <WarningBanner />
    <SuccessBanner />
  </QAContainer>
);

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props,
) => (
  <QAContainerNoStyleInjection
    cols={1}
    itemPadding={10}
    height={600}
    width={1000}
    {...props}
  >
    <InfoBanner />
    <ErrorBanner />
    <WarningBanner />
    <SuccessBanner />
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
