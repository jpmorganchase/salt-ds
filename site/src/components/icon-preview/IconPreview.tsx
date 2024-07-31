import {
  Button,
  FlowLayout,
  Input,
  SaltProvider,
  SplitLayout,
  StackLayout,
  StatusIndicator,
  Text,
} from "@salt-ds/core";
import { CloseIcon, SearchIcon } from "@salt-ds/icons";
import { type ChangeEvent, useDeferredValue, useMemo, useState } from "react";
import styles from "./IconPreview.module.css";
import { allIcons } from "./allIconsList";

export function IconPreview() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [actualSize, setActualSize] = useState(false);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleClear = () => {
    setSearch("");
  };

  const handleActualSizeToggle = (event: ChangeEvent<HTMLInputElement>) => {
    setActualSize(event.target.checked);
  };

  const filteredIcons = useMemo(
    () =>
      Object.entries(allIcons).filter(([name]) =>
        new RegExp(deferredSearch, "i").test(name),
      ),
    [deferredSearch],
  );

  return (
    <StackLayout className={styles.root} gap={1}>
      <SplitLayout
        className={styles.toolbar}
        startItem={
          <Input
            placeholder="Search icons"
            aria-label="Search icons"
            value={search}
            onChange={handleSearch}
            className={styles.search}
            startAdornment={<SearchIcon />}
            endAdornment={
              search.length > 0 && (
                <Button
                  onClick={handleClear}
                  variant="secondary"
                  aria-label="Clear search"
                >
                  <CloseIcon aria-hidden />
                </Button>
              )
            }
          />
        }
        align="center"
      />
      <SaltProvider density="medium">
        {filteredIcons.length > 0 && (
          <FlowLayout gap={1}>
            {filteredIcons.map(([name, Icon]) => {
              return (
                <StackLayout
                  align="center"
                  key={name}
                  gap={1}
                  className={styles.iconCard}
                >
                  <div className={styles.iconContainer}>
                    <Icon size={actualSize ? 1 : 2} />
                  </div>
                  <Text
                    className={styles.iconName}
                    color="secondary"
                    styleAs="label"
                  >
                    {name.replaceAll(/([A-Z])/g, " $1")}
                  </Text>
                </StackLayout>
              );
            })}
          </FlowLayout>
        )}
        {filteredIcons.length === 0 && (
          <StackLayout className={styles.notFound} gap={3} align="center">
            <StatusIndicator status="info" size={2} />
            <StackLayout gap={1} align="center">
              <Text styleAs="h4">
                <strong>No icons found</strong>
              </Text>
              <Text>
                No icons found for the search term: "
                <strong>{deferredSearch}</strong>"
              </Text>
            </StackLayout>
          </StackLayout>
        )}
      </SaltProvider>
    </StackLayout>
  );
}
