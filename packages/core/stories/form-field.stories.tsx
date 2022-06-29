import {
  ToolkitProvider,
  FormField,
  FormFieldProps,
} from "@jpmorganchase/uitk-core";
import { Input, Dropdown } from "@jpmorganchase/uitk-lab";
import { useState } from "react";
import { usStateExampleData } from "./exampleData";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Core/Form Field",
  component: FormField,
} as ComponentMeta<typeof FormField>;

export const Default: ComponentStory<typeof FormField> = (props) => {
  return (
    <>
      <FormField label="Default Form Field label" {...props}>
        <Input defaultValue="Value" />
      </FormField>
      <div style={{ height: 40 }} />
      <FormField
        labelPlacement="left"
        label="Default Form Field label"
        {...props}
      >
        <Input defaultValue="Value" />
      </FormField>
    </>
  );
};

export const LowEmphasis: ComponentStory<typeof FormField> = () => (
  <div style={{ width: "200px" }}>
    <h3>Low emphasis</h3>
    <FormField
      label="Low emphasis form field"
      helperText="Helper text value"
      className="uitkEmphasisLow"
    >
      <Input defaultValue="Value" />
    </FormField>
  </div>
);

export const HighEmphasis: ComponentStory<typeof FormField> = () => (
  <div
    style={{
      display: "grid",
      rowGap: "20px",
      columnGap: "20px",
      gridTemplateColumns: "auto auto",
      padding: "20px 20px",
    }}
  >
    <div style={{ width: "200px" }}>
      <h3>High emphasis</h3>
      <FormField
        label="High emphasis form field"
        helperText="Helper text value"
        className="uitkEmphasisHigh"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div style={{ width: "200px" }}>
      <h3>High emphasis with disabled outer ring</h3>
      <FormField
        label="Low emphasis form field"
        helperText="Helper text value"
        disableFocusRing
        className="uitkEmphasisHigh"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
  </div>
);

export const Disabled: ComponentStory<typeof FormField> = () => (
  <div style={{ width: "300px" }}>
    <FormField
      label="Default Form Field description label"
      helperText="Helper text value"
      disabled
    >
      <Input defaultValue="Value" />
    </FormField>
  </div>
);

export const Readonly: ComponentStory<typeof FormField> = () => (
  <div style={{ width: "300px" }}>
    <FormField label="Read Only Form Field" readOnly>
      <Input defaultValue="Value" />
    </FormField>
  </div>
);

export const HelperText: ComponentStory<typeof FormField> = () => (
  <div style={{ width: "300px" }}>
    <FormField label="Helper Text Form Field" helperText="Helper text value">
      <Input defaultValue="Value" />
    </FormField>
  </div>
);

export const ValidationStates: ComponentStory<typeof FormField> = () => (
  <div
    style={{
      columnGap: 20,
      display: "grid",
      gridTemplateColumns: "50% 50%",
      rowGap: 20,
      padding: "20px 20px",
    }}
  >
    <div>
      <FormField label="No validation state" helperText="Helper text value">
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div>
      <FormField
        label="No validation state"
        helperText="Helper text value"
        className="uitkEmphasisHigh"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div>
      <FormField
        label="Warning validation state"
        helperText="Helper text value"
        validationState="warning"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div>
      <FormField
        label="Warning validation state"
        helperText="Helper text value"
        validationState="warning"
        className="uitkEmphasisHigh"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div>
      <FormField
        label="Error validation state"
        helperText="Helper text value"
        validationState="error"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div>
      <FormField
        label="Error validation state"
        helperText="Helper text value"
        validationState="error"
        className="uitkEmphasisHigh"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
  </div>
);

export const LabelAlignments: ComponentStory<typeof FormField> = () => (
  <div
    style={{
      display: "grid",
      rowGap: "20px",
      columnGap: "20px",
      gridTemplateColumns: "auto auto",
      padding: "20px 20px",
    }}
  >
    <FormField label="Input in form field" helperText="Helper text value">
      <Input defaultValue="Value" />
    </FormField>
    <FormField label="Dropdown in form field" helperText="Helper text value">
      <Dropdown
        initialSelectedItem={usStateExampleData[0]}
        source={usStateExampleData}
      />
    </FormField>
  </div>
);

