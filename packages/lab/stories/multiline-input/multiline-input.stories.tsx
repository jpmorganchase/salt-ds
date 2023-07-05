import { Button, FlowLayout, Text } from "@salt-ds/core";
import { MultilineInput } from "@salt-ds/lab";
import {
  BookmarkSolidIcon,
  FilterClearIcon,
  FlagIcon,
  PinSolidIcon,
} from "@salt-ds/icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Multiline Input",
  component: MultilineInput,
} as ComponentMeta<typeof MultilineInput>;

export const Default: ComponentStory<typeof MultilineInput> = (args) => {
  return <MultilineInput defaultValue="Value" {...args} />;
};

export const NumberOfRows: ComponentStory<typeof MultilineInput> = (args) => {
  return <MultilineInput rows={5} defaultValue="Value" {...args} />;
};

export const FullBorder: ComponentStory<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput fullBorder defaultValue="Value" {...args} />
      <MultilineInput
        variant="secondary"
        fullBorder
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};

export const Variants: ComponentStory<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput defaultValue="Value" {...args} />
      <MultilineInput variant="secondary" defaultValue="Value" {...args} />
    </FlowLayout>
  );
};

export const Disabled: ComponentStory<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput disabled defaultValue="Value" {...args} />
      <MultilineInput
        disabled
        variant="secondary"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput disabled fullBorder defaultValue="Value" {...args} />
      <MultilineInput
        disabled
        fullBorder
        variant="secondary"
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};
export const Readonly: ComponentStory<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput readOnly defaultValue="Value" {...args} />
      <MultilineInput
        readOnly
        variant="secondary"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput readOnly fullBorder defaultValue="Value" {...args} />
      <MultilineInput
        readOnly
        fullBorder
        variant="secondary"
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};

export const EmptyReadonlyMarker: ComponentStory<typeof MultilineInput> = (
  args
) => {
  return (
    <FlowLayout>
      <MultilineInput readOnly={true} {...args} />
      <MultilineInput readOnly={true} emptyReadOnlyMarker="*" {...args} />
    </FlowLayout>
  );
};

export const Placeholder: ComponentStory<typeof MultilineInput> = (args) => {
  return <MultilineInput placeholder={"Enter a value"} {...args} />;
};

export const TextAlign: ComponentStory<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ maxWidth: "366px" }}>
      <MultilineInput defaultValue={args.defaultValue ?? "Value"} {...args} />
      <MultilineInput
        textAlign="center"
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
      <MultilineInput
        textAlign="right"
        defaultValue={args.defaultValue ?? "Value"}
        {...args}
      />
    </FlowLayout>
  );
};

export const ValidationStates: ComponentStory<typeof MultilineInput> = (
  args
) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput validationStatus="error" defaultValue="Value" {...args} />
      <MultilineInput
        fullBorder
        validationStatus="error"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        validationStatus="warning"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        fullBorder
        validationStatus="warning"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        validationStatus="success"
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        fullBorder
        validationStatus="success"
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};

export const WithAdornments: ComponentStory<typeof MultilineInput> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput
        startAdornment={<Button variant="cta">AB</Button>}
        endAdornment={
          <>
            <Text>%</Text>
            <FilterClearIcon />
          </>
        }
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        startAdornment={<FlagIcon />}
        endAdornment={
          <Button>
            <BookmarkSolidIcon />
          </Button>
        }
        defaultValue="Value"
        {...args}
      />
      <MultilineInput
        readOnly
        startAdornment={<FlagIcon />}
        endAdornment={
          <Button disabled>
            <BookmarkSolidIcon />
          </Button>
        }
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};

export const WithValidationAndAdornments: ComponentStory<
  typeof MultilineInput
> = (args) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <MultilineInput
        startAdornment={<FlagIcon />}
        endAdornment={<PinSolidIcon />}
        validationStatus="success"
        defaultValue="Value"
        {...args}
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
        defaultValue="Value"
        {...args}
      />
    </FlowLayout>
  );
};
