import {
  Button,
  FlexItem,
  FlexLayout,
  FlowLayout,
  FormField,
  FormFieldLabel,
  Input,
  SaltProvider,
  StackLayout,
  StatusIndicator,
  Switch,
  Text,
} from "@salt-ds/core";
import { CloseIcon, SearchIcon } from "@salt-ds/icons";
import { type ChangeEvent, useDeferredValue, useMemo, useState } from "react";
import styles from "./IconPreview.module.css";
import { allIcons } from "./allIconsList";

export function IconPreview() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.toLowerCase());
  const [showOutlineGroup, setShowOutlineGroup] = useState(true);
  const [showSolidGroup, setShowSolidGroup] = useState(true);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleClear = () => {
    setSearch("");
  };

  const handleShowSolidGroupChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowSolidGroup(event.target.checked);
  };

  const handleShowOutlineGroupChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setShowOutlineGroup(event.target.checked);
  };

  const filteredIcons = useMemo(() => {
    return Object.entries(allIcons).filter(([name]) => {
      const matchesSearch = name.toLowerCase().includes(deferredSearch);
      const isOutlineIcon = !name.endsWith("SolidIcon");
      const isSolidIcon = name.endsWith("SolidIcon");
      return (
        matchesSearch &&
        ((showOutlineGroup && isOutlineIcon) || (showSolidGroup && isSolidIcon))
      );
    });
  }, [deferredSearch, showOutlineGroup, showSolidGroup]);

  const renderIcons = useMemo(() => {
    if (filteredIcons.length > 0) {
      return (
        <FlowLayout justify="start" gap={1}>
          {filteredIcons.map(([name, Icon]) => (
            <StackLayout
              align="center"
              key={name}
              gap={1}
              className={styles.iconCard}
            >
              <div className={styles.iconContainer}>
                <Icon size={1} />
              </div>
              <Text
                className={styles.iconName}
                color="secondary"
                styleAs="label"
              >
                {name.replace(/([A-Z])/g, " $1")}
              </Text>
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
            <strong>No icons found</strong>
          </Text>
          <Text>
            No icons found for the search term: "
            <strong>{deferredSearch}</strong>"
          </Text>
        </StackLayout>
      </StackLayout>
    );
  }, [filteredIcons, deferredSearch]);

  return (
    <StackLayout className={styles.root} gap={1}>
      <FlexLayout>
        <FlexItem>
          <Input
            placeholder="Search icons"
            aria-label="Search icons"
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
        <FlexItem>
          <FormField labelPlacement="left" className={styles.formfield}>
            <FormFieldLabel>Show Solid</FormFieldLabel>
            <Switch
              onChange={handleShowSolidGroupChange}
              checked={showSolidGroup}
            />
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField labelPlacement="left" className={styles.formfield}>
            <FormFieldLabel>Show Outline</FormFieldLabel>
            <Switch
              onChange={handleShowOutlineGroupChange}
              checked={showOutlineGroup}
            />
          </FormField>
        </FlexItem>
        <FlexItem className={styles.formfield}>
          <Text className={styles.iconCount}>
            Icon Count: {filteredIcons.length}
          </Text>
        </FlexItem>
      </FlexLayout>
      <SaltProvider density="medium">{renderIcons}</SaltProvider>
    </StackLayout>
  );
}