const renderFormField = (props?: Partial<FormFieldProps>) => (
  <div>
    <FormField
      label="Helper Text Form Field"
      helperText="Helper text value"
      {...props}
    >
      <Input defaultValue="Value" />
    </FormField>
  </div>
);

const renderAllDensities = (props?: Partial<FormFieldProps>) => (
  <div
    style={{
      display: "grid",
      rowGap: "20px",
      padding: "20px 20px",
      background: "var(--uitk-container-background-medium)",
    }}
  >
    <ToolkitProvider density="touch">{renderFormField(props)}</ToolkitProvider>
    <ToolkitProvider density="low"> {renderFormField(props)}</ToolkitProvider>
    <ToolkitProvider density="medium">{renderFormField(props)}</ToolkitProvider>
    <ToolkitProvider density="high"> {renderFormField(props)}</ToolkitProvider>
    <ToolkitProvider density="touch">
      {renderFormField({ ...props, labelPlacement: "left" })}
    </ToolkitProvider>
    <ToolkitProvider density="low">
      {renderFormField({ ...props, labelPlacement: "left" })}
    </ToolkitProvider>
    <ToolkitProvider density="medium">
      {renderFormField({ ...props, labelPlacement: "left" })}
    </ToolkitProvider>
    <ToolkitProvider density="high">
      {renderFormField({ ...props, labelPlacement: "left" })}
    </ToolkitProvider>
  </div>
);

// We can't use SB controls here, otherwise SB crashes with circular JSON conversion error (iframe works)
export const AllDensitiesTwoThemes: ComponentStory<typeof FormField> = () => {
  return (
    <div style={{ display: "flex" }}>
      <ToolkitProvider theme="light">{renderAllDensities()}</ToolkitProvider>
      <ToolkitProvider theme="dark">{renderAllDensities()}</ToolkitProvider>
    </div>
  );
};

const Optional = () => {
  const [value, setValue] = useState("Value");

  return (
    <div style={{ width: "300px" }}>
      <FormField
        LabelProps={{
          displayedNecessity: "optional",
        }}
        label="Optional Form Field"
        labelPlacement="top"
      >
        <Input
          onChange={(e) => {
            setValue(e.target.value);
          }}
          value={value}
        />
      </FormField>
    </div>
  );
};

const Required = () => {
  const [value, setValue] = useState("Value");

  return (
    <div style={{ width: "300px", marginLeft: 16 }}>
      <FormField label="Required Form Field" labelPlacement="top" required>
        <Input
          onChange={(e) => {
            setValue(e.target.value);
          }}
          value={value}
        />
      </FormField>
    </div>
  );
};

export const Necessity: ComponentStory<typeof FormField> = () => (
  <div style={{ display: "flex", flexDirection: "row" }}>
    <Optional />
    <Required />
  </div>
);

const ErrorState = (props?: Partial<FormFieldProps>) => {
  const [value, setValue] = useState("Value");

  return (
    <FormField
      helperText="helperText"
      label="Error status FormField"
      labelPlacement="top"
      validationState="error"
      // statusIndicatorContent={['Error']}
      StatusIndicatorProps={{
        tooltipText: "Error",
      }}
      {...props}
    >
      <Input
        onChange={(e) => {
          setValue(e.target.value);
        }}
        value={value}
      />
    </FormField>
  );
};

const WarningState = (props?: Partial<FormFieldProps>) => {
  const [value, setValue] = useState("Value");

  return (
    <FormField
      helperText="helperText"
      label="Warning status FormField"
      labelPlacement="top"
      validationState="warning"
      // statusIndicatorContent={['Warning']}
      StatusIndicatorProps={{
        tooltipText: "Warning",
      }}
      {...props}
    >
      <Input
        onChange={(e) => {
          setValue(e.target.value);
        }}
        value={value}
      />
    </FormField>
  );
};

