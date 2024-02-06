import { Button, Text } from "@salt-ds/core";
import { PillInput } from "@salt-ds/lab";
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
  title: "Lab/Pill Input/Pill Input QA",
  component: PillInput,
} as Meta<typeof PillInput>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} itemPadding={4} {...props}>
    <PillInput defaultValue="Value" />
    <PillInput placeholder="Placeholder" />
    <PillInput defaultValue="Readonly" readOnly />
    <PillInput defaultValue="Disabled" disabled />
    <PillInput
      startAdornment={<FlagIcon />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon />
        </>
      }
      defaultValue={"Static adornments"}
    />
    <PillInput
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

    <PillInput defaultValue="Secondary Value" variant="secondary" />
    <PillInput placeholder="Secondary Placeholder" variant="secondary" />
    <PillInput defaultValue="Secondary Readonly" readOnly variant="secondary" />
    <PillInput defaultValue="Secondary Disabled" disabled variant="secondary" />
    <PillInput
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
    <PillInput
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
    <PillInput
      variant="secondary"
      endAdornment={<Button variant="cta">SEND</Button>}
      defaultValue={"Text button adornments"}
    />

    <PillInput defaultValue="Error value" validationStatus="error" />
    <PillInput defaultValue="Warning value" validationStatus="warning" />
    <PillInput defaultValue="Success value" validationStatus="success" />

    <PillInput
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
    <PillInput defaultValue="Value" />
    <PillInput placeholder="Placeholder" />
    <PillInput defaultValue="Readonly" readOnly />
    <PillInput defaultValue="Disabled" disabled />
    <PillInput
      startAdornment={<FlagIcon />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon />
        </>
      }
      defaultValue={"Static adornments"}
    />
    <PillInput
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
    <PillInput
      variant="secondary"
      endAdornment={<Button variant="cta">SEND</Button>}
      defaultValue={"Text button adornments"}
    />

    <PillInput defaultValue="Secondary Value" variant="secondary" />
    <PillInput placeholder="Secondary Placeholder" variant="secondary" />
    <PillInput defaultValue="Secondary Readonly" readOnly variant="secondary" />
    <PillInput defaultValue="Secondary Disabled" disabled variant="secondary" />
    <PillInput
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
    <PillInput
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

    <PillInput defaultValue="Error value" validationStatus="error" />
    <PillInput defaultValue="Warning value" validationStatus="warning" />
    <PillInput defaultValue="Success value" validationStatus="success" />

    <PillInput
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
