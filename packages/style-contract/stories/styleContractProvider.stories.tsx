import {
  Button,
  Card,
  Display3,
  H1,
  Input,
  SaltProviderNext,
  StackLayout,
  Text,
} from "@salt-ds/core";
import {
  StyleContract,
  StyleContractDropdown,
  StyleContractProvider,
} from "@salt-ds/style-contract";
import type { Meta, StoryFn } from "@storybook/react";
import type { GreatTuskContract } from "./GreatTuskContract";
import type { RaichuContract } from "./RaichuContract";
import type { SampleContract } from "./SampleContract";
import { MockTicket } from "./MockTicket";
import { MarketsContract } from "./MarketsContract";
import Dashboard from "./Raichu/index";
import { AlphaCardContract } from "./AlphaCardContract";

const defaultContract = new StyleContract<SampleContract>({
  name: "salt",
  contract: {
    component: {
      ".saltButton-neutral.saltButton-solid": {
        "button-color-default": "white",
        "button-color-hover": "grey",
        "button-color-active": "grey",
        "button-color-disabled": "black",
        "button-background-default": "red",
        "button-background-hover": "green",
        "button-background-active": "blue",
        "button-background-disabled": "red",
      },
      ".saltInput": {
        sm: {
          "input-color": "white",
          "input-background-default": "blue",
          "input-background-hover": "green",
          "input-background-active": "blue",
          "input-background-disabled": "red",
          "input-borderColor-default": "red",
          "input-borderColor-hover": "green",
          "input-borderColor-active": "blue",
          "input-borderColor-disabled": "blue",
        },
        md: {
          "input-color": "white",
          "input-background-default": "blue",
          "input-background-hover": "green",
          "input-background-active": "blue",
          "input-background-disabled": "red",
          "input-borderColor-default": "red",
          "input-borderColor-hover": "green",
          "input-borderColor-active": "blue",
          "input-borderColor-disabled": "blue",
        },
        lg: {
          "input-color": "white",
          "input-background-default": "blue",
          "input-background-hover": "green",
          "input-background-active": "blue",
          "input-background-disabled": "red",
          "input-borderColor-default": "red",
          "input-borderColor-hover": "green",
          "input-borderColor-active": "blue",
          "input-borderColor-disabled": "blue",
        },
      },
    },
  },
});

export default {
  title: "Style Contract/StyleContractProvider",
  component: StyleContractProvider,
} as Meta<typeof StyleContractProvider>;

export const Default: StoryFn<typeof StyleContractProvider> = (args) => {
  return (
    <StyleContractProvider {...args} defaultContract={defaultContract}>
      <Button>Sample Button</Button>
    </StyleContractProvider>
  );
};

const marketsContract = new StyleContract<MarketsContract>({
  name: "proposed",
  contract: {
    system: {
      "salt-text-action-textTransform": "capitalize",
      "salt-palette-corner-weak": "2px",
    },
    component: {
      ".saltInput": {
        "input-boxShadow": "inset 0 1px 0 rgba(0, 0, 0, 0.5)",
      },
      ".saltButton": {
        "button-border": "1px hidden transparent",
      },
      ".saltButton.buy": {
        "button-background":
          "linear-gradient(to bottom, var(--salt-color-blue-300), var(--salt-color-blue-400))",
      },
      ".saltButton.sell": {
        "button-background":
          "linear-gradient(to bottom, var(--salt-color-red-300), var(--salt-color-red-400))",
      },
      ".saltButton.submit": {
        "button-background":
          "linear-gradient(to bottom, var(--salt-color-orange-200), var(--salt-color-orange-300))",
      },
      ".saltButton.salt-size-large": {
        "button-height": "32px",
      },
      ".saltInput.salt-size-large": {
        "input-height": "32px",
        "input-fontSize": "20px",
      },
      ".saltText.salt-size-large": {
        "text-fontSize": "20px",
        "text-lineHeight": "26px",
      },
      ".saltFormField": {
        "formField-gridTemplateColumns": "33.3% 1fr",
      },
      ".saltFormFieldLabel-right.saltText": {
        "formFieldLabel-paddingRight": "var(--salt-spacing-100)",
      },
      ".saltFormFieldLabel.salt-size-large": {
        "formFieldLabel-lineHeight": "32px",
      },
    },
  },
});

