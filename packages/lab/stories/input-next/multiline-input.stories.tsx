import { FlowLayout } from "@salt-ds/core";
import { MultilineInput } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Input Next",
  component: MultilineInput,
} as ComponentMeta<typeof MultilineInput>;

export const Multiline: ComponentStory<typeof MultilineInput> = (args) => {
  return  (
  <FlowLayout style={{width: "366px"}}>
    <MultilineInput defaultValue="Value"  />
    <MultilineInput variant="secondary" defaultValue="Value"  />
  </FlowLayout>
  );
};

export const MultilineFullBorder: ComponentStory<typeof MultilineInput> = (args) => {
    return <MultilineInput fullBorder defaultValue="Value"  />;
  };
  
export const MultilineValidationStates: ComponentStory<typeof MultilineInput> = (args) => {
    return (
        <FlowLayout style={{width: "366px"}}>
        <MultilineInput validationStatus="error" defaultValue="Value"  />
            <MultilineInput fullBorder validationStatus="error" defaultValue="Value"  />
            <MultilineInput validationStatus="warning" defaultValue="Value"  />
            <MultilineInput fullBorder validationStatus="warning" defaultValue="Value"  />
            <MultilineInput validationStatus="success" defaultValue="Value"  />
            <MultilineInput fullBorder validationStatus="success" defaultValue="Value"  />
        </FlowLayout>
    );
  };
  