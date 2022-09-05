import { Button, Input, InputStaticAdornment } from "@jpmorganchase/uitk-core";
import {
  CalendarIcon,
  CallIcon,
  CloseIcon,
  SendIcon,
  UserIcon,
} from "@jpmorganchase/uitk-icons";
import { Dropdown } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

import "./input.qa.stories.css";

export default {
  title: "Core/Input/QA",
  component: Input,
} as ComponentMeta<typeof Input>;

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
  <Input
    data-jpmui-test="input-example"
    defaultValue="Value"
    style={{ width: "292px" }}
  />
);

const Disabled = () => (
  <Input
    data-jpmui-test="input-example"
    defaultValue="Disabled"
    disabled
    style={{ width: "292px" }}
  />
);

const ReadOnly = () => {
  return (
    <Input
      defaultValue={"Read Only Input"} // Read Only isn't currently a prop
      readOnly
      style={{ width: "292px" }}
    />
  );
};

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={2} height={1300} itemPadding={6} width={1400} {...props}>
      <Default />
      <Disabled />
      <ReadOnly />
      <Input
        defaultValue="Prefix: Icon"
        startAdornment={
          <InputStaticAdornment>
            <CallIcon />
          </InputStaticAdornment>
        }
      />
      <Input
        defaultValue="Prefix: Text"
        startAdornment={<InputStaticAdornment>+1</InputStaticAdornment>}
      />
      <Input
        defaultValue="Suffix: Icon"
        endAdornment={
          <InputStaticAdornment>
            <CalendarIcon size="small" />
          </InputStaticAdornment>
        }
      />
      <Input
        defaultValue="Suffix: Text"
        endAdornment={<InputStaticAdornment>KG</InputStaticAdornment>}
      />
      <Input
        defaultValue="Suffix: Button"
        endAdornment={
          <Button variant="secondary">
            <CloseIcon aria-label="clear input" size="small" />
          </Button>
        }
      />
      <Input
        defaultValue="Prefix: Icon + Text"
        startAdornment={
          <>
            <InputStaticAdornment>
              {/* Phone --> Call */}
              <CallIcon size="small" />
            </InputStaticAdornment>
            <InputStaticAdornment>+1</InputStaticAdornment>
          </>
        }
      />
      <Input
        defaultValue="Prefix: Interactive Component"
        startAdornment={
          <Dropdown defaultSelected={data[0]} source={data} width={90} />
        }
      />
      <Input
        defaultValue="Suffix: Text + Button"
        endAdornment={
          <>
            <InputStaticAdornment>KG</InputStaticAdornment>
            <Button variant="secondary">
              <CloseIcon aria-label="clear input" size="small" />
            </Button>
          </>
        }
      />
      <Input
        defaultValue="Suffix: Interactive Component"
        endAdornment={
          <Dropdown
            defaultSelected={suffixData[0]}
            source={suffixData}
            width={60}
          />
        }
      />
      <Input
        defaultValue="Suffix: Button + Button"
        endAdornment={
          <>
            <Button variant="secondary">
              <CloseIcon aria-label="clear input" size="small" />
            </Button>
            <Button variant="cta">
              <SendIcon size="small" />
            </Button>
          </>
        }
      />
      <Input
        defaultValue={"Suffix: Static + Button\n\n"}
        endAdornment={
          <>
            <InputStaticAdornment>0/100</InputStaticAdornment>
            <Button variant="primary">
              <SendIcon size="small" />
            </Button>
          </>
        }
        startAdornment={
          <InputStaticAdornment>
            <UserIcon size="small" />
          </InputStaticAdornment>
        }
      />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <AllExamplesGrid imgSrc="/visual-regression-screenshots/Input-vr-snapshot.png" />
  );
};
