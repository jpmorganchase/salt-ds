import { FC } from "react";
import {
  Banner,
  BannerProps,
  BannerContent,
  BannerActions,
  Button,
  Link,
  StackLayout,
  SaltProvider,
} from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { CloseIcon } from "@salt-ds/icons";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
} from "docs/components";

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
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props
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
