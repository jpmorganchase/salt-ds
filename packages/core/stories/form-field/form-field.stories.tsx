import { ChangeEvent, ChangeEventHandler, useState } from "react";
import {
  Checkbox,
  CheckboxGroup,
  RadioButton,
  RadioButtonGroup,
  FlowLayout,
  FormFieldGroup,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
  FormField,
  Input,
  Tooltip,
  AdornmentButton,
  Text,
  FormFieldControlWrapper,
  GridLayout,
  GridItem,
  H2,
} from "@salt-ds/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { NoteIcon, InfoIcon } from "@salt-ds/icons";

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

export const MultiChild: ComponentStory<typeof FormField> = (props) => {
  const [firstValue, setFirstValue] = useState("Abcdef");
  const [secondValue, setSecondValue] = useState("");

  const valid = firstValue.length && secondValue.length;

  const [values, setValues] = useState({
    firstValue: "3",
    secondValue: "4.5",
  });

  const handleUpdate = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    let update = values;
    const value = e.target.value;

    if (parseFloat(value)) {
      if (index === 0) {
        update = {
          firstValue: value,
          secondValue: (parseFloat(value) * 1.5).toString(),
        };
      } else {
        update = {
          firstValue: ((parseFloat(value) * 2) / 3).toString(),
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
        <FormFieldControlWrapper>
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
        </FormFieldControlWrapper>
        <FormHelperText>
          * User must enter all values to complete the input
        </FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Paired fields</FormLabel>
        <FormFieldControlWrapper>
          <Input
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleUpdate(e, 0)}
            value={values.firstValue}
          />
          <Input
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleUpdate(e, 1)}
            value={values.secondValue}
          />
        </FormFieldControlWrapper>
        <FormHelperText>
          * User entry in either field will automatically populate the
          corresponding field with the correct value
        </FormHelperText>
      </FormField>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>Multi inputs with left label</FormLabel>
        <FormFieldControlWrapper>
          <Input placeholder="First value" />
          <Input placeholder="Second value" />
          <Input placeholder="Third value" />
        </FormFieldControlWrapper>
      </FormField>
      <FormField {...props}>
        <FormLabel>Multi inputs with secondary variant</FormLabel>
        <FormFieldControlWrapper variant="secondary">
          <Input placeholder="First value" />
          <Input placeholder="Second value" />
        </FormFieldControlWrapper>
      </FormField>
      <FormField {...props}>
        <FormLabel>Multi controls</FormLabel>
        <FormFieldControlWrapper>
          <Input disabled={checked} placeholder="Transition impact" />
          <Checkbox
            checked={checked}
            onChange={() => setChecked(!checked)}
            label="Transition impact not applicable"
          />
        </FormFieldControlWrapper>
      </FormField>
    </FlowLayout>
  );
};

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


export const GroupedWithLabelTop: ComponentStory<typeof FormField> = (props) => {
  return (
    <FormFieldGroup style={{width: "500px"}}>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>
          Helper text
        </FormHelperText>
      </FormField>
      <FormField labelPlacement="left" {...props}>
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
    </FormFieldGroup>
  );
};
export const GroupedWithLabelLeft: ComponentStory<typeof FormField> = (props) => {
  return (
    <FormFieldGroup labelAlignment="left" style={{width: "500px"}}>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>
          Helper text
        </FormHelperText>
      </FormField>
      <FormField labelPlacement="left" {...props}>
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
    </FormFieldGroup>
  );
};
export const GroupedWithLabelRight: ComponentStory<typeof FormField> = (props) => {
  return (
    <FormFieldGroup labelAlignment="right" labelWidth="150px" style={{width: "500px"}}>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>
          Helper text
        </FormHelperText>
      </FormField>
      <FormField labelPlacement="left" {...props}>
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
    </FormFieldGroup>
  );
};

export const NestedGroup: ComponentStory<typeof FormField> = (props) => {
  return (
    <>
    <H2>Left aligned label</H2>
    <FormFieldGroup labelAlignment="left" labelWidth="150px" style={{width: "600px"}}>
      <FormField {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>
          Helper text
        </FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormLabel>
        <Input defaultValue="Value" />
      </FormField>
      <FormFieldGroup direction="horizontal">
        <FormField  {...props}>
          <FormLabel>Form Field</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>
            Helper text
          </FormHelperText>
        </FormField>
        <FormField  {...props}>
          <FormLabel>
            Form Field
          </FormLabel>
          <Input defaultValue="Value" />
        </FormField>
      </FormFieldGroup>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>
          Form Field
        </FormLabel>
        <Input defaultValue="Value" />
      </FormField>
    </FormFieldGroup>


    <H2 style={{marginTop: "var(--salt-spacing-400)"}}>Right aligned label</H2>
    <FormFieldGroup labelAlignment="right" labelWidth="100px" style={{width: "700px"}}>
      <FormField {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>
          Helper text
        </FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormLabel>
        <Input defaultValue="Value" />
      </FormField>
      <FormFieldGroup direction="horizontal">
        <FormField  {...props}>
          <FormLabel>Form Field</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>
            Helper text
          </FormHelperText>
        </FormField>
        <FormField  {...props}>
          <FormLabel>
            Form Field
          </FormLabel>
          <Input defaultValue="Value" />
        </FormField>
      </FormFieldGroup>
      <FormFieldGroup direction="horizontal">
        <FormField  {...props}>
          <FormLabel>Form Field</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>
            Helper text
          </FormHelperText>
        </FormField>
        <FormField  {...props}>
          <FormLabel>
            Form Field
          </FormLabel>
          <Input defaultValue="Value" />
        </FormField>
        <FormField  {...props}>
          <FormLabel>
            Form Field
          </FormLabel>
          <Input defaultValue="Value" />
        </FormField>
      </FormFieldGroup>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>
          Form Field
        </FormLabel>
        <Input defaultValue="Value" />
      </FormField>
    </FormFieldGroup>


    <H2 style={{marginTop: "var(--salt-spacing-400)"}}>Top aligned label</H2>
    <FormFieldGroup style={{width: "400px"}}>
      <FormField {...props}>
        <FormLabel>Form Field label left</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>
          Helper text
        </FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>
          Form Field label that's extra long. Showing that labels wrap around to
          the line.
        </FormLabel>
        <Input defaultValue="Value" />
      </FormField>
      <FormFieldGroup direction="horizontal">
        <FormField  {...props}>
          <FormLabel>Form Field</FormLabel>
          <Input defaultValue="Value" />
          <FormHelperText>
            Helper text
          </FormHelperText>
        </FormField>
        <FormField  {...props}>
          <FormLabel>
            Form Field
          </FormLabel>
          <Input defaultValue="Value" />
        </FormField>
      </FormFieldGroup>
      <FormField labelPlacement="left" {...props}>
        <FormLabel>
          Form Field
        </FormLabel>
        <Input defaultValue="Value" />
      </FormField>
    </FormFieldGroup>
    </>
  );
};