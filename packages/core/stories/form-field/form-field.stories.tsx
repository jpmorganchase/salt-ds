import {
  Button,
  Checkbox,
  CheckboxGroup,
  FlowLayout,
  FormField,
  FormFieldHelperText,
  type FormFieldLabelPlacement,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
  GridLayout,
  Input,
  type InputProps,
  MultilineInput,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Switch,
  Text,
  Tooltip,
  FormFieldLabel,
} from "@salt-ds/core";
import { InfoIcon, NoteIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type ChangeEventHandler,
  type CSSProperties,
  useState,
} from "react";
import "./form-field.stories.css";

export default {
  title: "Core/Form Field",
  component: FormField,
} as Meta<typeof FormField>;

export const Skeleton: StoryFn<typeof FormField> = (props) => {
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

export const Default: StoryFn<typeof FormField> = (props) => {
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

export const Disabled: StoryFn<typeof FormField> = (props) => {
  return (
    <FormField style={{ width: "366px" }} disabled {...props}>
      <FormLabel>Disabled Form Field</FormLabel>
      <Input defaultValue="Primary Input value" />
      <FormHelperText>This field has been disabled</FormHelperText>
    </FormField>
  );
};

export const HelperText: StoryFn<typeof FormField> = (props) => {
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

export const HelperTextAsTooltip: StoryFn<typeof FormField> = (props) => {
  return (
    <FormField {...props}>
      <FormLabel>Form Field label</FormLabel>
      <Tooltip content="Helper text">
        <Input defaultValue="Value" />
      </Tooltip>
    </FormField>
  );
};

export const Label: StoryFn<typeof FormField> = (props) => {
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

export const LabelLeft: StoryFn<typeof FormField> = (props) => {
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

export const LabelLeftWithControls: StoryFn<typeof FormField> = (props) => {
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
    event,
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
          (controlledValue) => controlledValue !== value,
        ),
      );
    }
    props.onChange?.(event);
  };

  const isCheckboxError = checkboxGroupValue.length === 0;

  return (
    <FlowLayout style={{ width: "466px" }}>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>Client directed request</FormLabel>
        <RadioButtonGroup direction="horizontal">
          <RadioButton key="option1" label="Yes" value="yes" />
          <RadioButton key="option2" label="No" value="no" />
        </RadioButtonGroup>
      </FormField>
      <FormField labelPlacement="left" {...props}>
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
        labelPlacement="left"
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
        labelPlacement="left"
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
      <FormField labelPlacement="left" {...props}>
        <FormLabel>Draft</FormLabel>
        <Switch />
        <FormHelperText>
          Saves changes immediately when not a draft
        </FormHelperText>
      </FormField>
    </FlowLayout>
  );
};

export const LabelQuestion: StoryFn<typeof FormField> = (props) => {
  return (
    <FormField {...props}>
      <FormLabel intent="sentence">
        Do your current qualifications align with the role? Please describe.
      </FormLabel>
      <MultilineInput bordered defaultValue="Answer" />
    </FormField>
  );
};

export const MultipleChildren: StoryFn<typeof FormField> = (props) => {
  const [firstValue, setFirstValue] = useState("Five");
  const [secondValue, setSecondValue] = useState("");

  const valid = firstValue.length && secondValue.length;

  const [values, setValues] = useState({
    firstValue: "3",
    secondValue: "4.5",
  });

  const handleUpdate = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    let update = values;
    const value = e.target.value;

    if (Number.parseFloat(value)) {
      if (index === 0) {
        update = {
          firstValue: value,
          secondValue: (Number.parseFloat(value) * 1.5).toString(),
        };
      } else {
        update = {
          firstValue: ((Number.parseFloat(value) * 2) / 3).toString(),
          secondValue: value,
        };
      }
      setValues(update);
    }

    if (value.length === 0) {
      if (index === 0) {
        update = {
          ...values,
          firstValue: value,
        };
      } else {
        update = {
          ...values,
          secondValue: value,
        };
      }
      setValues(update);
    }
  };

  const [checked, setChecked] = useState(false);

  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField validationStatus={valid ? undefined : "error"} {...props}>
        <FormLabel>Multi criteria inputs</FormLabel>
        <StackLayout gap={1} direction={"row"} role="group">
          <Input
            value={firstValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFirstValue(e.target.value);
            }}
          />
          <Input
            value={secondValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSecondValue(e.target.value);
            }}
            placeholder="Multiplier"
          />
        </StackLayout>
        <FormHelperText>
          * User must enter all values to complete the input
        </FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Paired fields</FormLabel>
        <StackLayout gap={1} direction={"row"} role="group">
          <Input
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleUpdate(e, 0)}
            value={values.firstValue}
          />
          <Input
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleUpdate(e, 1)}
            value={values.secondValue}
          />
        </StackLayout>
        <FormHelperText>
          * User entry in either field will automatically populate the
          corresponding field with the correct value
        </FormHelperText>
      </FormField>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>Multi inputs with left label</FormLabel>
        <StackLayout gap={1} direction={"row"} role="group">
          <Input placeholder="First value" />
          <Input placeholder="Second value" />
          <Input placeholder="Third value" />
        </StackLayout>
      </FormField>
      <FormField {...props}>
        <FormLabel>Multi inputs with secondary variant</FormLabel>
        <StackLayout gap={1} direction={"row"} role="group">
          <Input variant="secondary" placeholder="First value" />
          <Input variant="secondary" placeholder="Second value" />
        </StackLayout>
      </FormField>
      <FormField {...props}>
        <FormLabel>Multi controls</FormLabel>
        <StackLayout
          gap={1}
          direction={"row"}
          as="fieldset"
          style={{ margin: "0px", border: "none", padding: "0px" }}
        >
          <Input disabled={checked} placeholder="Transition impact" />
          <Checkbox
            checked={checked}
            onChange={() => setChecked(!checked)}
            label="Transition impact not applicable"
          />
        </StackLayout>
      </FormField>
    </FlowLayout>
  );
};

