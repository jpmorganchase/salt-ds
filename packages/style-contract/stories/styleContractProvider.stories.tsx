import { Button, FlowLayout, Input, Text, StackLayout } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import {
  StyleContract,
  StyleContractProvider,
  StyleContractDropdown,
} from "@salt-ds/style-contract";

import { SampleSchema } from "./sampleSchema";

const defaultContract = new StyleContract({
  name: "salt",
  contract: {
    ".saltButton": {
      sm: {
        "salt-actionable-bold-foreground": "white",
        "salt-actionable-bold-background": "blue",
      },
      md: {
        "salt-actionable-bold-foreground": "white",
        "salt-actionable-bold-background": "green",
      },
      lg: {
        "salt-actionable-bold-foreground": "white",
        "salt-actionable-bold-background": "red",
      },
    },
    ".saltButton.salt-customizable-size-small": {
      sm: {
        "saltButton-height": "20px",
      },
      md: {
        "saltButton-height": "40px",
      },
      lg: {
        "saltButton-height": "60px",
      },
    },
    ".saltButton.salt-customizable-size-medium": {
      sm: {
        "saltButton-height": "40px",
      },
      md: {
        "saltButton-height": "60px",
      },
      lg: {
        "saltButton-height": "80px",
      },
    },
    ".saltButton.salt-customizable-size-large": {
      sm: {
        "saltButton-height": "60px",
      },
      md: {
        "saltButton-height": "80px",
      },
      lg: {
        "saltButton-height": "100px",
      },
    },
    ".saltButton.salt-customizable-spacing-small": {
      sm: {
        "saltButton-padding": "20px",
      },
      md: {
        "saltButton-padding": "40px",
      },
      lg: {
        "saltButton-padding": "60px",
      },
    },
    ".saltButton.salt-customizable-spacing-medium": {
      sm: {
        "saltButton-padding": "40px",
      },
      md: {
        "saltButton-padding": "60px",
      },
      lg: {
        "saltButton-padding": "80px",
      },
    },
    ".saltButton.salt-customizable-spacing-large": {
      sm: {
        "saltButton-padding": "60px",
      },
      md: {
        "saltButton-padding": "80px",
      },
      lg: {
        "saltButton-padding": "100px",
      },
    },
    ".saltInput": {
      sm: {
        "salt-editable-secondary-background": "yellow",
      },
      md: {
        "salt-editable-secondary-background": "red",
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
      ".saltButton": {
        "salt-actionable-bold-foreground": "white",
        "salt-actionable-bold-background": "red",
      },
    },
    schema: SampleSchema,
  });
  const productB = new StyleContract({
    name: "scheme B contract",
    contract: {
      ".saltButton": {
        sm: {
          "salt-actionable-bold-foreground": "white",
          "salt-actionable-bold-background": "red",
        },
        md: {
          "salt-actionable-bold-foreground": "white",
          "salt-actionable-bold-background": "green",
        },
        lg: {
          "salt-actionable-bold-foreground": "white",
          "salt-actionable-bold-background": "blue",
        },
      },
    },
    schema: SampleSchema,
  });
  return (
    <StyleContractProvider {...args} defaultContract={defaultContract}>
      <StackLayout>
        <Button>Sample Button</Button>
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
