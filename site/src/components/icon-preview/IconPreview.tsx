import {
  Button,
  Checkbox,
  CheckboxGroup,
  FlexItem,
  FlexLayout,
  FlowLayout,
  FormField,
  FormFieldLabel,
  Input,
  SaltProvider,
  StackLayout,
  StatusIndicator,
  Text,
} from "@salt-ds/core";
import { CloseIcon, SearchIcon } from "@salt-ds/icons";
import {
  type ChangeEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./IconPreview.module.css";

export function IconPreview() {
  const [allIcons, setAllIcons] = useState<Record<string, any>>({});

  useEffect(() => {
    import("./allIconsList").then((module) => setAllIcons(module.allIcons));
  }, []);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.toLowerCase());
  const [variants, setVariants] = useState<("solid" | "outline")[]>([
    "solid",
    "outline",
  ]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleClear = () => {
    setSearch("");
  };

  const handleVariantChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVariants((prevVariants) => {
      const { value, checked } = event.target;
      if (checked) {
        return [...prevVariants, value as "solid" | "outline"];
      }
      return prevVariants.filter((variant) => variant !== value);
    });
  };

  const filteredIcons = useMemo(() => {
    return Object.entries(allIcons).filter(([name]) => {
      const matchesSearch = name.toLowerCase().includes(deferredSearch);
      const isOutlineIcon = !name.endsWith("SolidIcon");
      const isSolidIcon = name.endsWith("SolidIcon");
      return (
        matchesSearch &&
        ((variants.includes("outline") && isOutlineIcon) ||
          (variants.includes("solid") && isSolidIcon))
      );
    });
  }, [deferredSearch, variants, allIcons]);

  const renderIcons = useMemo(() => {
    if (filteredIcons.length > 0) {
      return (
        <div className={styles.gridContainer}>
          <FlowLayout justify="start" gap={1}>
            {filteredIcons.map(([name, Icon]) => (
              <StackLayout
                align="center"
                key={name}
                gap={1}
                className={styles.iconCard}
              >
                <div className={styles.iconContainer}>
                  <Icon size={2} />
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
        </div>
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
            <FormFieldLabel>Show variant</FormFieldLabel>
            <CheckboxGroup
              checkedValues={variants}
              onChange={handleVariantChange}
              direction="horizontal"
            >
              <Checkbox value="solid" label="Solid" />
              <Checkbox value="outline" label="Outline" />
            </CheckboxGroup>
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
