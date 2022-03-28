import { ToolkitProvider } from "@brandname/core";
import { Input } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import { BackgroundBlock } from "docs/components/BackgroundBlock";
import { Adornments } from "./input.stories";
import "./input.qa.stories.css";

export default {
  title: "Lab/Input/QA",
  component: Input,
} as ComponentMeta<typeof Input>;

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

const ReadOnly: ComponentStory<typeof Input> = () => {
  return (
    <Input
      defaultValue={"Read Only Input"} // Read Only isn't currently a prop
      readOnly
      style={{ width: "292px" }}
    />
  );
};

export const AllVariantsGrid: ComponentStory<typeof Input> = (props) => {
  return (
    <>
      <AllRenderer>
        <div
          style={{
            background: "inherit",
            display: "inline-grid",
            gridTemplate: "auto / repeat(3,auto)",
            gap: "4px",
          }}
        >
          <Default />
          <Disabled />
          <ReadOnly />
        </div>
      </AllRenderer>
      <div
        style={{
          background: "inherit",
          display: "inline-grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px",
        }}
      >
        <ToolkitProvider theme={"light"}>
          <BackgroundBlock>
            <div>
              <Adornments />
            </div>
          </BackgroundBlock>
        </ToolkitProvider>
        <ToolkitProvider theme={"dark"}>
          <BackgroundBlock>
            <div>
              <Adornments />
            </div>
          </BackgroundBlock>
        </ToolkitProvider>
      </div>
    </>
  );
};

export const CompareWithOriginalToolkit: ComponentStory<typeof Input> = (
  props
) => {
  return (
    <QAContainer
      className="uitkInputQA"
      imgSrc="/visual-regression-screenshots/Input-vr-snapshot.png"
      width={2272}
      height={2000}
    >
      <AllVariantsGrid />
    </QAContainer>
  );
};
