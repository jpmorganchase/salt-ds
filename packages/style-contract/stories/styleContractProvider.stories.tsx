import { Button, Input, StackLayout } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import {
  StyleContract,
  StyleContractProvider,
  StyleContractDropdown,
} from "@salt-ds/style-contract";

import { SampleSchema } from "./sampleSchema";
import { z } from "zod";

const defaultContract = new StyleContract({
  name: "salt",
  contract: {
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
        "salt-editable-primary-background": "blue",
        "salt-editable-primary-foreground": "white",
      },
      md: {
        "salt-editable-primary-background": "green",
        "salt-editable-primary-foreground": "white",
      },
      lg: {
        "salt-editable-primary-background": "red",
        "salt-editable-primary-foreground": "white",
      },
    },
  },
  schema: SampleSchema,
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
  const productA = new StyleContract({
    name: "scheme A contract",
    contract: {
      ".saltButton-neutral.saltButton-solid": {
        "button-background-default": "green",
        "button-background-hover": "red",
        "button-background-active": "blue",
        "button-background-disabled": "red",
      },
    },
    schema: SampleSchema,
  });
  const productB = new StyleContract({
    name: "scheme B contract",
    contract: {
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
          "saltInput-contract-height": "60px",
          "saltInput-contract-fontSize": "20px",
        },
        md: {
          "saltInput-contract-height": "80px",
          "saltInput-contract-fontSize": "40px",
        },
        lg: {
          "saltInput-contract-height": "100px",
          "saltInput-contract-fontSize": "60px",
        },
      },
    },
    schema: SampleSchema,
  });
  return (
    <StyleContractProvider {...args} defaultContract={defaultContract}>
      <StackLayout>
        <Button>Sample Button</Button>
        <Input value={999.999} />
        <StyleContractDropdown
          contracts={[
            { owner: "product A", contracts: [productA] },
            { owner: "product B", contracts: [productB] },
          ]}
        />
      </StackLayout>
    </StyleContractProvider>
  );
};
