import {
  ComboBox,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Option,
  Spinner,
  Text,
} from "@salt-ds/core";
import {
  type ChangeEvent,
  type ReactElement,
  type SyntheticEvent,
  useState,
} from "react";
import useSWR from "swr";

const fetcher = async (url: string, filter: string) => {
  // Delay for 1 second to demonstrate the loading state.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const rawData = await fetch(url);
  if (!rawData.ok) {
    throw new Error("Unable to load states");
  }
  const data = (await rawData.json()) as string[];
  return data.filter((state) =>
    state.toLowerCase().includes(filter.trim().toLowerCase()),
  );
};

export const ServerSideData = (): ReactElement => {
  const [value, setValue] = useState("");
  const minLengthIsMet = value.length > 2;
  const { data, error, isLoading } = useSWR<string[]>(
    minLengthIsMet ? `/example-data/states.json?s=${value}` : null,
    (url: string) => fetcher(url, value),
    {
      fallbackData: [],
    },
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    _event: SyntheticEvent,
    newSelected: string[],
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  const options = minLengthIsMet && !isLoading && !error ? (data ?? []) : [];
  const status = !minLengthIsMet
    ? ""
    : isLoading
      ? "Loading states..."
      : error
        ? "States could not be loaded. Please try again."
        : options.length === 0
          ? "No results found"
          : `${options.length} ${options.length === 1 ? "state" : "states"} available`;

  return (
    <FormField style={{ width: "266px" }}>
      <FormFieldLabel>State</FormFieldLabel>
      <ComboBox
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        value={value}
        inputProps={{ "aria-autocomplete": "list" }}
        OverlayProps={{ "aria-label": "States" }}
        endAdornment={isLoading && <Spinner size="small" aria-hidden />}
      >
        {options.map((state) => (
          <Option value={state} key={state} />
        ))}
      </ComboBox>
      <FormFieldHelperText>
        Please enter more than 2 characters to search.
      </FormFieldHelperText>
      <Text role="status" styleAs="label" color="secondary">
        {status}
      </Text>
    </FormField>
  );
};