export const MockTicketWithContract: StoryFn<typeof StyleContractProvider> = (
  args,
) => {
  return (
    <SaltProviderNext density="high">
      <StyleContractProvider {...args}>
        <StackLayout>
          <MockTicket />
          <StyleContractDropdown
            contracts={[{ owner: "Markets", contracts: [marketsContract] }]}
          />
        </StackLayout>
      </StyleContractProvider>
    </SaltProviderNext>
  );
};

export const MultipleContracts: StoryFn<typeof StyleContractProvider> = (
  args,
) => {
  const saltTestContract = new StyleContract<SampleContract>({
    name: "test",
    contract: {
      component: {
        "h1.salt-size-small": {
          "text-fontSize": "20px",
          "text-lineHeight": "1",
        },
        "h1.salt-size-medium": {
          "text-fontSize": "28px",
          "text-lineHeight": "1",
        },
        "h1.salt-size-large": {
          "text-fontSize": "36px",
          "text-lineHeight": "1",
        },
        ".saltButton-neutral.saltButton-solid": {
          sm: {
            "button-background-default": "red",
            "button-background-hover": "green",
            "button-background-active": "blue",
            "button-background-disabled": "red",
            "button-color-default": "white",
            "button-color-hover": "grey",
            "button-color-active": "grey",
            "button-color-disabled": "black",
          },
          md: {
            "button-background-default": "red",
            "button-background-hover": "green",
            "button-background-active": "blue",
            "button-background-disabled": "red",
            "button-color-default": "white",
            "button-color-hover": "grey",
            "button-color-active": "grey",
            "button-color-disabled": "black",
          },
          lg: {
            "button-background-default": "blue",
            "button-background-hover": "green",
            "button-background-active": "blue",
            "button-background-disabled": "red",
            "button-color-default": "white",
            "button-color-hover": "grey",
            "button-color-active": "grey",
            "button-color-disabled": "black",
          },
        },
        ".saltInput": {
          sm: {
            "input-height": "60px",
            "input-fontSize": "20px",
            "input-color": "white",
            "input-background-default": "blue",
            "input-background-hover": "green",
            "input-background-active": "blue",
            "input-background-disabled": "red",
            "input-borderColor-default": "red",
            "input-borderColor-hover": "green",
            "input-borderColor-active": "blue",
            "input-borderColor-disabled": "blue",
          },
          md: {
            "input-height": "80px",
            "input-fontSize": "40px",
            "input-color": "white",
            "input-background-default": "blue",
            "input-background-hover": "green",
            "input-background-active": "blue",
            "input-background-disabled": "red",
            "input-borderColor-default": "red",
            "input-borderColor-hover": "green",
            "input-borderColor-active": "blue",
            "input-borderColor-disabled": "blue",
          },
          lg: {
            "input-height": "100px",
            "input-fontSize": "60px",
            "input-color": "white",
            "input-background-default": "blue",
            "input-background-hover": "green",
            "input-background-active": "blue",
            "input-background-disabled": "red",
            "input-borderColor-default": "red",
            "input-borderColor-hover": "green",
            "input-borderColor-active": "blue",
            "input-borderColor-disabled": "blue",
          },
        },
      },
    },
  });
  const raichuProposedContract = new StyleContract<RaichuContract>({
    name: "proposed",
    contract: {
      system: {
        "salt-text-action-textTransform": "capitalize",
      },
    },
  });
  const greatTuskProposedContract = new StyleContract<GreatTuskContract>({
    name: "proposed",
    contract: {
      system: {
        "salt-text-action-textTransform": "capitalize",
      },
    },
  });
  return (
    <StyleContractProvider {...args}>
      <StackLayout>
        <Button>Sample Button</Button>
        <Input value={999.999} />
        <StackLayout gap={0} align={"baseline"} direction={"row"}>
          <Text as="h1" size={"small"}>
            1.03
          </Text>
          <Text as="h1" size={"large"}>
            <strong>45</strong>
          </Text>
          <Text as="h1" size={"medium"}>
            3
          </Text>
        </StackLayout>
        <StackLayout align={"baseline"} direction={"row"}>
          <Text as="h1" size={"small"}>
            Text - Small
          </Text>
          <Text as="h1" size={"medium"}>
            Text - Medium
          </Text>
          <Text as="h1" size={"large"}>
            Text - Large
          </Text>
        </StackLayout>
        <StackLayout align={"baseline"} direction={"row"}>
          <H1 size={"small"}>H1 - Small</H1>
          <H1 size={"medium"}>H1 - Medium</H1>
          <H1 size={"large"}>H1 - Large</H1>
        </StackLayout>
        <StyleContractDropdown
          contracts={[
            { owner: "Salt", contracts: [saltTestContract] },
            { owner: "Raichu", contracts: [raichuProposedContract] },
            { owner: "Great Tusk", contracts: [greatTuskProposedContract] },
          ]}
        />
      </StackLayout>
    </StyleContractProvider>
  );
};

