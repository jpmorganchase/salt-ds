import { Button } from "@salt-ds/core";
import {
  CalendarIcon,
  CallIcon,
  CloseIcon,
  SendIcon,
  UserIcon,
} from "@salt-ds/icons";
import {
  Dropdown,
  Input as InputLegacy,
  StaticInputAdornment,
} from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Input Legacy/QA",
  component: InputLegacy,
} as Meta<typeof InputLegacy>;

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

const Default = () => (
  <InputLegacy
    data-jpmui-test="input-example"
    defaultValue="Value"
    style={{ width: "292px" }}
  />
);

const Disabled = () => (
  <InputLegacy
    data-jpmui-test="input-example"
    defaultValue="Disabled"
    disabled
    style={{ width: "292px" }}
  />
);

const ReadOnly = () => {
  return (
    <InputLegacy
      defaultValue={"Read Only Input"} // Read Only isn't currently a prop
      readOnly
      style={{ width: "292px" }}
    />
  );
};

export const AllExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={2} height={1300} itemPadding={6} width={1400} {...props}>
      <Default />
      <Disabled />
      <ReadOnly />
      <InputLegacy
        defaultValue="Prefix: Icon"
        startAdornment={
          <StaticInputAdornment>
            <CallIcon />
          </StaticInputAdornment>
        }
      />
      <InputLegacy
        defaultValue="Prefix: Text"
        startAdornment={<StaticInputAdornment>+1</StaticInputAdornment>}
      />
      <InputLegacy
        defaultValue="Suffix: Icon"
        endAdornment={
          <StaticInputAdornment>
            <CalendarIcon />
          </StaticInputAdornment>
        }
      />
      <InputLegacy
        defaultValue="Suffix: Text"
        endAdornment={<StaticInputAdornment>KG</StaticInputAdornment>}
      />
      <InputLegacy
        defaultValue="Suffix: Button"
        endAdornment={
          <Button variant="secondary">
            <CloseIcon aria-label="clear input" />
          </Button>
        }
      />
      <InputLegacy
        defaultValue="Prefix: Icon + Text"
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
      <InputLegacy
        defaultValue="Prefix: Interactive Component"
        startAdornment={
          <Dropdown defaultSelected={data[0]} source={data} width={90} />
        }
      />
      <InputLegacy
        defaultValue="Suffix: Text + Button"
        endAdornment={
          <>
            <StaticInputAdornment>KG</StaticInputAdornment>
            <Button variant="secondary">
              <CloseIcon aria-label="clear input" />
            </Button>
          </>
        }
      />
      <InputLegacy
        defaultValue="Suffix: Interactive Component"
        endAdornment={
          <Dropdown
            defaultSelected={suffixData[0]}
            source={suffixData}
            width={60}
          />
        }
      />
      <InputLegacy
        defaultValue="Suffix: Button + Button"
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
      <InputLegacy
        defaultValue={"Suffix: Static + Button\n\n"}
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
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
