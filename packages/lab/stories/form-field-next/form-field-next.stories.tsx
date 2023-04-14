import { Checkbox, GridLayout, RadioButton, RadioButtonGroup } from "@salt-ds/core";
import { Dropdown, FormFieldNext, Input } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Form Field Next",
  component: FormFieldNext,
} as ComponentMeta<typeof FormFieldNext>;

export const Default: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <>
      <FormFieldNext
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <Input defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        labelPlacement="left"
        label="Default Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <Input defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        label="Default Form Field label"
        {...props}
      >
        <Input defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        label="Default Form Field label"
        {...props}
      >
        <Input variant="secondary" defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        labelPlacement="left"
        label="Default Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <Input variant="secondary" defaultValue="Value" />
      </FormFieldNext>
    </>
  );
};


export const WithControls: ComponentStory<typeof FormFieldNext> = (props) => {
    return (
      <>
        <FormFieldNext
          helperText="Default helper text"
          label="Default Form Field label"
          {...props}
        >
          <Input defaultValue="Value" />
          <Checkbox label={"Checkbox"} />
          <RadioButton label={"Radio Button"} />
        </FormFieldNext>
      <div style={{ height: 40 }} />
        <FormFieldNext
          labelPlacement="left"
          helperText="Default helper text"
          label="Default Form Field label"
          {...props}
        >
          <Input variant="secondary" defaultValue="Value" />
          <Input variant="secondary" defaultValue="Value 2" />
        </FormFieldNext>
      <div style={{ height: 40 }} />
        <FormFieldNext
          helperText="Default helper text"
          label="Default Form Field label"
          {...props}
        >
        <RadioButtonGroup>
          <RadioButton key="option1" label="Radio Option 1" value="option1" />
          <RadioButton key="option2" label="Radio Option 2" value="option2" />
          <RadioButton key="option3" label="Radio Option 3" value="option3" />
        </RadioButtonGroup>
        </FormFieldNext>
      </>
    );
  };

/* TODO: These issues (in helper text) need consideration */

export const MultiInput: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <div style={{width: "366px"}}>
      <div style={{ height: 16 }} />
      <FormFieldNext
        label="Paired fields"
        helperText="*User entry in either field will automatically poluate the corresponding field with the correct value"
        {...props}
      >
        <Input variant="secondary" defaultValue="123" />
        <Input variant="secondary" defaultValue="35" />
      </FormFieldNext>
      <div style={{ height: 16 }} />
      <FormFieldNext
        label="Multi criteria inputs"
        helperText="*User must enter all values in the string to complete the input"
        {...props}
      >
        <Input variant="secondary" defaultValue="2.5" />
        <Dropdown variant="secondary" source={["From","To"]} defaultSelected="From" />
        <Input variant="secondary" defaultValue="750" />
      </FormFieldNext>
    </div>
  );
};

// COMING V2
// 
// export const Validation: ComponentStory<typeof FormFieldNext> = (props) => {
//   return (
//     <div style={{width: "366px"}}>
//       <div style={{ height: 16 }} />
//       <FormFieldNext
//         label="Default Form Field label"
//         state="error"
//         helperText="Default helper text"
//         {...props}
//       >
//         <Input variant="secondary" defaultValue="123" />
//       </FormFieldNext>
//       <div style={{ height: 16 }} />
//       <FormFieldNext
//         label="Default Form Field label"
//         state="warning"
//         helperText="Default helper text"
//         {...props}
//       >
//         <Input variant="secondary" defaultValue="123" />
//       </FormFieldNext>
//     </div>
//   );
// };

export const Example: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <GridLayout >
      <FormFieldNext
        labelPlacement="left"
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <Input defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 16 }} />
      <FormFieldNext
        labelPlacement="left"
        helperText="Default helper text text text"
        label="Default Form Field label label label"
        {...props}
      >
        <Input defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 16 }} />
      <FormFieldNext
        labelPlacement="left"
        helperText="Default helper text text text text"
        label="Default Form Field label label label label label label"
        {...props}
      >
        <Input defaultValue="Value" />
      </FormFieldNext>
    </GridLayout>
  );
};