export const MockDashboardWithContract: StoryFn<
  typeof StyleContractProvider
> = (args) => {
  const raichuProposedContract = new StyleContract<RaichuContract>({
    name: "proposed",
    contract: {
      system: {
        "salt-text-action-textTransform": "capitalize",
      },
      component: {
        '[data-mode="dark"] .saltCard.saltCard-primary': {
          "card-background": "rgba(255, 255, 255, 0.3)",
          "card-border-color": "rgba(0, 0, 0, 0.3)",
          "card-border-radius": "var(--salt-curve-250)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-300)",
          "card-border-width": "var(--salt-size-border)",
        },
        '[data-mode="dark"] .saltCard.saltCard-secondary': {
          "card-background": "rgba(255, 255, 255, 0.2)",
          "card-border-color": "rgba(0, 0, 0, 0.2)",
          "card-border-radius": "var(--salt-curve-200)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-200)",
          "card-border-width": "var(--salt-size-border)",
        },
        '[data-mode="dark"] .saltCard.saltCard-tertiary': {
          "card-background": "rgba(255, 255, 255, 0.1)",
          "card-border-color": "rgba(0, 0, 0, 0.1)",
          "card-border-radius": "var(--salt-curve-150)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-100)",
          "card-border-width": "var(--salt-size-border)",
        },
        '[data-mode="light"] .saltCard.saltCard-primary': {
          "card-background": "rgba(0, 0, 0, 0.3)",
          "card-border-color": "rgba(255, 255, 255, 0.3)",
          "card-border-radius": "var(--salt-curve-250)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-300)",
          "card-border-width": "var(--salt-size-border)",
        },
        '[data-mode="light"] .saltCard.saltCard-secondary': {
          "card-background": "rgba(0, 0, 0, 0.2)",
          "card-border-color": "rgba(255, 255, 255, 0.2)",
          "card-border-radius": "var(--salt-curve-200)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-200)",
          "card-border-width": "var(--salt-size-border)",
        },
        '[data-mode="light"] .saltCard.saltCard-tertiary': {
          "card-background": "rgba(0, 0, 0, 0.1)",
          "card-border-color": "rgba(255, 255, 255, 0.1)",
          "card-border-radius": "var(--salt-curve-150)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-100)",
          "card-border-width": "var(--salt-size-border)",
        },
      },
    },
  });

  return (
    <SaltProviderNext
      density="low"
      accent="teal"
      actionFont={"Amplitude"}
      corner={"rounded"}
      headingFont={"Amplitude"}
    >
      <StyleContractProvider {...args}>
        <StackLayout>
          <StyleContractDropdown
            contracts={[
              { owner: "Raichu", contracts: [raichuProposedContract] },
            ]}
          />
          <Dashboard />
        </StackLayout>
      </StyleContractProvider>
    </SaltProviderNext>
  );
};

