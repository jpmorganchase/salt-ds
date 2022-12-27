// TODO revisit when:
//  - multiline is implemented for Input
import { Button, SaltProvider, StackLayout } from "@salt-ds/core";
import {
  CalendarIcon,
  CallIcon,
  CloseIcon,
  SendIcon,
  UserIcon,
} from "@salt-ds/icons";
import { Dropdown, FormField, Input, StaticInputAdornment } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Input",
  component: Input,
} as Meta<typeof Input>;

const Template: StoryFn<typeof Input> = (args) => {
  // let text;
  // @ts-ignore
  // if (args.multiline) {
  //   text =
  //     "This is a Multiline Input with text which wraps onto more than one line.";
  // } else {
  //  text= "Value"
  // }

  return (
    <Input
      defaultValue={args.defaultValue ?? "Value"}
      style={{ width: "292px" }}
      {...args}
    />
  );
};

export const FeatureInput = Template.bind({});

FeatureInput.argTypes = {
  disabled: {
    control: {
      type: "boolean",
    },
  },
  // multiline: {
  //   control: {
  //     type: "boolean",
  //   },
  // },
  textAlign: {
    options: ["left", "right"],
    control: {
      type: "inline-radio",
    },
  },
};

FeatureInput.args = {
  disabled: false,
  // multiline: false,
  textAlign: "left",
};

export const ReadOnly: StoryFn<typeof Input> = () => {
  return (
    <StackLayout gap={1}>
      <Input
        defaultValue={"Read Only Input"} // Read Only isn't currently a prop
        readOnly
        style={{ width: "292px" }}
      />
      <Input readOnly style={{ width: "292px" }} />
    </StackLayout>
  );
};

export const WithFormField: StoryFn<typeof Input> = () => {
  return (
    <FormField label="ADA compliant label" style={{ width: 292 }}>
      <Input defaultValue="Value" />
    </FormField>
  );
};

export const WithFormFieldNoInitialValue: StoryFn<typeof Input> = () => {
  return (
    <FormField label="ADA compliant label" style={{ width: 292 }}>
      <Input />
    </FormField>
  );
};

export const Spellcheck: StoryFn<typeof Input> = () => {
  return (
    <Input
      defaultValue="This is a comment. It contains several sentences, with words spelt correctly or incorectly. Click to see Spellcheck take effect."
      style={{ width: "292px" }}
      inputProps={{ spellCheck: true }}
    />
  );
};

export const TouchDensityInput: StoryFn<typeof Input> = () => {
  return (
    <SaltProvider density="touch">
      <Input defaultValue="Touch Density Input" style={{ width: "292px" }} />
    </SaltProvider>
  );
};

export const LowDensityInput: StoryFn<typeof Input> = () => {
  return (
    <SaltProvider density="low">
      <Input defaultValue="Low Density Input" style={{ width: "292px" }} />
    </SaltProvider>
  );
};

export const HighDensityInput: StoryFn<typeof Input> = () => {
  return (
    <SaltProvider density="high">
      <Input defaultValue="High Density Input" style={{ width: "292px" }} />
    </SaltProvider>
  );
};

export const Adornments: StoryFn<typeof Input> = (args) => {
  const styles = {
    input: {
      width: 292,
    },
  };

  const data = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Delaware",
    "Florida",
  ];

  const suffixData = ["KG", "lbs", "g"];

  return (
    <StackLayout gap={1}>
      <Input
        defaultValue="Prefix: Icon"
        style={styles.input}
        {...args}
        startAdornment={
          <StaticInputAdornment>
            <CallIcon />
          </StaticInputAdornment>
        }
      />
      <div style={{ height: "15px" }} />
      <Input
        defaultValue="Prefix: Text"
        style={styles.input}
        {...args}
        startAdornment={<StaticInputAdornment>+1</StaticInputAdornment>}
      />
      <div style={{ height: "15px" }} />
      <Input
        defaultValue="Suffix: Icon"
        style={styles.input}
        {...args}
        endAdornment={
          <StaticInputAdornment>
            <CalendarIcon />
          </StaticInputAdornment>
        }
      />
      <div style={{ height: "15px" }} />
      <Input
        defaultValue="Suffix: Text"
        style={styles.input}
        {...args}
        endAdornment={<StaticInputAdornment>KG</StaticInputAdornment>}
      />
      <div style={{ height: "15px" }} />
      <Input
        defaultValue="Suffix: Button"
        style={styles.input}
        {...args}
        endAdornment={
          <Button variant="secondary">
            <CloseIcon aria-label="clear input" />
          </Button>
        }
      />
      <div style={{ height: "15px" }} />
      <Input
        defaultValue="Prefix: Icon + Text"
        style={styles.input}
        {...args}
        startAdornment={
          <>
            <StaticInputAdornment>
              {/* Phone --> Call */}
              <CallIcon />
            </StaticInputAdornment>
            <StaticInputAdornment>+1</StaticInputAdornment>
          </>
        }
      />
      <div style={{ height: "15px" }} />
      <Input
        defaultValue="Prefix: Interactive Component"
        style={styles.input}
        {...args}
        startAdornment={
          <Dropdown defaultSelected={data[0]} source={data} width={90} />
        }
      />
      <div style={{ height: "15px" }} />
      <Input
        defaultValue="Suffix: Text + Button"
        style={styles.input}
        {...args}
        endAdornment={
          <>
            <StaticInputAdornment>KG</StaticInputAdornment>
            <Button variant="secondary">
              <CloseIcon aria-label="clear input" />
            </Button>
          </>
        }
      />
      <div style={{ height: "15px" }} />
      <Input
        defaultValue="Suffix: Interactive Component"
        style={styles.input}
        {...args}
        endAdornment={
          <Dropdown
            defaultSelected={suffixData[0]}
            source={suffixData}
            width={60}
          />
        }
      />
      <div style={{ height: "15px" }} />
      <Input
        defaultValue="Suffix: Button + Button"
        style={styles.input}
        {...args}
        endAdornment={
          <>
            <Button variant="secondary">
              <CloseIcon aria-label="clear input" />
            </Button>
            <Button variant="cta">
              <SendIcon />
            </Button>
          </>
        }
      />
      <div style={{ height: "15px" }} />
      <Input
        defaultValue={"Suffix: Static + Button\n\n"}
        style={styles.input}
        {...args}
        endAdornment={
          <>
            <StaticInputAdornment>0/100</StaticInputAdornment>
            <Button variant="primary">
              <SendIcon />
            </Button>
          </>
        }
        startAdornment={
          <StaticInputAdornment>
            <UserIcon />
          </StaticInputAdornment>
        }
      />
    </StackLayout>
  );
};
