import {
  Button,
  Checkbox,
  CheckboxGroup,
  FlexItem,
  FlowLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
  StatusIndicator,
  Text,
} from "@salt-ds/core";
import { CloseIcon, type IconProps, SearchIcon } from "@salt-ds/icons";
import {
  type ChangeEvent,
  type ForwardRefExoticComponent,
  type RefAttributes,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./IconPreview.module.css";

type IconSynonym = {
  iconName: string;
  synonym: string[];
  category: string;
};

type IconData = {
  componentName: string;
  Component: ForwardRefExoticComponent<
    IconProps & RefAttributes<SVGSVGElement>
  >;
} & IconSynonym;

const isIconNameMatch = (componentName: string, figmaIconName: string) => {
  const regex = new RegExp(
    `^${figmaIconName.replace(/-/g, "")}(Solid)?Icon$`,
    "i",
  );
  return regex.test(componentName);
};

export function IconPreview() {
  const [allIcons, setAllIcons] = useState<IconData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const module = await import("./allIconsList");
      const iconSynonymData = (await import("./salt-icon-synonym.json"))
        .default as IconSynonym[];

      const icons = [];

      for (const [name, Icon] of Object.entries(module.allIcons)) {
        // Icon component name is pascal case, iconName from Figma is kebab

        const synonymMatch = iconSynonymData.find((item) =>
          isIconNameMatch(name, item.iconName),
        );

        if (!synonymMatch) {
          console.warn("Can't match icon name with synonym data", name);
        }

        icons.push({
          componentName: name,
          Component: Icon,
          ...(synonymMatch ?? { iconName: name, synonym: [], category: "" }),
        } as IconData);
      }

      setAllIcons(icons);
    };

    void fetchData();
  }, []);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(
    search.toLowerCase().replaceAll(/\s/g, ""),
  );
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
    return allIcons.filter(({ componentName: name, synonym }) => {
      const iconNameToMatch = name.toLowerCase();
      const matchesSearch = [iconNameToMatch, ...synonym].some((word) =>
        word.includes(deferredSearch),
      );
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
            {filteredIcons.map(({ componentName: name, Component: Icon }) => (
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

  const totalCount = Object.entries(allIcons).length;

  return (
    <StackLayout className={styles.root} gap={1}>
      <FlowLayout justify="space-between">
        <FlexItem>
          <FormField>
            <FormFieldLabel>Search icons</FormFieldLabel>
            <Input
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
          </FormField>
        </FlexItem>

        <FlexItem>
          <FormField>
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
      </FlowLayout>

      <div className={styles.resultContainer}>{renderIcons}</div>

      <Text styleAs="label" color="secondary">
        Total icons:{totalCount}.
        {totalCount > filteredIcons.length
          ? ` Filtered: ${filteredIcons.length}.`
          : null}
      </Text>
    </StackLayout>
  );
}
