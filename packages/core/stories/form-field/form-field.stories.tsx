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
  Tooltip,
  AdornmentButton,
  Text,
} from "@salt-ds/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { NoteIcon, InfoIcon } from "@salt-ds/icons";
import { ChangeEventHandler, useState } from "react";

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

export const HideFocusRing: ComponentStory<typeof FormField> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField style={{ width: "366px" }} focusVisible={false} {...props}>
        <FormLabel>Form Field</FormLabel>
        <Input defaultValue="Input value" />
      </FormField>
      <FormField style={{ width: "366px" }} focusVisible={false} {...props}>
        <FormLabel>Form Field</FormLabel>
        <Checkbox label="Option" />
      </FormField>
      <FormField style={{ width: "366px" }} focusVisible={false} {...props}>
        <FormLabel>Form Field</FormLabel>
        <RadioButton label="Option" />
      </FormField>
    </FlowLayout>
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

export const HelperTextAsTooltip: ComponentStory<typeof FormField> = (
  props
) => {
  return (
    <FormField {...props}>
      <FormLabel>Form Field label</FormLabel>
      <Tooltip content="Helper text">
        <Input defaultValue="Value" />
      </Tooltip>
    </FormField>
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

const radioData = [
  {
    label: "Ultimate Parent",
    value: "parent",
  },
  {
    label: "Subsidary",
    value: "subsidary",
  },
];

const checkboxesData = [
  {
    label: "Discretionary fee",
    value: "discretionary",
  },
  {
    label: "Retainer fee",
    value: "retainer",
  },
  {
    disabled: true,
    label: "Other fee",
    value: "other",
  },
];

export const WithControls: ComponentStory<typeof FormField> = (props) => {
  const [isRadioError, setIsRadioError] = useState(true);

  const [radioGroupValue, setRadioGroupValue] = useState("");
  const [checkboxGroupValue, setCheckboxGroupValue] = useState<string[]>([]);

  const handleRadioChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setRadioGroupValue(value);
    props.onChange?.(event);
    isRadioError && setIsRadioError(false);
  };

  const handleCheckboxChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const { value } = event.target;
    if (checkboxGroupValue.indexOf(value) === -1) {
      setCheckboxGroupValue((prevControlledValues) => [
        ...prevControlledValues,
        value,
      ]);
    } else {
      setCheckboxGroupValue((prevControlledValues) =>
        prevControlledValues.filter(
          (controlledValue) => controlledValue !== value
        )
      );
    }
    props.onChange?.(event);
  };

  const isCheckboxError = checkboxGroupValue.length === 0;

  return (
    <FlowLayout style={{ width: "466px" }}>
      <FormField {...props}>
        <FormLabel>Client directed request</FormLabel>
        <RadioButtonGroup direction="horizontal">
          <RadioButton key="option1" label="Yes" value="yes" />
          <RadioButton key="option2" label="No" value="no" />
        </RadioButtonGroup>
      </FormField>
      <FormField {...props}>
        <FormLabel>Assignment</FormLabel>
        <CheckboxGroup>
          <Checkbox label="Private placement of equity or debt securities" />
          <Checkbox defaultChecked label="Syndicated credit facility or loan" />
          <Checkbox label="Interest rate, foreign exchange or commodity hedging or equity derivative" />
          <Checkbox label="Escrow arrangement" />
          <Checkbox label="Restructuring of debt securities of the Counterparty or the Company" />
        </CheckboxGroup>
        <FormHelperText>Select all appropriate</FormHelperText>
      </FormField>
      <FormField
        validationStatus={isRadioError ? "error" : undefined}
        {...props}
      >
        <FormLabel>Deal owner</FormLabel>
        <RadioButtonGroup onChange={handleRadioChange} value={radioGroupValue}>
          {radioData.map((radio) => {
            return (
              <RadioButton
                key={radio.label}
                label={radio.label}
                value={radio.value}
              />
            );
          })}
        </RadioButtonGroup>
        <FormHelperText>{`${
          isRadioError ? "Must select one option. " : ""
        }Is this deal for the ultimate parent or a subsidiary?`}</FormHelperText>
      </FormField>
      <FormField
        validationStatus={isCheckboxError ? "error" : undefined}
        {...props}
      >
        <FormLabel>Fee type</FormLabel>
        <CheckboxGroup
          checkedValues={checkboxGroupValue}
          onChange={handleCheckboxChange}
        >
          {checkboxesData.map((data) => (
            <Checkbox key={data.value} {...data} />
          ))}
        </CheckboxGroup>
        <FormHelperText>{`${
          isCheckboxError ? "Must select at least one option. " : ""
        }`}</FormHelperText>
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

      <FormField validationStatus="error" {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Tooltip content="Helper text indicating error">
          <Input defaultValue="Value" />
        </Tooltip>
      </FormField>
      <FormField validationStatus="warning" {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Tooltip content="Helper text indicating warning">
          <Input defaultValue="Value" />
        </Tooltip>
      </FormField>
      <FormField validationStatus="success" {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Tooltip content="Helper text indicating success">
          <Input defaultValue="Value" />
        </Tooltip>
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

export const WithInputWithAdornments: ComponentStory<typeof FormField> = (
  props
) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input
          startAdornment={<Text>$</Text>}
          endAdornment={
            <AdornmentButton>
              <NoteIcon />
            </AdornmentButton>
          }
          defaultValue={"Value"}
        />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input
          startAdornment={
            <AdornmentButton>
              <InfoIcon />
            </AdornmentButton>
          }
          endAdornment={
            <>
              <Text>%</Text>
              <AdornmentButton variant="cta">
                <NoteIcon />
              </AdornmentButton>
            </>
          }
          defaultValue={"Value"}
        />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField validationStatus="error" {...props}>
        <FormLabel>Form Field label (with error)</FormLabel>
        <Input
          endAdornment={
            <AdornmentButton variant="secondary">
              <NoteIcon />
            </AdornmentButton>
          }
          defaultValue={"Value"}
        />
      </FormField>
      <FormField disabled {...props}>
        <FormLabel>Form Field label (disabled)</FormLabel>
        <Input
          startAdornment={
            <AdornmentButton>
              <InfoIcon />
            </AdornmentButton>
          }
          endAdornment={
            <>
              <Text>%</Text>
              <AdornmentButton variant="cta">
                <NoteIcon />
              </AdornmentButton>
            </>
          }
          defaultValue={"Value"}
        />
      </FormField>
    </FlowLayout>
  );
};
