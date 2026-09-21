import {
  Banner,
  BannerContent,
  Button,
  Dropdown,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  GridItem,
  GridLayout,
  Input,
  Label,
  Link,
  MultilineInput,
  Option,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
  useAriaAnnouncer,
} from "@salt-ds/core";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export const StandardLayout = () => {
  const [value, setValue] = useState<string>("Value text");
  const [isError, setIsError] = useState<boolean>(false);
  const MAX_CHARS = 1000;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setValue(newVal);
    setIsError(newVal.length > MAX_CHARS);
  };

  return (
    <GridLayout
      columns={4}
      style={{ width: "calc(var(--salt-size-base) * 12)" }}
    >
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Input defaultValue="Value text" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={2}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Dropdown defaultSelected={["Value text"]}>
            <Option value="Value text">Value text</Option>
          </Dropdown>
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={3}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Dropdown defaultSelected={["Value text"]}>
            <Option value="Value text">Value text</Option>
          </Dropdown>
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <MultilineInput
            bordered
            endAdornment={
              <Label variant={!isError ? "secondary" : "primary"}>
                {!isError && `${value.length}/${MAX_CHARS}`}
                {isError && <strong>{`${value.length}/${MAX_CHARS}`}</strong>}
              </Label>
            }
            onChange={handleChange}
            value={value}
            validationStatus={isError ? "error" : undefined}
          />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
    </GridLayout>
  );
};

export const Sections = () => {
  return (
    <GridLayout
      columns={4}
      style={{ width: "calc(var(--salt-size-base) * 20)" }}
    >
      <GridItem colSpan={2}>
        <FormField>
          <FormFieldLabel>Expected total annual volumes</FormFieldLabel>
          <Input placeholder="e.g., 100000" />
        </FormField>
      </GridItem>
      <GridItem colSpan={2} />
      <GridItem colSpan={2}>
        <FormField>
          <FormFieldLabel>Expected total annual values</FormFieldLabel>
          <StackLayout direction="row" align="center">
            <Input placeholder="e.g., 100000" />
            <Text style={{ whiteSpace: "nowrap" }}>US Dollar</Text>
          </StackLayout>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <div
          style={{
            borderBottom:
              "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-secondary-borderColor)",
          }}
        />
      </GridItem>
      <GridItem colSpan={2}>
        <FormField>
          <FormFieldLabel>Client directed request?</FormFieldLabel>
          <RadioButtonGroup direction="horizontal">
            <RadioButton label="Yes" value="yes" />
            <RadioButton label="No" value="no" />
          </RadioButtonGroup>
        </FormField>
      </GridItem>
      <GridItem colSpan={3} />
      <GridItem colSpan={2}>
        <FormField>
          <FormFieldLabel>Expected total annual volumes</FormFieldLabel>
          <Input placeholder="e.g., 100000" />
        </FormField>
      </GridItem>
      <GridItem colSpan={3}>
        <FormField>
          <FormFieldLabel>Service description</FormFieldLabel>
          <Dropdown>
            <Option value="Value">Value</Option>
          </Dropdown>
          <FormFieldHelperText>
            Description of the services that are being requested
          </FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <div
          style={{
            borderBottom:
              "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-secondary-borderColor)",
          }}
        />
      </GridItem>
    </GridLayout>
  );
};

export const SecondaryField = () => {
  const [value, setValue] = useState<string>("Value text");
  const [isError, setIsError] = useState<boolean>(false);
  const MAX_CHARS = 1000;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setValue(newVal);
    setIsError(newVal.length > MAX_CHARS);
  };

  return (
    <GridLayout
      columns={4}
      style={{ width: "calc(var(--salt-size-base) * 12)" }}
    >
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Input variant="secondary" defaultValue="Value text" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Dropdown variant="secondary" defaultSelected={["Value text"]}>
            <Option value="Value text">Value text</Option>
          </Dropdown>
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <MultilineInput
            variant="secondary"
            bordered
            endAdornment={
              <Label variant={!isError ? "secondary" : "primary"}>
                {!isError && `${value.length}/${MAX_CHARS}`}
                {isError && <strong>{`${value.length}/${MAX_CHARS}`}</strong>}
              </Label>
            }
            onChange={handleChange}
            value={value}
            validationStatus={isError ? "error" : undefined}
          />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
    </GridLayout>
  );
};

export const SecondaryBackground = () => {
  const [value, setValue] = useState<string>("Value text");
  const [isError, setIsError] = useState<boolean>(false);
  const MAX_CHARS = 1000;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setValue(newVal);
    setIsError(newVal.length > MAX_CHARS);
  };

  return (
    <GridLayout
      columns={4}
      style={{
        padding: "var(--salt-spacing-300)",
        backgroundColor: "var(--salt-container-secondary-background)",
        width: "calc(var(--salt-size-base) * 12)",
      }}
    >
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Input defaultValue="Value text" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Dropdown defaultSelected={["Value text"]}>
            <Option value="Value text">Value text</Option>
          </Dropdown>
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <MultilineInput
            bordered
            endAdornment={
              <Label variant={!isError ? "secondary" : "primary"}>
                {!isError && `${value.length}/${MAX_CHARS}`}
                {isError && <strong>{`${value.length}/${MAX_CHARS}`}</strong>}
              </Label>
            }
            onChange={handleChange}
            value={value}
            validationStatus={isError ? "error" : undefined}
          />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
    </GridLayout>
  );
};

