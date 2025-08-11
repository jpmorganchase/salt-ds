import { Button, Input, Text } from "@salt-ds/core";
import {
  CloseIcon,
  CreditCardIcon,
  FilterClearIcon,
  FlagIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

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
        <Button sentiment="accented">
          <FlagIcon />
        </Button>
      }
      endAdornment={
        <Button appearance="transparent">
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
        <Button sentiment="accented">
          <FlagIcon />
        </Button>
      }
      endAdornment={
        <Button appearance="transparent">
          <CloseIcon />
        </Button>
      }
      defaultValue={"Button adornments"}
    />
    <Input
      variant="secondary"
      endAdornment={<Button sentiment="accented">SEND</Button>}
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
    <Input bordered defaultValue="Bordered" />
    <Input bordered disabled defaultValue="Bordered disabled" />
    <Input bordered readOnly defaultValue="Bordered readonly" />
    <Input bordered variant="secondary" defaultValue="Secondary bordered" />
    <Input
      bordered
      disabled
      variant="secondary"
      defaultValue="Secondary bordered disabled"
    />
    <Input
      bordered
      readOnly
      variant="secondary"
      defaultValue="Secondary bordered readonly"
    />
    <Input bordered defaultValue="Error bordered" validationStatus="error" />
    <Input
      bordered
      defaultValue="Warning bordered"
      validationStatus="warning"
    />
    <Input
      bordered
      defaultValue="Success bordered"
      validationStatus="success"
    />
    <Input
      bordered
      readOnly
      defaultValue="Error bordered readonly"
      validationStatus="error"
    />
    <Input
      bordered
      readOnly
      defaultValue="Warning bordered readonly"
      validationStatus="warning"
    />
    <Input
      bordered
      readOnly
      defaultValue="Success bordered readonly"
      validationStatus="success"
    />
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
