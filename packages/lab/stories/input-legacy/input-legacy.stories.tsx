// TODO revisit when:
//  - multiline is implemented for Input
import { Button, SaltProvider } from "@salt-ds/core";
import {
  CalendarIcon,
  CallIcon,
  CloseIcon,
  SendIcon,
  UserIcon,
} from "@salt-ds/icons";
import {
  Dropdown,
  FormField,
  Input as InputLegacy,
  StaticInputAdornment,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Input Legacy",
  component: InputLegacy,
} as Meta<typeof InputLegacy>;

const Template: StoryFn<typeof InputLegacy> = (args) => {
  // let text;
  // if (args.multiline) {
  //   text =
  //     "This is a Multiline Input with text which wraps onto more than one line.";
  // } else {
  //  text= "Value"
  // }

  return (
    <InputLegacy
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

export const ReadOnly: StoryFn<typeof InputLegacy> = () => {
  return (
    <>
      <InputLegacy
        defaultValue={"Read Only Input"} // Read Only isn't currently a prop
        readOnly
        style={{ width: "292px" }}
      />
      <div style={{ height: "15px" }} />
      <InputLegacy readOnly style={{ width: "292px" }} />
    </>
  );
};

export const WithFormField: StoryFn<typeof InputLegacy> = () => {
  return (
    <FormField label="ADA compliant label" style={{ width: 292 }}>
      <InputLegacy defaultValue="Value" />
    </FormField>
  );
};

export const WithFormFieldNoInitialValue: StoryFn<typeof InputLegacy> = () => {
  return (
    <FormField label="ADA compliant label" style={{ width: 292 }}>
      <InputLegacy />
    </FormField>
  );
};

export const Spellcheck: StoryFn<typeof InputLegacy> = () => {
  return (
    <InputLegacy
      defaultValue="This is a comment. It contains several sentences, with words spelt correctly or incorectly. Click to see Spellcheck take effect."
      style={{ width: "292px" }}
      inputProps={{ spellCheck: true }}
    />
  );
};

export const TouchDensityInput: StoryFn<typeof InputLegacy> = () => {
  return (
    <SaltProvider density="touch">
      <InputLegacy
        defaultValue="Touch Density Input"
        style={{ width: "292px" }}
      />
    </SaltProvider>
  );
};

export const LowDensityInput: StoryFn<typeof InputLegacy> = () => {
  return (
    <SaltProvider density="low">
      <InputLegacy
        defaultValue="Low Density Input"
        style={{ width: "292px" }}
      />
    </SaltProvider>
  );
};

export const HighDensityInput: StoryFn<typeof InputLegacy> = () => {
  return (
    <SaltProvider density="high">
      <InputLegacy
        defaultValue="High Density Input"
        style={{ width: "292px" }}
      />
    </SaltProvider>
  );
};

export const Adornments: StoryFn<typeof InputLegacy> = (args) => {
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
    <>
      <InputLegacy
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
      <InputLegacy
        defaultValue="Prefix: Text"
        style={styles.input}
        {...args}
        startAdornment={<StaticInputAdornment>+1</StaticInputAdornment>}
      />
      <div style={{ height: "15px" }} />
      <InputLegacy
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
      <InputLegacy
        defaultValue="Suffix: Text"
        style={styles.input}
        {...args}
        endAdornment={<StaticInputAdornment>KG</StaticInputAdornment>}
      />
      <div style={{ height: "15px" }} />
      <InputLegacy
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
      <InputLegacy
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
      <InputLegacy
        defaultValue="Prefix: Interactive Component"
        style={styles.input}
        {...args}
        startAdornment={
          <Dropdown defaultSelected={data[0]} source={data} width={90} />
        }
      />
      <div style={{ height: "15px" }} />
      <InputLegacy
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
      <InputLegacy
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
      <InputLegacy
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
      <InputLegacy
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
    </>
  );
};
