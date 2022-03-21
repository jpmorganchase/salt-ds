import { Density, ToolkitProvider } from "@brandname/core";
import { Input, Panel } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { QAContainer } from "docs/components";
import { ReactNode } from "react";
import "./input.qa.stories.css";

export default {
  title: "Lab/Input/QA",
  component: Input,
} as ComponentMeta<typeof Input>;

const Default = () => (
  <Input data-jpmui-test="input-example" defaultValue="Value" />
);

interface ExampleRowProps {
  children: ReactNode;
  name: string;
}

const ExampleRow: React.FC<ExampleRowProps> = ({ children, name }) => {
  const densities: Density[] = ["touch", "low", "medium", "high"];
  return (
    <Panel>
      <h3>{name}</h3>
      <div className="uitkInputQA">
        {densities.map((density) => (
          <ToolkitProvider density={density}>{children}</ToolkitProvider>
        ))}
      </div>
    </Panel>
  );
};

const Disabled = () => (
  <Input
    data-jpmui-test="input-example"
    defaultValue="Value"
    disabled
    style={{ width: "292px" }}
  />
);

const ReadOnly = () => (
  <>
    <Input
      data-jpmui-test="input-example"
      defaultValue="Read Only Input"
      readOnly
      style={{ width: 292 }}
    />
  </>
);

const Examples = () => (
  <>
    <ExampleRow name="Default">
      <Default />
    </ExampleRow>
    <ExampleRow name="Disabled">
      <Disabled />
    </ExampleRow>
    <ExampleRow name="ReadOnly">
      <ReadOnly />
    </ExampleRow>
  </>
);

export const CompareWithOriginalToolkit: ComponentStory<typeof Input> = (
  props
) => {
  return (
    <QAContainer
      className="uitkInputQA"
      imgSrc="/visual-regression-screenshots/Input-vr-snapshot.png"
    >
      <ToolkitProvider theme={"light"}>
        <Examples />
      </ToolkitProvider>
      <ToolkitProvider theme={"dark"}>
        <Examples />
      </ToolkitProvider>
    </QAContainer>
  );
};