const DefaultState = (props?: Partial<FormFieldProps>) => {
  const [value, setValue] = useState("Value");

  return (
    <FormField
      helperText="helperText"
      label="Default status FormField"
      labelPlacement="top"
      // statusIndicatorContent={['Default']}
      StatusIndicatorProps={{
        tooltipText: "Default",
      }}
      {...props}
    >
      <Input
        onChange={(e) => {
          setValue(e.target.value);
        }}
        value={value}
      />
    </FormField>
  );
};

const HelperTextAsTooltip = (props: Partial<FormFieldProps>) => {
  const [value, setValue] = useState("Value");

  return (
    <FormField
      helperText="helperText"
      helperTextPlacement="tooltip"
      label="HelperText as tooltip with status indicator"
      labelPlacement="top"
      {...props}
    >
      <Input
        onChange={(e) => {
          setValue(e.target.value);
        }}
        value={value}
      />
    </FormField>
  );
};

const MultipleMessagesStatusIndicator = (props?: Partial<FormFieldProps>) => {
  const [value, setValue] = useState("Value");

  return (
    <FormField
      hasStatusIndicator
      helperText="helperText"
      label="Multiple Messages FormField"
      labelPlacement="top"
      // statusIndicatorContent={['Message 1', 'Message 2']}
      StatusIndicatorProps={{
        TooltipProps: {
          render: () => (
            <div>
              <div>Message 1</div>
              <div>Message 2</div>
            </div>
          ),
        },
      }}
      {...props}
      validationState="error"
    >
      <Input
        onChange={(e) => {
          setValue(e.target.value);
        }}
        value={value}
      />
    </FormField>
  );
};

export const StatusIndicator: ComponentStory<typeof FormField> = () => (
  <>
    <div
      style={{
        display: "grid",
        flexDirection: "row",
        gap: 24,
        gridTemplateColumns: "300px 300px",
        width: 800,
      }}
    >
      <ErrorState />
      <ErrorState className="uitkEmphasisHigh" />
      <ErrorState hasStatusIndicator />
      <ErrorState hasStatusIndicator className="uitkEmphasisHigh" />
      <WarningState />
      <WarningState className="uitkEmphasisHigh" />
      <WarningState hasStatusIndicator />
      <WarningState hasStatusIndicator className="uitkEmphasisHigh" />
      <DefaultState />
      <DefaultState className="uitkEmphasisHigh" />
      <DefaultState hasStatusIndicator />
      <DefaultState hasStatusIndicator className="uitkEmphasisHigh" />
      <HelperTextAsTooltip hasStatusIndicator />
      <HelperTextAsTooltip />
      <MultipleMessagesStatusIndicator />
    </div>
    <div
      style={{
        display: "grid",
        flexDirection: "row",
        gap: 24,
        gridTemplateColumns: "300px 300px",
        marginTop: 24,
        width: 800,
      }}
    >
      <ErrorState labelPlacement="left" />
      <WarningState labelPlacement="left" />
      <DefaultState labelPlacement="left" />
      <HelperTextAsTooltip labelPlacement="left" />
      <MultipleMessagesStatusIndicator labelPlacement="left" />
      <ErrorState labelPlacement="left" className="uitkEmphasisHigh" />
      <WarningState labelPlacement="left" className="uitkEmphasisHigh" />
      <DefaultState labelPlacement="left" className="uitkEmphasisHigh" />
      <HelperTextAsTooltip labelPlacement="left" className="uitkEmphasisHigh" />
      <MultipleMessagesStatusIndicator
        labelPlacement="left"
        className="uitkEmphasisHigh"
      />
    </div>
  </>
);

