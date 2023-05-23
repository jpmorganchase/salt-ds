import {
  Checkbox,
  CheckboxGroup,
  RadioButton,
  RadioButtonGroup,
  FlowLayout,
} from "@salt-ds/core";
import {
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
  FormFieldNext,
  InputNext,
} from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Form Field Next",
  component: FormFieldNext,
} as ComponentMeta<typeof FormFieldNext>;

export const Skeleton: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout>
      <FormFieldNext {...props}>
        <FormLabel>Form Field label</FormLabel>
        <FormHelperText>Helper text</FormHelperText>
      </FormFieldNext>
      <FormFieldNext labelPlacement="left" {...props}>
        <FormLabel>Form Field label</FormLabel>
        <FormHelperText>Helper text</FormHelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

export const Default: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext {...props}>
        <FormLabel>Form Field label</FormLabel>
        <InputNext defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

export const Disabled: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FormFieldNext style={{ width: "366px" }} disabled {...props}>
      <FormLabel>Disabled Form Field</FormLabel>
      <InputNext defaultValue="Primary Input value" />
      <FormHelperText>This field has been disabled</FormHelperText>
    </FormFieldNext>
  );
};

export const HelperText: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext {...props}>
        <FormLabel>Form Field label</FormLabel>
        <InputNext defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormFieldNext>
      <FormFieldNext {...props}>
        <FormLabel>Form Field label</FormLabel>
        <InputNext defaultValue="Primary Input value" />
        <FormHelperText>
          Helper text that's very long. Additional text to give further context
          to the input requirements.
        </FormHelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

export const Label: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext {...props}>
        <FormLabel>Form Field label top (default)</FormLabel>
        <InputNext defaultValue="Value" />
      </FormFieldNext>
      <FormFieldNext {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the next line.
        </FormLabel>
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
    </FlowLayout>
  );
};

export const LabelLeft: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext labelPlacement="left" {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <InputNext defaultValue="Value" />
      </FormFieldNext>
      <FormFieldNext labelPlacement="left" {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the next line.
        </FormLabel>
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
    </FlowLayout>
  );
};

/* TODO: These issues (in helper text) need consideration 

Commenting out as it's possible but not supported until V3
*/

// export const MultiInput: ComponentStory<typeof FormFieldNext> = (props) => {
//   return (
//     <FlowLayout style={{ width: "366px" }}>
//       <FormFieldNext {...props}>
//         <FormLabel>Paired fields</FormLabel>
//         <Controls>
//           <InputNext defaultValue="123" />
//           <InputNext defaultValue="35" />
//         </Controls>
//         <FormHelperText>
//           *User entry in either field will automatically populate the
//           corresponding field with the correct value
//         </FormHelperText>
//       </FormFieldNext>
//       <FormFieldNext {...props}>
//         <FormLabel>Multi criteria inputs</FormLabel>
//         <Controls>
//           <InputNext defaultValue="2.5" />
//           <InputNext defaultValue="750" />
//         </Controls>
//         <FormHelperText>
//           *User must enter all values in the string to complete the input
//         </FormHelperText>
//       </FormFieldNext>
//     </FlowLayout>
//   );
// };

export const Readonly: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FormFieldNext style={{ width: "366px" }} readOnly {...props}>
      <FormLabel>Readonly Form Field</FormLabel>
      <InputNext defaultValue="Primary Input value" />
      <FormHelperText>This Form Field is readonly</FormHelperText>
    </FormFieldNext>
  );
};

export const WithControls: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Checkbox label={"Checkbox"} />
        <FormHelperText>Helper text</FormHelperText>
      </FormFieldNext>
      <FormFieldNext {...props}>
        <FormLabel>Form Field label</FormLabel>
        <RadioButton label={"Radio Button"} />
        <FormHelperText>Helper text</FormHelperText>
      </FormFieldNext>
      <FormFieldNext {...props}>
        <FormLabel>Form Field label</FormLabel>
        <CheckboxGroup>
          <Checkbox label="Option 1" />
          <Checkbox defaultChecked label="Option 2" />
          <Checkbox label="Option 3" />
        </CheckboxGroup>
        <FormHelperText>Helper text</FormHelperText>
      </FormFieldNext>
      <FormFieldNext {...props}>
        <FormLabel>Form Field label</FormLabel>
        <RadioButtonGroup>
          <RadioButton key="option1" label="Radio Option 1" value="option1" />
          <RadioButton key="option2" label="Radio Option 2" value="option2" />
          <RadioButton key="option3" label="Radio Option 3" value="option3" />
        </RadioButtonGroup>
        <FormHelperText>Helper text</FormHelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

export const WithValidation: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext validationStatus="error" {...props}>
        <FormLabel>Error Form Field</FormLabel>
        <InputNext defaultValue="Input value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormFieldNext>
      <FormFieldNext validationStatus="warning" {...props}>
        <FormLabel>Warning Form Field</FormLabel>
        <InputNext defaultValue="Input value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormFieldNext>
      <FormFieldNext validationStatus="success" {...props}>
        <FormLabel>Success Form Field</FormLabel>
        <InputNext defaultValue="Input value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormFieldNext>
      {/* TODO: Guidance to explain that the following would produce broken design/behaviour
      
      
      Error readOnly Input
      <FormFieldNext
        validationStatus="error"
        label="Form Field label"
        helperText="Helper text"
        {...props}
      >
        <InputNext readOnly defaultValue="Input value" />
      </FormFieldNext>
      Warning disabled Input
      <FormFieldNext
        validationStatus="warning"
        label="Form Field label"
        helperText="Helper text"
        {...props}
      >
        <InputNext disabled defaultValue="Input value" />
      </FormFieldNext> */}
    </FlowLayout>
  );
};
