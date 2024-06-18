import {
  ComboBox,
  ComboBoxProps,
  Option,
  StackLayout,
  Text,
  capitalize,
  OptionGroup,
  Button,
} from "@salt-ds/core";
import {
  ChangeEvent,
  SyntheticEvent,
  useMemo,
  useState,
  useDeferredValue,
} from "react";
import useSWR from "swr";
import { SearchIndex, useSearchIndex } from "@jpmorganchase/mosaic-store";
import { performSearch } from "./searchUtils";
import styles from "./Search.module.css";
import { CloseIcon, SearchIcon } from "@salt-ds/icons";
import { useRouter } from "next/navigation";

function SearchResult({
  result,
}: {
  result: { title: string; content: string; route: string };
}) {
  return (
    <Option className={styles.result} value={result.route}>
      <StackLayout gap={0.5} align="start">
        <Text>{result.title}</Text>
        {result.content && (
          <Text styleAs="label" color="secondary">
            <span dangerouslySetInnerHTML={{ __html: result.content }} />
          </Text>
        )}
      </StackLayout>
    </Option>
  );
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function useSearchData() {
  const { searchIndex: fallbackIndex, searchConfig } = useSearchIndex();

  const {
    data,
    error,
    isLoading: searchIsLoading,
  } = useSWR<SearchIndex, Error>("/search-data.json", fetcher);

  const searchIndex = searchIsLoading || error ? fallbackIndex : data;

  return { searchIndex, searchConfig };
}

export function Search(props: ComboBoxProps) {
  const router = useRouter();
  const { searchIndex, searchConfig } = useSearchData();
  const [value, setValue] = useState("");
  const query = useDeferredValue(value);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (_event: SyntheticEvent, route: string[]) => {
    setValue("");
    router.push(route[0]);
  };

  const results = useMemo(() => {
    const data = searchIndex
      ? performSearch(searchIndex, query, {
          ...searchConfig,
          minMatchCharLength: 3,
          threshold: 0,
          keys: [{ name: "title", weight: 5 }, "content", "route"],
        })
      : [];

    return data.reduce((acc, option) => {
      const category = capitalize(
        option.route.split("/")[2].split("-").join(" ")
      );
      if (
        !(
          option.route.endsWith("accessibility") ||
          option.route.endsWith("examples") ||
          option.route.endsWith("usage")
        )
      ) {
        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push(option);
      }
      return acc;
    }, {} as Record<string, typeof data>);
  }, [searchConfig, searchIndex, query]);

  return (
    <ComboBox
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      startAdornment={<SearchIcon />}
      endAdornment={
        value && (
          <Button
            aria-label="Clear search"
            variant="secondary"
            onClick={() => setValue("")}
          >
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      value={value}
      {...props}
    >
      {Object.entries(results).length === 0 && query.length > 2 ? (
        <div
          className={styles.statusOption}
          role="option"
          aria-selected="false"
        >
          No results found for &quot;{query}&quot;
        </div>
      ) : (
        Object.entries(results).map(([category, results], index) => (
          <OptionGroup label={category} key={index}>
            {results.slice(0, 5).map((result, index) => (
              <SearchResult result={result} key={index} />
            ))}
          </OptionGroup>
        ))
      )}
    </ComboBox>
  );
}
