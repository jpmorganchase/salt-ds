import {
  Button,
  H1,
  Input,
  SaltProvider,
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
    },
    component: {
      ".saltInput": {
        "input-boxShadow": "inset 0 1px 0 rgba(0, 0, 0, 0.5)",
      },
      ".saltInput.salt-size-large": {
        "input-height": "32px",
      },
      ".saltText.salt-size-large": {
        "text-fontSize": "20px",
        "text-lineHeight": "26px",
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
    <SaltProvider density="high">
      <StyleContractProvider {...args}>
        <StackLayout>
          <MockTicket />
          <StyleContractDropdown
            contracts={[{ owner: "Markets", contracts: [marketsContract] }]}
          />
        </StackLayout>
      </StyleContractProvider>
    </SaltProvider>
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
