import {
  Checkbox,
  CheckboxGroup,
  RadioButton,
  RadioButtonGroup,
  FlowLayout,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
  FormField,
  Input,
} from "@salt-ds/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Core/Form Field",
  component: FormField,
} as ComponentMeta<typeof FormField>;

export const Skeleton: ComponentStory<typeof FormField> = (props) => {
  return (
    <FlowLayout>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>Form Field label</FormLabel>
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
    </FlowLayout>
  );
};

export const Default: ComponentStory<typeof FormField> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
    </FlowLayout>
  );
};

export const Disabled: ComponentStory<typeof FormField> = (props) => {
  return (
    <FormField style={{ width: "366px" }} disabled {...props}>
      <FormLabel>Disabled Form Field</FormLabel>
      <Input defaultValue="Primary Input value" />
      <FormHelperText>This field has been disabled</FormHelperText>
    </FormField>
  );
};

export const HelperText: ComponentStory<typeof FormField> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Primary Input value" />
        <FormHelperText>
          Helper text that's very long. Additional text to give further context
          to the input requirements.
        </FormHelperText>
      </FormField>
    </FlowLayout>
  );
};

export const Label: ComponentStory<typeof FormField> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField {...props}>
        <FormLabel>Form Field label top (default)</FormLabel>
        <Input defaultValue="Value" />
      </FormField>
      <FormField {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormLabel>
        <Input defaultValue="Primary Input value" />
      </FormField>
    </FlowLayout>
  );
};

export const LabelLeft: ComponentStory<typeof FormField> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
      </FormField>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormLabel>
        <Input defaultValue="Primary Input value" />
      </FormField>
    </FlowLayout>
  );
};

/* TODO: These issues (in helper text) need consideration 

Commenting out as it's possible but not supported until V3
*/

// export const MultiInput: ComponentStory<typeof FormField> = (props) => {
//   return (
//     <FlowLayout style={{ width: "366px" }}>
//       <FormField {...props}>
//         <FormLabel>Paired fields</FormLabel>
//         <Controls>
//           <Input defaultValue="123" />
//           <Input defaultValue="35" />
//         </Controls>
//         <FormHelperText>
//           *User entry in either field will automatically populate the
//           corresponding field with the correct value
//         </FormHelperText>
//       </FormField>
//       <FormField {...props}>
//         <FormLabel>Multi criteria inputs</FormLabel>
//         <Controls>
//           <Input defaultValue="2.5" />
//           <Input defaultValue="750" />
//         </Controls>
//         <FormHelperText>
//           *User must enter all values in the string to complete the input
//         </FormHelperText>
//       </FormField>
//     </FlowLayout>
//   );
// };

export const Readonly: ComponentStory<typeof FormField> = (props) => {
  return (
    <FormField style={{ width: "366px" }} readOnly {...props}>
      <FormLabel>Readonly Form Field</FormLabel>
      <Input defaultValue="Primary Input value" />
      <FormHelperText>This Form Field is readonly</FormHelperText>
    </FormField>
  );
};

export const WithControls: ComponentStory<typeof FormField> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Checkbox label={"Checkbox"} />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <RadioButton label={"Radio Button"} />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <CheckboxGroup>
          <Checkbox label="Option 1" />
          <Checkbox defaultChecked label="Option 2" />
          <Checkbox label="Option 3" />
        </CheckboxGroup>
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <RadioButtonGroup>
          <RadioButton key="option1" label="Radio Option 1" value="option1" />
          <RadioButton key="option2" label="Radio Option 2" value="option2" />
          <RadioButton key="option3" label="Radio Option 3" value="option3" />
        </RadioButtonGroup>
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
    </FlowLayout>
  );
};

export const WithValidation: ComponentStory<typeof FormField> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField validationStatus="error" {...props}>
        <FormLabel>Error Form Field</FormLabel>
        <Input defaultValue="Input value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField validationStatus="warning" {...props}>
        <FormLabel>Warning Form Field</FormLabel>
        <Input defaultValue="Input value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField validationStatus="success" {...props}>
        <FormLabel>Success Form Field</FormLabel>
        <Input defaultValue="Input value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      {/* TODO: Guidance to explain that the following would produce broken design/behaviour
      
      
      Error readOnly Input
      <FormField
        validationStatus="error"
        label="Form Field label"
        helperText="Helper text"
        {...props}
      >
        <Input readOnly defaultValue="Input value" />
      </FormField>
      Warning disabled Input
      <FormField
        validationStatus="warning"
        label="Form Field label"
        helperText="Helper text"
        {...props}
      >
        <Input disabled defaultValue="Input value" />
      </FormField> */}
    </FlowLayout>
  );
};
