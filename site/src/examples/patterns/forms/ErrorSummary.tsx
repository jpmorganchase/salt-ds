import {
  Banner,
  BannerContent,
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  Link,
  StackLayout,
  useAriaAnnouncer,
  useId,
} from "@salt-ds/core";
import { type FormEvent, useEffect, useRef, useState } from "react";

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
                "aria-invalid": isInvalid || undefined,
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
