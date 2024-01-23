import { ChangeEvent, ReactElement, SyntheticEvent, useState } from "react";
import { ComboBoxNext, Option } from "@salt-ds/lab";
import useSWR from "swr";
import { Spinner } from "@salt-ds/core";
import cslx from "clsx";
import styles from "./index.module.css";

const fetcher = async (url: string, filter: string) => {
  // Sleep for 1 second to highlight to loading state
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const rawData = await fetch(url);
  const data = (await rawData.json()) as string[];
  return data.filter((state) =>
    state.toLowerCase().includes(filter.trim().toLowerCase())
  );
};

export const ServerSideData = (): ReactElement => {
  const [value, setValue] = useState("");
  const { data, isLoading } = useSWR<string[]>(
    `/example-data/states.json?s=${value}`,
    (url: string) => fetcher(url, value),
    {
      fallbackData: [],
    }
  );

  const loading = isLoading;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  return (
    <ComboBoxNext
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: "266px" }}
      endAdornment={loading && <Spinner size="small" />}
    >
      {!loading ? (
        data?.map((color) => (
          <Option value={color} key={color}>
            {color}
          </Option>
        ))
      ) : (
        <div
          className={styles.statusOption}
          role="option"
          aria-selected="false"
        >
          Loading...
        </div>
      )}
    </ComboBoxNext>
  );
};
