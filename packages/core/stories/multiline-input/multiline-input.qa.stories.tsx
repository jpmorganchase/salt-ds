import { Button, MultilineInput, Text } from "@salt-ds/core";
import {
  FilterClearIcon,
  FlagIcon,
  HelpSolidIcon,
  PinSolidIcon,
  SendIcon,
} from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
  QAContainerProps,
} from "docs/components";

export default {
  title: "Core/Multiline Input/MultilineInput QA",
  component: MultilineInput,
} as Meta<typeof MultilineInput>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} itemPadding={4} {...props}>
    <MultilineInput defaultValue="Value 3 rows" rows={3} />
    <MultilineInput placeholder="Placeholder" />
    <MultilineInput defaultValue="Disabled" disabled />
    <MultilineInput defaultValue="Readonly" readOnly />
    <MultilineInput
      defaultValue="With multiple adornment"
      startAdornment={<Text>£</Text>}
      endAdornment={
        <>
          <Text>GBP</Text>
          <Button variant="secondary">
            <HelpSolidIcon />
          </Button>
          <Button variant="cta">
            <SendIcon />
          </Button>
        </>
      }
    />
    <MultilineInput defaultValue="Bordered" bordered />
    <MultilineInput defaultValue="Disabled bordered" bordered disabled />
    <MultilineInput defaultValue="Readonly bordered" bordered readOnly />

    <MultilineInput
      defaultValue="Secondary value 3 rows"
      rows={3}
      variant="secondary"
    />
    <MultilineInput placeholder="Secondary Placeholder" variant="secondary" />
    <MultilineInput
      defaultValue="Secondary Disabled"
      disabled
      variant="secondary"
    />
    <MultilineInput
      defaultValue="Secondary Readonly"
      readOnly
      variant="secondary"
    />
    <MultilineInput
      defaultValue="Secondary with multiple adornment"
      variant="secondary"
      startAdornment={<Text>£</Text>}
      endAdornment={
        <>
          <Text>GBP</Text>
          <Button variant="secondary">
            <HelpSolidIcon />
          </Button>
          <Button variant="cta">
            <SendIcon />
          </Button>
        </>
      }
    />
    <MultilineInput
      defaultValue="Secondary with text button adornment"
      variant="secondary"
      startAdornment={<Text>£</Text>}
      endAdornment={<Button variant="cta">SEND</Button>}
    />
    <MultilineInput
      defaultValue="Secondary bordered"
      bordered
      variant="secondary"
    />
    <MultilineInput
      defaultValue="Secondary disabled bordered"
      bordered
      disabled
      variant="secondary"
    />
    <MultilineInput
      defaultValue="Secondary readonly bordered"
      bordered
      readOnly
      variant="secondary"
    />

    <MultilineInput
      startAdornment={<FlagIcon />}
      endAdornment={<PinSolidIcon />}
      validationStatus="success"
      defaultValue="Success"
    />
    <MultilineInput
      startAdornment={<FlagIcon />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon />
        </>
      }
      validationStatus="error"
      defaultValue="Error"
    />
    <MultilineInput validationStatus="warning" defaultValue="Warning" />

    <MultilineInput
      startAdornment={<FlagIcon />}
      endAdornment={<PinSolidIcon />}
      validationStatus="success"
      defaultValue="Success bordered"
      bordered
    />
    <MultilineInput
      startAdornment={<FlagIcon />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon />
        </>
      }
      validationStatus="error"
      defaultValue="Error bordered"
      bordered
    />
    <MultilineInput
      validationStatus="warning"
      defaultValue="Warning bordered"
      bordered
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
    <MultilineInput defaultValue="Value 3 rows" rows={3} />
    <MultilineInput placeholder="Placeholder" />
    <MultilineInput defaultValue="Disabled" disabled />
    <MultilineInput defaultValue="Readonly" readOnly />
    <MultilineInput
      defaultValue="With multiple adornment"
      startAdornment={<Text>£</Text>}
      endAdornment={
        <>
          <Text>GBP</Text>
          <Button variant="secondary">
            <HelpSolidIcon />
          </Button>
          <Button variant="cta">
            <SendIcon />
          </Button>
        </>
      }
    />
    <MultilineInput defaultValue="Bordered" bordered />
    <MultilineInput defaultValue="Disabled bordered" bordered disabled />
    <MultilineInput defaultValue="Readonly bordered" bordered readOnly />

    <MultilineInput
      defaultValue="Secondary value 3 rows"
      rows={3}
      variant="secondary"
    />
    <MultilineInput placeholder="Secondary Placeholder" variant="secondary" />
    <MultilineInput
      defaultValue="Secondary Disabled"
      disabled
      variant="secondary"
    />
    <MultilineInput
      defaultValue="Secondary Readonly"
      readOnly
      variant="secondary"
    />
    <MultilineInput
      defaultValue="Secondary with multiple adornment"
      variant="secondary"
      startAdornment={<Text>£</Text>}
      endAdornment={
        <>
          <Text>GBP</Text>
          <Button variant="secondary">
            <HelpSolidIcon />
          </Button>
          <Button variant="cta">
            <SendIcon />
          </Button>
        </>
      }
    />
    <MultilineInput
      defaultValue="Secondary with text button adornment"
      variant="secondary"
      startAdornment={<Text>£</Text>}
      endAdornment={<Button variant="cta">SEND</Button>}
    />
    <MultilineInput
      defaultValue="Secondary bordered"
      bordered
      variant="secondary"
    />
    <MultilineInput
      defaultValue="Secondary disabled bordered"
      bordered
      disabled
      variant="secondary"
    />
    <MultilineInput
      defaultValue="Secondary readonly bordered"
      bordered
      readOnly
      variant="secondary"
    />

    <MultilineInput
      startAdornment={<FlagIcon />}
      endAdornment={<PinSolidIcon />}
      validationStatus="success"
      defaultValue="Success"
    />
    <MultilineInput
      startAdornment={<FlagIcon />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon />
        </>
      }
      validationStatus="error"
      defaultValue="Error"
    />
    <MultilineInput validationStatus="warning" defaultValue="Warning" />

    <MultilineInput
      startAdornment={<FlagIcon />}
      endAdornment={<PinSolidIcon />}
      validationStatus="success"
      defaultValue="Success bordered"
      bordered
    />
    <MultilineInput
      startAdornment={<FlagIcon />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon />
        </>
      }
      validationStatus="error"
      defaultValue="Error bordered"
      bordered
    />
    <MultilineInput
      validationStatus="warning"
      defaultValue="Warning bordered"
      bordered
    />
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
