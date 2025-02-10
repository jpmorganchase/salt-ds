import { Button, Input, StackLayout } from "@salt-ds/core";
import {
  StyleContract,
  StyleContractDropdown,
  StyleContractProvider,
} from "@salt-ds/style-contract";
import type { Meta, StoryFn } from "@storybook/react";
import type { GreatTuskContract } from "./GreatTuskContract";
import type { RaichuContract } from "./RaichuContract";
import type { SampleContract } from "./SampleContract";

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
      ".saltButton.salt-customizable-size-small": {
        sm: {
          "button-height": "20px",
        },
        md: {
          "button-height": "30px",
        },
        lg: {
          "button-height": "40px",
        },
      },
      ".saltButton.salt-customizable-size-medium": {
        sm: {
          "button-height": "40px",
        },
        md: {
          "button-height": "50px",
        },
        lg: {
          "button-height": "60px",
        },
      },
      ".saltButton.salt-customizable-size-large": {
        sm: {
          "button-height": "60px",
        },
        md: {
          "button-height": "70px",
        },
        lg: {
          "button-height": "80px",
        },
      },
      ".saltButton.salt-customizable-spacing-small": {
        sm: {
          "button-padding": "0 12px",
        },
        md: {
          "button-padding": "0 16px",
        },
        lg: {
          "button-padding": "0 20px",
        },
      },
      ".saltButton.salt-customizable-spacing-medium": {
        sm: {
          "button-padding": "0 16px",
        },
        md: {
          "button-padding": "0 20px",
        },
        lg: {
          "button-padding": "0 24px",
        },
      },
      ".saltButton.salt-customizable-spacing-large": {
        sm: {
          "button-padding": "0 20px",
        },
        md: {
          "button-padding": "0 24px",
        },
        lg: {
          "button-padding": "0 28px",
        },
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

export const MultipleContracts: StoryFn<typeof StyleContractProvider> = (
  args,
) => {
  const saltTestContract = new StyleContract<SampleContract>({
    name: "test",
    contract: {
      component: {
        ".saltButton-neutral.saltButton-solid": {
          sm: {
            "button-background-default": "green",
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
