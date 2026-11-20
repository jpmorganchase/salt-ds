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

const findPerson = (entry: string) => {
  const query = entry.trim().toLowerCase();
  return people.find(
    (person) =>
      person.email.toLowerCase() === query ||
      person.name.toLowerCase() === query,
  );
};

export const Delimiter = (): ReactElement => {
  const [value, setValue] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // Selects the entries that match a person and returns the ones that don't,
  // so they stay in the input and can be corrected.
  const selectEntries = (entries: string[]) => {
    const matched: string[] = [];
    const unmatched: string[] = [];
    for (const entry of entries) {
      const person = findPerson(entry);
      if (person) {
        matched.push(person.email);
      } else if (entry.trim()) {
        unmatched.push(entry);
      }
    }
    setSelectedValues((old) => Array.from(new Set([...old, ...matched])));
    return unmatched;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (!value.includes(delimiter)) {
      setValue(value);
      return;
    }

    const entries = value.split(delimiter);
    // The text after the last delimiter is still being typed.
    const inProgress = entries.pop() ?? "";
    setValue([...selectEntries(entries), inProgress].join(delimiter));
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");

    if (!pasted.includes(delimiter)) {
      return;
    }

    event.preventDefault();
    const { selectionStart, selectionEnd } = event.currentTarget;
    const text =
      value.slice(0, selectionStart ?? value.length) +
      pasted +
      value.slice(selectionEnd ?? value.length);
    setValue(selectEntries(text.split(delimiter)).join(delimiter));
  };

  const handleSelectionChange = (
    _event: SyntheticEvent,
    newSelected: string[],
  ) => {
    // Clear the entry being typed when an option is selected, but keep any
    // unmatched entries. Removing a pill keeps all typed text.
    if (newSelected.length > selectedValues.length) {
      setValue(value.slice(0, value.lastIndexOf(delimiter) + 1));
    }
    setSelectedValues(newSelected);
  };

  const query = (value.split(delimiter).pop() ?? "").trim().toLowerCase();

  return (
    <StackLayout>
      <Card>
        Example text to copy:
        <br />
        <br />
        person1@example.com;Person 2;person3@example.com
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
          inputProps={{ onPaste: handlePaste }}
        >
          {people
            .filter(
              (person) =>
                person.name.toLowerCase().includes(query) ||
                person.email.toLowerCase().includes(query),
            )
            .map((person) => (
              <Option value={person.email} key={person.email}>
                {person.name} ({person.email})
              </Option>
            ))}
        </ComboBox>
        <FormFieldHelperText>
          Enter one or more names or email addresses. Separate each entry with a
          semicolon (;).
        </FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};