export const AlphaCard: StoryFn<typeof StyleContractProvider> = (args) => {
  const alphaCardContract = new StyleContract<AlphaCardContract>({
    name: "proposed",
    contract: {
      component: {
        '[data-mode="dark"] .saltCard.saltCard-primary': {
          "card-background": "rgba(255, 255, 255, 0.3)",
          "card-border-color": "rgba(0, 0, 0, 0.3)",
          "card-border-radius": "var(--salt-curve-250)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-300)",
          "card-border-width": "var(--salt-size-border)",
        },
        '[data-mode="dark"] .saltCard.saltCard-secondary': {
          "card-background": "rgba(255, 255, 255, 0.2)",
          "card-border-color": "rgba(0, 0, 0, 0.2)",
          "card-border-radius": "var(--salt-curve-200)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-200)",
          "card-border-width": "var(--salt-size-border)",
        },
        '[data-mode="dark"] .saltCard.saltCard-tertiary': {
          "card-background": "rgba(255, 255, 255, 0.1)",
          "card-border-color": "rgba(0, 0, 0, 0.1)",
          "card-border-radius": "var(--salt-curve-150)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-100)",
          "card-border-width": "var(--salt-size-border)",
        },
        '[data-mode="light"] .saltCard.saltCard-primary': {
          "card-background": "rgba(0, 0, 0, 0.3)",
          "card-border-color": "rgba(255, 255, 255, 0.3)",
          "card-border-radius": "var(--salt-curve-150)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-300)",
          "card-border-width": "var(--salt-size-border)",
        },
        '[data-mode="light"] .saltCard.saltCard-secondary': {
          "card-background": "rgba(0, 0, 0, 0.2)",
          "card-border-color": "rgba(255, 255, 255, 0.2)",
          "card-border-radius": "var(--salt-curve-200)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-200)",
          "card-border-width": "var(--salt-size-border)",
        },
        '[data-mode="light"] .saltCard.saltCard-tertiary': {
          "card-background": "rgba(0, 0, 0, 0.1)",
          "card-border-color": "rgba(255, 255, 255, 0.1)",
          "card-border-radius": "var(--salt-curve-150)",
          "card-box-shadow": "0px 2px 4px 0px var(--salt-shadow-200-color)",
          "card-padding": "var(--salt-spacing-100)",
          "card-border-width": "var(--salt-size-border)",
        },
      },
    },
  });

  const Content = ({ label }: { label: string }) => (
    <StackLayout gap={0}>
      <Text>
        <strong>{label}</strong>
      </Text>
      <StackLayout gap={0} direction="row" align="baseline">
        <Display3>9999.99</Display3>
        <StackLayout gap={0.5} direction="row" align="baseline">
          <Text>
            <strong>.00</strong>
          </Text>
          <Text color="secondary">USD</Text>
        </StackLayout>
      </StackLayout>
      <Text color="secondary">
        <small>17th Jan 2019</small>
      </Text>
    </StackLayout>
  );

  return (
    <SaltProviderNext density="low">
      <StackLayout>
        <H1>Solid / Out The Box</H1>
        <StackLayout direction={"row"}>
          <Card variant={"primary"}>
            <Content label={"primary"} />
          </Card>
          <Card variant={"secondary"}>
            <Content label={"secondary"} />
          </Card>
          <Card variant={"tertiary"}>
            <Content label={"tertiary"} />
          </Card>
        </StackLayout>
        <StyleContractProvider {...args}>
          <StackLayout>
            <H1>Alpha / With Contract </H1>
            <StackLayout direction={"row"}>
              <Card variant={"primary"}>
                <Content label={"primary"} />
              </Card>
              <Card variant={"secondary"}>
                <Content label={"secondary"} />
              </Card>
              <Card variant={"tertiary"}>
                <Content label={"tertiary"} />
              </Card>
            </StackLayout>
            <StyleContractDropdown
              contracts={[{ owner: "Salt", contracts: [alphaCardContract] }]}
            />
          </StackLayout>
        </StyleContractProvider>
      </StackLayout>
    </SaltProviderNext>
  );
};
