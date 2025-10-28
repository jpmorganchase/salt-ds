import {
  Card,
  ComboBox,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Option,
  StackLayout,
} from "@salt-ds/core";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type ReactElement,
  type SyntheticEvent,
  useState,
} from "react";

const people = Array.from({ length: 50 }, (_, i) => ({
  name: `Person ${i + 1}`,
  email: `person${i + 1}@example.com`,
}));

const delimiter = ";";

export const Delimiter = (): ReactElement => {
  const [value, setValue] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value.includes(delimiter)) {
      const newItems = value.split(delimiter).filter(Boolean);
      setSelectedValues((old) => old.concat(newItems));
      setValue("");
      return;
    }

    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[],
  ) => {
    const removed = selectedValues.filter((v) => !newSelected.includes(v));
    setSelectedValues(newSelected);

    if ("key" in event && event.key === "Backspace") {
      setValue(removed[0]);
    } else {
      setValue("");
    }
  };

  const handlePaste = (event: ClipboardEvent) => {
    event?.preventDefault();
    // This can be changed to support different delimiters
    const newItems = event.clipboardData
      .getData("Text")
      .trim()
      .split(delimiter);
    setSelectedValues((old) => old.concat(newItems));
  };

  return (
    <StackLayout>
      <Card>
        Example text to copy:
        <br />
        <br />
        person1@example.com;person2@example.com;person3@example.com
      </Card>
      <FormField>
        <FormFieldLabel>Team members</FormFieldLabel>
        <ComboBox
          multiselect
          onChange={handleChange}
          onSelectionChange={handleSelectionChange}
          selected={selectedValues}
          value={value}
          style={{ width: "266px" }}
          onPaste={handlePaste}
        >
          {people
            .filter(
              (person) =>
                person.name
                  .toLowerCase()
                  .includes(value.trim().toLowerCase()) ||
                person.email.toLowerCase().includes(value.trim().toLowerCase()),
            )
            .map((person) => (
              <Option value={person.email} key={person.email}>
                {person.name} ({person.email})
              </Option>
            ))}
        </ComboBox>
        <FormFieldHelperText>
          Enter one or more email addresses. Separate each entry with a
          semicolon (;).
        </FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};
