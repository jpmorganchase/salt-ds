import {
  ComboBox,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Option,
  Spinner,
} from "@salt-ds/core";
import {
  type ChangeEvent,
  type ReactElement,
  type SyntheticEvent,
  useState,
} from "react";
import useSWR from "swr";
import styles from "./index.module.css";

const fetcher = async (url: string, filter: string) => {
  // Sleep for 1 second to highlight to loading state
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const rawData = await fetch(url);
  const data = (await rawData.json()) as string[];
  return data.filter((state) =>
    state.toLowerCase().includes(filter.trim().toLowerCase()),
  );
};

export const ServerSideData = (): ReactElement => {
  const [value, setValue] = useState("");
  const minLengthIsMet = value.length > 2;
  const { data, isLoading } = useSWR<string[]>(
    minLengthIsMet ? `/example-data/states.json?s=${value}` : null,
    (url: string) => fetcher(url, value),
    {
      fallbackData: [],
    },
  );

  const loading = isLoading;

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

  const hasResults = Array.isArray(data) && data.length > 0;

  return (
    <FormField style={{ width: "266px" }}>
      <FormFieldLabel>State</FormFieldLabel>
      <ComboBox
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        value={value}
        endAdornment={loading && <Spinner size="small" />}
      >
        {!loading && hasResults
          ? data?.map((state) => <Option value={state} key={state} />)
          : null}
        {!loading && !hasResults && minLengthIsMet ? (
          <div
            className={styles.statusOption}
            role="option"
            aria-selected="false"
          >
            No results found
          </div>
        ) : null}
        {loading ? (
          <div
            className={styles.statusOption}
            role="option"
            aria-selected="false"
          >
            Loading...
          </div>
        ) : null}
      </ComboBox>
      <FormFieldHelperText>
        Please enter more than 2 characters to search.
      </FormFieldHelperText>
    </FormField>
  );
};
