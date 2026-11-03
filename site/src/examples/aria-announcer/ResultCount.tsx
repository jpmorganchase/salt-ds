import {
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

const currencies = [
  "Australian dollar",
  "Brazilian real",
  "British pound",
  "Canadian dollar",
  "Euro",
  "Hong Kong dollar",
  "Japanese yen",
  "Swiss franc",
  "US dollar",
];

// Match the start of any word, ignoring case.
const filterCurrencies = (query: string) => {
  const normalized = query.trim().toLowerCase();
  return currencies.filter((currency) =>
    currency
      .toLowerCase()
      .split(" ")
      .some((word) => word.startsWith(normalized)),
  );
};

const describeCount = (count: number) => {
  if (count === 0) return "No currencies match";
  return count === 1 ? "1 currency" : `${count} currencies`;
};

export const ResultCount = (): ReactElement => {
  const [query, setQuery] = useState("");
  // Announce once typing pauses, not after every keystroke.
  const { announce } = useAriaAnnouncer({ debounce: 500 });
  const matches = filterCurrencies(query);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    announce(describeCount(filterCurrencies(value).length));
  };

  return (
    <StackLayout gap={1} style={{ width: 256 }}>
      <FormField>
        <FormFieldLabel>Filter currencies</FormFieldLabel>
        <Input value={query} onChange={handleChange} />
      </FormField>
      <Text color="secondary">{describeCount(matches.length)}</Text>
      {matches.length > 0 && (
        <StackLayout as="ul" gap={0.5} style={{ margin: 0, padding: 0 }}>
          {matches.map((currency) => (
            <Text as="li" key={currency}>
              {currency}
            </Text>
          ))}
        </StackLayout>
      )}
    </StackLayout>
  );
};