export const Readonly: StoryFn<typeof FormField> = (props) => {
  return (
    <StackLayout>
      <FormField style={{ width: "366px" }} readOnly {...props}>
        <FormLabel>Readonly Form Field</FormLabel>
        <Input defaultValue="Primary Input value" />
        <FormHelperText>This Form Field is readonly</FormHelperText>
      </FormField>
      <FormField style={{ width: "366px" }} readOnly {...props}>
        <FormLabel>Readonly multiline input</FormLabel>
        <MultilineInput defaultValue="Input value" />
        <FormHelperText>This Form Field is readonly</FormHelperText>
      </FormField>
    </StackLayout>
  );
};

export const NecessityLabel: StoryFn<typeof FormField> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField necessity="optional" {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Input value" />
      </FormField>
      <FormField necessity="required" {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Input value" />
      </FormField>
      <FormField necessity="asterisk" {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Input value" />
      </FormField>
    </FlowLayout>
  );
};

const radioData = [
  {
    label: "Ultimate Parent",
    value: "parent",
  },
  {
    label: "Subsidiary",
    value: "subsidiary",
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

export const WithControls: StoryFn<typeof FormField> = (props) => {
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
    event,
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
          (controlledValue) => controlledValue !== value,
        ),
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
      <FormField {...props}>
        <FormLabel>Draft</FormLabel>
        <Switch />
        <FormHelperText>Publishes immediately when unchecked</FormHelperText>
      </FormField>
    </FlowLayout>
  );
};

export const WithMultilineInput: StoryFn<typeof FormField> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <MultilineInput defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField disabled {...props}>
        <FormLabel>Form Field label</FormLabel>
        <MultilineInput defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField readOnly {...props}>
        <FormLabel>Form Field label</FormLabel>
        <MultilineInput defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField readOnly {...props}>
        <FormLabel>Form Field label</FormLabel>
        <MultilineInput bordered defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField validationStatus="error" {...props}>
        <FormLabel>Form Field label</FormLabel>
        <MultilineInput defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
    </FlowLayout>
  );
};