export const CustomStyling: ComponentStory<typeof FormField> = () => (
  <div
    style={{
      display: "grid",
      rowGap: "20px",
      columnGap: "20px",
      gridTemplateColumns: "auto auto",
      padding: "20px 20px",
    }}
  >
    <style>{`
      .carbon {
        --uitkFormField-focused-outlineStyle: none;
        --uitkFormFieldHelperText-fontStyle: normal;
        --uitkFormActivationIndicator-borderColor: var(--uitk-color-purple-400);
        --uitkFormActivationIndicator-icon-color: var(--uitk-color-purple-200);
        --uitkFormLabel-marginBottom: 6px;
        --uitkFormLabel-text-color: var(--uitk-color-purple-800);
      }
      .carbon .uitkFormField-focused {
        --uitkFormActivationIndicator-size: 3px;
        --uitkFormActivationIndicator-borderColor: var(--uitk-color-purple-200);
        --uitkFormActivationIndicator-icon-color: var(--uitk-color-purple-50);
        --uitkFormActivationIndicator-borderStyle: dotted;
      }
      .carbon.uitkFormField:not(.uitkFormField-readOnly):not(.uitkFormField-disabled):hover {
        --uitkFormActivationIndicator-borderColor: var(--uitk-color-purple-200);
        --uitkFormActivationIndicator-icon-color: var(--uitk-color-purple-50);
        --uitkFormActivationIndicator-borderStyle: dashed;
      }
      .carbon.uitkFormField-focused:after {
        outline-style: solid;
        outline-color: var(--uitk-color-purple-50);
      }
    `}</style>
    <div style={{ width: "200px" }}>
      <h3>Default</h3>
      <FormField
        className="carbon"
        label="Carbon form field"
        helperText="Helper text value"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div style={{ width: "200px" }}>
      <h3>High emphasis</h3>
      <FormField
        className="carbon"
        label="Carbon form field"
        helperText="Helper text value"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
  </div>
);

export const Variants: ComponentStory<typeof FormField> = () => (
  <>
    <div style={{ display: "flex", flexDirection: "row", padding: 12 }}>
      <div style={{ width: "250px" }}>
        <h3>Default</h3>
        <FormField label="Default Form Field label">
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <h3>High emphasis</h3>
        <FormField
          label="Default Form Field label"
          className="uitkEmphasisHigh"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <h3>Low emphasis</h3>
        <FormField label="Default Form Field label" className="uitkEmphasisLow">
          <Input defaultValue="Value" />
        </FormField>
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "row", padding: 12 }}>
      <div style={{ width: "250px" }}>
        <FormField
          label="Form Field label with helper text"
          helperText="some helper text"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          label="Form Field label with helper text"
          className="uitkEmphasisHigh"
          helperText="some helper text"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          label="Form Field label with helper text"
          className="uitkEmphasisLow"
          helperText="some helper text"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "row", padding: 12 }}>
      <div style={{ width: "250px" }}>
        <FormField
          disableFocusRing
          helperText="some helper text"
          label="Form field with disabled outer ring"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          disableFocusRing
          className="uitkEmphasisHigh"
          label="Form field with disabled outer ring"
          helperText="some helper text"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          disableFocusRing
          className="uitkEmphasisLow"
          helperText="some helper text"
          label="Form field with disabled outer ring"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "row", padding: 12 }}>
      <div style={{ width: "250px" }}>
        <h3>Default</h3>
        <FormField label="Default Form Field label" labelPlacement="left">
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <h3>High emphasis</h3>
        <FormField
          label="Default Form Field label"
          labelPlacement="left"
          className="uitkEmphasisHigh"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <h3>Low emphasis</h3>
        <FormField
          label="Default Form Field label"
          labelPlacement="left"
          className="uitkEmphasisLow"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "row", padding: 12 }}>
      <div style={{ width: "250px" }}>
        <FormField
          helperText="some helper text"
          label="Label with helper text"
          labelPlacement="left"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          helperText="some helper text"
          label="Label with helper text"
          labelPlacement="left"
          className="uitkEmphasisHigh"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          helperText="some helper text"
          label="Label with helper text"
          labelPlacement="left"
          className="uitkEmphasisLow"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "row", padding: 12 }}>
      <div style={{ width: "250px" }}>
        <FormField
          label="Disabled outer ring"
          labelPlacement="left"
          disableFocusRing
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          label="Disabled outer ring"
          labelPlacement="left"
          className="uitkEmphasisHigh"
          disableFocusRing
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          label="Disabled outer ring"
          labelPlacement="left"
          className="uitkEmphasisLow"
          disableFocusRing
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
    </div>
  </>
);
