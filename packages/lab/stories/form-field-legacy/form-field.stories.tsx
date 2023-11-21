import { SaltProvider, H3 } from "@salt-ds/core";
import { Dropdown, FormField, FormFieldProps, Input } from "@salt-ds/lab";
import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { usStateExampleData } from "../assets/exampleData";

export default {
  title: "Lab/Form Field Legacy",
  component: FormField,
} as Meta<typeof FormField>;

export const Primary: StoryFn<typeof FormField> = (props) => {
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

export const Secondary: StoryFn<typeof FormField> = () => (
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
      <H3>Secondary</H3>
      <FormField
        label="Secondary form field"
        helperText="Helper text value"
        variant="secondary"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div style={{ width: "200px" }}>
      <H3>Secondary with disabled outer ring</H3>
      <FormField
        label="Secondary form field"
        helperText="Helper text value"
        disableFocusRing
        variant="secondary"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
  </div>
);

export const Tertiary: StoryFn<typeof FormField> = () => (
  <div style={{ width: "200px" }}>
    <H3>Tertiary</H3>
    <FormField
      label="Tertiary form field"
      helperText="Helper text value"
      variant="tertiary"
    >
      <Input defaultValue="Value" />
    </FormField>
  </div>
);

export const Disabled: StoryFn<typeof FormField> = () => (
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

export const Readonly: StoryFn<typeof FormField> = () => (
  <div style={{ width: "300px" }}>
    <FormField label="Read Only Form Field" readOnly>
      <Input defaultValue="Value" />
    </FormField>
  </div>
);

export const HelperText: StoryFn<typeof FormField> = () => (
  <div style={{ width: "300px" }}>
    <FormField label="Helper Text Form Field" helperText="Helper text value">
      <Input defaultValue="Value" />
    </FormField>
  </div>
);

export const ValidationStatus: StoryFn<typeof FormField> = () => (
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
      <FormField label="No validation status" helperText="Helper text value">
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div>
      <FormField
        label="No validation status"
        helperText="Helper text value"
        variant="secondary"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div>
      <FormField
        label="Warning validation status"
        helperText="Helper text value"
        validationStatus="warning"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div>
      <FormField
        label="Warning validation status"
        helperText="Helper text value"
        validationStatus="warning"
        variant="secondary"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div>
      <FormField
        label="Error validation status"
        helperText="Helper text value"
        validationStatus="error"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
    <div>
      <FormField
        label="Error validation status"
        helperText="Helper text value"
        validationStatus="error"
        variant="secondary"
      >
        <Input defaultValue="Value" />
      </FormField>
    </div>
  </div>
);

export const LabelAlignments: StoryFn<typeof FormField> = () => (
  <div
    style={{
      display: "grid",
      rowGap: "20px",
      columnGap: "20px",
      gridTemplateColumns: "auto auto",
      padding: "20px 20px",
    }}
  >
    <FormField
      label="Input in form field"
      helperText="Helper text value"
      labelPlacement="left"
    >
      <Input defaultValue="Value" />
    </FormField>
    <FormField label="Dropdown in form field" helperText="Helper text value">
      <Dropdown
        defaultSelected={usStateExampleData[0]}
        source={usStateExampleData}
      />
    </FormField>
  </div>
);

const renderFormFieldLegacy = (props?: Partial<FormFieldProps>) => (
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
      background: "var(--salt-container-primary-background)",
    }}
  >
    <SaltProvider density="touch">{renderFormFieldLegacy(props)}</SaltProvider>
    <SaltProvider density="low"> {renderFormFieldLegacy(props)}</SaltProvider>
    <SaltProvider density="medium">{renderFormFieldLegacy(props)}</SaltProvider>
    <SaltProvider density="high"> {renderFormFieldLegacy(props)}</SaltProvider>
    <SaltProvider density="touch">
      {renderFormFieldLegacy({ ...props, labelPlacement: "left" })}
    </SaltProvider>
    <SaltProvider density="low">
      {renderFormFieldLegacy({ ...props, labelPlacement: "left" })}
    </SaltProvider>
    <SaltProvider density="medium">
      {renderFormFieldLegacy({ ...props, labelPlacement: "left" })}
    </SaltProvider>
    <SaltProvider density="high">
      {renderFormFieldLegacy({ ...props, labelPlacement: "left" })}
    </SaltProvider>
  </div>
);

// We can't use SB controls here, otherwise SB crashes with circular JSON conversion error (iframe works)
export const AllDensitiesTwoThemes: StoryFn<typeof FormField> = () => {
  return (
    <div style={{ display: "flex" }}>
      <SaltProvider mode="light">{renderAllDensities()}</SaltProvider>
      <SaltProvider mode="dark">{renderAllDensities()}</SaltProvider>
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

export const Necessity: StoryFn<typeof FormField> = () => (
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
      validationStatus="error"
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
      validationStatus="warning"
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
          content: (
            <div>
              <div>Message 1</div>
              <div>Message 2</div>
            </div>
          ),
        },
      }}
      {...props}
      validationStatus="error"
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

export const StatusIndicator: StoryFn<typeof FormField> = () => (
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
      <ErrorState variant="secondary" />
      <ErrorState hasStatusIndicator />
      <ErrorState hasStatusIndicator variant="secondary" />
      <WarningState />
      <WarningState variant="secondary" />
      <WarningState hasStatusIndicator />
      <WarningState hasStatusIndicator variant="secondary" />
      <DefaultState />
      <DefaultState variant="secondary" />
      <DefaultState hasStatusIndicator />
      <DefaultState hasStatusIndicator variant="secondary" />
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
      <ErrorState labelPlacement="left" variant="secondary" />
      <WarningState labelPlacement="left" variant="secondary" />
      <DefaultState labelPlacement="left" variant="secondary" />
      <HelperTextAsTooltip labelPlacement="left" variant="secondary" />
      <MultipleMessagesStatusIndicator
        labelPlacement="left"
        variant="secondary"
      />
    </div>
  </>
);

export const Variants: StoryFn<typeof FormField> = () => (
  <>
    <div style={{ display: "flex", flexDirection: "row", padding: 12 }}>
      <div style={{ width: "250px" }}>
        <h3>Default</h3>
        <FormField label="Default Form Field label">
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <h3>Secondary</h3>
        <FormField label="Default Form Field label" variant="secondary">
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <h3>Tertiary</h3>
        <FormField label="Default Form Field label" variant="tertiary">
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
          variant="secondary"
          helperText="some helper text"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          label="Form Field label with helper text"
          variant="tertiary"
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
          variant="secondary"
          label="Form field with disabled outer ring"
          helperText="some helper text"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          disableFocusRing
          variant="tertiary"
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
        <h3>Secondary</h3>
        <FormField
          label="Default Form Field label"
          labelPlacement="left"
          variant="secondary"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <h3>Tertiary</h3>
        <FormField
          label="Default Form Field label"
          labelPlacement="left"
          variant="tertiary"
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
          variant="secondary"
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          helperText="some helper text"
          label="Label with helper text"
          labelPlacement="left"
          variant="tertiary"
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
          variant="secondary"
          disableFocusRing
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
      <div style={{ width: "250px", marginLeft: 16 }}>
        <FormField
          label="Disabled outer ring"
          labelPlacement="left"
          variant="tertiary"
          disableFocusRing
        >
          <Input defaultValue="Value" />
        </FormField>
      </div>
    </div>
  </>
);
