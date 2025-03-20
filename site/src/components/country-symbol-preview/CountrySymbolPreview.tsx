import {
  Button,
  FlexItem,
  FlexLayout,
  FlowLayout,
  Input,
  StackLayout,
  StatusIndicator,
  Text,
} from "@salt-ds/core";
import {
  type LazyCountrySymbolProps,
  countryMetaMap,
} from "@salt-ds/countries";
import { CloseIcon, SearchIcon } from "@salt-ds/icons";
import dynamic from "next/dynamic";
import {
  type ChangeEvent,
  Suspense,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import styles from "./CountrySymbolPreview.module.css";

const LazyCountrySymbol = dynamic<LazyCountrySymbolProps>(() =>
  import("@salt-ds/countries").then((mod) => mod.LazyCountrySymbol),
);

export const CountrySymbolPreview = () => {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.toLowerCase());

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleClear = () => {
    setSearch("");
  };

  const filteredSymbols = useMemo(() => {
    return Object.values(countryMetaMap).filter(
      ({ countryCode, countryName }) =>
        countryCode.toLowerCase().includes(deferredSearch) ||
        countryName.toLowerCase().includes(deferredSearch),
    );
  }, [deferredSearch]);

  const renderSymbols = useMemo(() => {
    if (filteredSymbols.length > 0) {
      return (
        <FlowLayout justify="start" gap={1}>
          {filteredSymbols.map(({ countryCode, countryName }) => (
            <StackLayout
              style={{ width: 140 }}
              gap={1}
              align="center"
              key={countryCode}
            >
              <LazyCountrySymbol code={countryCode} size={1} />
              <StackLayout gap={0} align="center">
                <Text>{countryCode}</Text>
                <Text style={{ textAlign: "center" }}>{countryName}</Text>
              </StackLayout>
            </StackLayout>
          ))}
        </FlowLayout>
      );
    }
    return (
      <StackLayout className={styles.notFound} gap={3} align="center">
        <StatusIndicator status="info" size={2} />
        <StackLayout gap={1} align="center">
          <Text styleAs="h4">
            <strong>No country symbols found</strong>
          </Text>
          <Text>
            No country symbols found for the search term: "
            <strong>{deferredSearch}</strong>"
          </Text>
        </StackLayout>
      </StackLayout>
    );
  }, [filteredSymbols, deferredSearch]);

  return (
    <Suspense fallback="Loading...">
      <StackLayout className={styles.root} gap={1}>
        <FlexLayout direction="row">
          <FlexItem>
            <Input
              placeholder="Search country symbols"
              aria-label="Search country symbols"
              value={search}
              onChange={handleSearch}
              className={styles.search}
              startAdornment={<SearchIcon />}
              endAdornment={
                search ? (
                  <Button
                    onClick={handleClear}
                    appearance="transparent"
                    sentiment="neutral"
                    aria-label="Clear search"
                  >
                    <CloseIcon aria-hidden />
                  </Button>
                ) : null
              }
            />
          </FlexItem>
          <FlexItem className={styles.formfield}>
            <Text className={styles.symbolCount}>
              Symbol Count: {filteredSymbols.length}
            </Text>
          </FlexItem>
        </FlexLayout>
        <div className={styles.symbolsContainer}>{renderSymbols}</div>
      </StackLayout>
    </Suspense>
  );
};