export const Compact = () => {
  return (
    <StackLayout gap={1} style={{ width: "calc(var(--salt-size-base) * 12)" }}>
      <FormField labelPlacement="right">
        <FormFieldLabel>Label</FormFieldLabel>
        <Dropdown variant="secondary" defaultSelected={["Value text"]}>
          <Option value="Value text">Value text</Option>
        </Dropdown>
      </FormField>
      <FormField labelPlacement="right">
        <FormFieldLabel>Label</FormFieldLabel>
        <Dropdown variant="secondary" defaultSelected={["Value text"]}>
          <Option value="Value text">Value text</Option>
        </Dropdown>
      </FormField>
      <FormField labelPlacement="right">
        <FormFieldLabel>Label</FormFieldLabel>
        <Dropdown variant="secondary" defaultSelected={["Value text"]}>
          <Option value="Value text">Value text</Option>
        </Dropdown>
      </FormField>
      <FormField labelPlacement="right">
        <FormFieldLabel>Label</FormFieldLabel>
        <Dropdown variant="secondary" defaultSelected={["Value text"]}>
          <Option value="Value text">Value text</Option>
        </Dropdown>
      </FormField>
    </StackLayout>
  );
};

const projectFields = [
  {
    name: "projectName",
    label: "Project name",
    error: "Enter a project name.",
  },
  {
    name: "projectOwner",
    label: "Project owner",
    error: "Enter the name of the project owner.",
  },
  {
    name: "costCentre",
    label: "Cost centre",
    error: "Enter a cost centre.",
  },
] as const;

type ProjectFieldName = (typeof projectFields)[number]["name"];

export const ErrorSummary = () => {
  const id = useId();
  const { announce } = useAriaAnnouncer();
  const inputRefs = useRef<
    Partial<Record<ProjectFieldName, HTMLInputElement | null>>
  >({});
  const [values, setValues] = useState({
    projectName: "",
    projectOwner: "",
    costCentre: "",
  });
  const [submission, setSubmission] = useState<{
    firstInvalid: ProjectFieldName | undefined;
  }>();
  const [isSuccessful, setIsSuccessful] = useState(false);
  const invalidFields = projectFields.filter(
    ({ name }) => !values[name].trim(),
  );
  const errors = submission ? invalidFields : [];

  // Focus after the field's error message and aria-invalid are committed.
  useEffect(() => {
    if (submission?.firstInvalid) {
      inputRefs.current[submission.firstInvalid]?.focus();
    }
  }, [submission]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmission({ firstInvalid: invalidFields[0]?.name });
    setIsSuccessful(invalidFields.length === 0);
    announce(
      invalidFields.length > 0
        ? `${invalidFields.length} ${invalidFields.length === 1 ? "field needs" : "fields need"} attention. An error summary appears above the fields.`
        : "The form is valid. No data was submitted.",
      { ariaLive: "polite" },
    );
  };

  return (
    <StackLayout
      as="form"
      noValidate
      onSubmit={handleSubmit}
      aria-label="Project details"
      style={{ width: "100%", maxWidth: "calc(var(--salt-size-base) * 14)" }}
    >
      {errors.length > 0 && (
        <Banner status="error" role="region" aria-labelledby={`${id}-errors`}>
          <BannerContent>
            <strong id={`${id}-errors`}>Review the following details</strong>
            <ul>
              {errors.map(({ name, label, error }) => (
                <li key={name}>
                  <Link
                    href={`#${id}-${name}`}
                    onClick={(event) => {
                      event.preventDefault();
                      inputRefs.current[name]?.focus();
                    }}
                  >
                    {label}: {error}
                  </Link>
                </li>
              ))}
            </ul>
          </BannerContent>
        </Banner>
      )}
      {projectFields.map(({ name, label, error }) => {
        const isInvalid = errors.some((field) => field.name === name);
        return (
          <FormField
            key={name}
            necessity="required"
            validationStatus={isInvalid ? "error" : undefined}
          >
            <FormFieldLabel>{label}</FormFieldLabel>
            <Input
              id={`${id}-${name}`}
              name={name}
              value={values[name]}
              inputRef={(input) => {
                inputRefs.current[name] = input;
              }}
              inputProps={{
                "aria-invalid": isInvalid,
                onChange: (event) => {
                  const value = event.currentTarget.value;
                  setValues((previous) => ({ ...previous, [name]: value }));
                  setIsSuccessful(false);
                },
              }}
            />
            {isInvalid && <FormFieldHelperText>{error}</FormFieldHelperText>}
          </FormField>
        );
      })}
      <Button
        type="submit"
        sentiment="accented"
        style={{ alignSelf: "flex-end" }}
      >
        Submit
      </Button>
      {isSuccessful && (
        <Banner status="success">
          <BannerContent>
            The form is valid. No data was submitted.
          </BannerContent>
        </Banner>
      )}
    </StackLayout>
  );
};