export const WithMultilineInputAsQuestion: StoryFn<typeof FormField> = (
  props,
) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField necessity="required" {...props}>
        <FormLabel intent="sentence">
          Will data related to the new initiative be shared across lines of
          business, external to the firm, or across-jurisdictions? Please
          explain.
        </FormLabel>
        <MultilineInput defaultValue="Value" />
      </FormField>
      <FormField necessity="optional" {...props}>
        <FormLabel intent="sentence">
          For the legal entity country of incorporation, are you aware of any
          specific regulations relating to oversight of third parties?
        </FormLabel>
        <MultilineInput variant="secondary" bordered defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
    </FlowLayout>
  );
};

export const WithValidation: StoryFn<typeof FormField> = (props) => {
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

export const WithInputWithAdornments: StoryFn<typeof FormField> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input
          startAdornment={<Text>$</Text>}
          endAdornment={
            <Button>
              <NoteIcon />
            </Button>
          }
          defaultValue={"Value"}
        />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input
          startAdornment={
            <Button>
              <InfoIcon />
            </Button>
          }
          endAdornment={
            <>
              <Text>%</Text>
              <Button sentiment="accented">
                <NoteIcon />
              </Button>
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
            <Button appearance="transparent">
              <NoteIcon />
            </Button>
          }
          defaultValue={"Value"}
        />
      </FormField>
      <FormField disabled {...props}>
        <FormLabel>Form Field label (disabled)</FormLabel>
        <Input
          startAdornment={
            <Button disabled>
              <InfoIcon />
            </Button>
          }
          endAdornment={
            <>
              <Text>%</Text>
              <Button disabled sentiment="accented">
                <NoteIcon />
              </Button>
            </>
          }
          defaultValue={"Value"}
        />
      </FormField>
    </FlowLayout>
  );
};

