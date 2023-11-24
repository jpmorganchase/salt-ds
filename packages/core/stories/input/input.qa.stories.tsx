import { Button, Input, Text } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
  QAContainerProps,
} from "docs/components";
import {
  CloseIcon,
  CreditCardIcon,
  FilterClearIcon,
  FlagIcon,
} from "@salt-ds/icons";

export default {
  title: "Core/Input/Input QA",
  component: Input,
} as Meta<typeof Input>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} itemPadding={4} {...props}>
    <Input defaultValue="Value" />
    <Input placeholder="Placeholder" />
    <Input defaultValue="Readonly" readOnly />
    <Input defaultValue="Disabled" disabled />
    <Input
      startAdornment={<FlagIcon />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon />
        </>
      }
      defaultValue={"Static adornments"}
    />
    <Input
      startAdornment={
        <Button variant="cta">
          <FlagIcon />
        </Button>
      }
      endAdornment={
        <Button variant="secondary">
          <CloseIcon />
        </Button>
      }
      defaultValue={"Button adornments"}
    />

    <Input defaultValue="Secondary Value" variant="secondary" />
    <Input placeholder="Secondary Placeholder" variant="secondary" />
    <Input defaultValue="Secondary Readonly" readOnly variant="secondary" />
    <Input defaultValue="Secondary Disabled" disabled variant="secondary" />
    <Input
      variant="secondary"
      startAdornment={<FlagIcon />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon />
        </>
      }
      defaultValue={"Static adornments"}
    />
    <Input
      variant="secondary"
      startAdornment={
        <Button variant="cta">
          <FlagIcon />
        </Button>
      }
      endAdornment={
        <Button variant="secondary">
          <CloseIcon />
        </Button>
      }
      defaultValue={"Button adornments"}
    />
    <Input
      variant="secondary"
      endAdornment={<Button variant="cta">SEND</Button>}
      defaultValue={"Text button adornments"}
    />

    <Input defaultValue="Error value" validationStatus="error" />
    <Input defaultValue="Warning value" validationStatus="warning" />
    <Input defaultValue="Success value" validationStatus="success" />

    <Input
      startAdornment={<FlagIcon />}
      endAdornment={<CreditCardIcon />}
      defaultValue={"Error with adornments"}
      validationStatus="error"
    />
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props
) => (
  <QAContainerNoStyleInjection
    height={500}
    width={1000}
    itemPadding={4}
    {...props}
  >
    <Input defaultValue="Value" />
    <Input placeholder="Placeholder" />
    <Input defaultValue="Readonly" readOnly />
    <Input defaultValue="Disabled" disabled />
    <Input
      startAdornment={<FlagIcon />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon />
        </>
      }
      defaultValue={"Static adornments"}
    />
    <Input
      startAdornment={
        <Button variant="cta">
          <FlagIcon />
        </Button>
      }
      endAdornment={
        <Button variant="secondary">
          <CloseIcon />
        </Button>
      }
      defaultValue={"Button adornments"}
    />
    <Input
      variant="secondary"
      endAdornment={<Button variant="cta">SEND</Button>}
      defaultValue={"Text button adornments"}
    />

    <Input defaultValue="Secondary Value" variant="secondary" />
    <Input placeholder="Secondary Placeholder" variant="secondary" />
    <Input defaultValue="Secondary Readonly" readOnly variant="secondary" />
    <Input defaultValue="Secondary Disabled" disabled variant="secondary" />
    <Input
      variant="secondary"
      startAdornment={<FlagIcon />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon />
        </>
      }
      defaultValue={"Static adornments"}
    />
    <Input
      variant="secondary"
      startAdornment={
        <Button variant="cta">
          <FlagIcon />
        </Button>
      }
      endAdornment={
        <Button variant="secondary">
          <CloseIcon />
        </Button>
      }
      defaultValue={"Button adornments"}
    />

    <Input defaultValue="Error value" validationStatus="error" />
    <Input defaultValue="Warning value" validationStatus="warning" />
    <Input defaultValue="Success value" validationStatus="success" />

    <Input
      startAdornment={<FlagIcon />}
      endAdornment={<CreditCardIcon />}
      defaultValue={"Error with adornments"}
      validationStatus="error"
    />
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