export const GroupedWithLabelTop: StoryFn<typeof FormField> = (props) => {
  return (
    <StackLayout>
      <FormField {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormLabel>
        <Input defaultValue="Primary Input value" />
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Primary Input value" />
      </FormField>
    </StackLayout>
  );
};

export const GroupedWithLabelLeft: StoryFn<typeof FormField> = (props) => {
  const groupedProps: { labelPlacement: FormFieldLabelPlacement } = {
    labelPlacement: "left",
  };

  return (
    <StackLayout>
      <FormField {...groupedProps} {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...groupedProps} {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormLabel>
        <Input defaultValue="Primary Input value" />
      </FormField>
      <FormField {...groupedProps} {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...groupedProps} {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Primary Input value" />
      </FormField>
    </StackLayout>
  );
};

export const GroupedWithLabelRight: StoryFn<typeof FormField> = (props) => {
  const groupedProps: { labelPlacement: FormFieldLabelPlacement } = {
    labelPlacement: "right",
  };

  return (
    <StackLayout role={"group"}>
      <FormField {...groupedProps} {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...groupedProps} {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormLabel>
        <Input defaultValue="Primary Input value" />
      </FormField>
      <FormField {...groupedProps} {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...groupedProps} {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Primary Input value" />
      </FormField>
    </StackLayout>
  );
};

export const GroupedWithVariant: StoryFn<typeof FormField> = (props) => {
  const groupedControlProps = { variant: "secondary" } as Partial<InputProps>;

  return (
    <StackLayout>
      <FormField {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" {...groupedControlProps} />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormLabel>
        <Input defaultValue="Value" {...groupedControlProps} />
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Checkbox defaultValue="Value" />
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" {...groupedControlProps} />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" {...groupedControlProps} />
      </FormField>
    </StackLayout>
  );
};

export const MultiColumnLayout: StoryFn<typeof FormField> = (props) => {
  return (
    <StackLayout
      style={{ "--saltFormField-label-width": "100px" } as CSSProperties}
    >
      <FormField {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <StackLayout direction={{ xs: "column", sm: "row" }}>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Checkbox defaultValue="Value" />
        </FormField>
      </StackLayout>
      <FormField {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormLabel>
        <Input defaultValue="Value" />
      </FormField>
      <StackLayout direction={{ xs: "column", sm: "row" }}>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
        </FormField>
      </StackLayout>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
      </FormField>
    </StackLayout>
  );
};

export const MultiColumnLayoutEmptySlot: StoryFn<typeof FormField> = (
  props,
) => {
  return (
    <StackLayout
      style={{ "--saltFormField-label-width": "100px" } as CSSProperties}
    >
      <FormField {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <GridLayout columns={3}>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Checkbox defaultValue="Value" />
        </FormField>
      </GridLayout>
      <FormField {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormLabel>
        <Input defaultValue="Value" />
      </FormField>
      <GridLayout columns={2}>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
      </GridLayout>
      <GridLayout columns={2}>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
      </GridLayout>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
      </FormField>
    </StackLayout>
  );
};

export const MultiColumnGrid: StoryFn<typeof FormField> = (props) => {
  return (
    <StackLayout
      style={
        {
          "--saltFormField-label-width": "100px",
          maxWidth: 500,
        } as CSSProperties
      }
    >
      {/* Single Form Field With label and Helper Text */}
      <FormField {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      {/* Three Form Fields in a Row, Two With Checkbox */}
      <GridLayout columns={3}>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Checkbox defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Checkbox defaultValue="Value" />
        </FormField>
      </GridLayout>
      {/* SUBGRID EXAMPLE - Two Form Fields in a Row, With long label and helper text */}
      <GridLayout columns={2}>
        <FormField
          {...props}
          style={{ gridTemplateRows: "subgrid", gridRow: "span 3" }}
        >
          <FormLabel>
            {" "}
            Subgrid row. Form Field label that's extra long. Showing that labels
            wrap around to the line.
          </FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField
          {...props}
          style={{ gridTemplateRows: "subgrid", gridRow: "span 3" }}
        >
          <FormLabel>Subgrid row. Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>
            Helper text that's extra long. Showing that helper text wrap around
            to the line.
          </FormHelperText>
        </FormField>
      </GridLayout>
      {/* Two Form Fields in a Row, One with Radio button group*/}
      <GridLayout columns={2}>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <RadioButtonGroup direction="horizontal">
            <RadioButton key="option1" label="Yes" value="yes" />
            <RadioButton key="option2" label="No" value="no" />
          </RadioButtonGroup>
        </FormField>
      </GridLayout>
      {/* Two Form Fields in a Row, One without helper text*/}
      <GridLayout columns={2}>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
        </FormField>
      </GridLayout>
      {/* Two Rows, one empty space*/}
      <GridLayout columns={2}>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
      </GridLayout>
      {/* Two Form Fields in a Row, One with Switch*/}
      <GridLayout columns={2}>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>Helper text</FormHelperText>
        </FormField>
        <FormField {...props}>
          <FormLabel>Form Field label</FormLabel>
          <Switch />
        </FormField>
      </GridLayout>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
      </FormField>
    </StackLayout>
  );
};

export const CustomRequired: StoryFn<typeof FormField> = (props) => {
  return (
    <StackLayout
      style={{
        maxWidth: 500,
      }}
      className="custom-required-story"
    >
      <Text styleAs="h3">
        Extended styling using <code>--salt-content-attention-foreground</code>
      </Text>
      <FormField necessity="asterisk" {...props}>
        <FormLabel>Email address</FormLabel>
        <Input placeholder="Your email" bordered />
        <FormFieldHelperText>
          By signing up, you are agreeing to our Terms of Service and Privacy
          Policy.
        </FormFieldHelperText>
      </FormField>
      <FormField necessity="required" {...props}>
        <FormLabel>Email address</FormLabel>
        <Input placeholder="Your email" />
        <FormFieldHelperText>
          By signing up, you are agreeing to our Terms of Service and Privacy
          Policy.
        </FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};

export const WithoutLabelOrHelperText: StoryFn<typeof FormField> = (args) => {
  const [showLabel, setShowLabel] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setShowLabel((old) => !old)}>Toggle label</Button>
      <FormField {...args}>
        {showLabel && <FormFieldLabel>Form Field label</FormFieldLabel>}
        <Input />
      </FormField>
    </StackLayout>
  );
};
