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
  capitalize,
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

function groupByCategory(data: IconData[]) {
  return data.reduce(
    (acc, option) => {
      const groupName = option.category;
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(option);
      return acc;
    },
    {} as Record<string, IconData[]>,
  );
}

function useIconData() {
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
          ...(synonymMatch ?? {
            iconName: name,
            synonym: [],
            category: "deprecated",
          }),
        } as IconData);
      }

      setAllIcons(
        icons.sort((a, b) => {
          if (a.category === "deprecated" && b.category !== "deprecated") {
            return 1; // Move deprecated icons to the end
          }
          if (b.category === "deprecated" && a.category !== "deprecated") {
            return -1; // Move deprecated icons to the end
          }

          return a.category.localeCompare(b.category);
        }),
      );
    };

    void fetchData();
  }, []);

  return allIcons;
}

export function IconPreview() {
  const allIcons = useIconData();

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

  const [filteredIcons, filteredCount] = useMemo(() => {
    const filtered = allIcons.filter(
      ({ componentName: name, synonym, category }) => {
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
      },
    );

    return [groupByCategory(filtered), filtered.length];
  }, [deferredSearch, variants, allIcons]);

  const renderIcons = useMemo(() => {
    if (Object.keys(filteredIcons).length > 0) {
      return (
        <div className={styles.gridContainer}>
          {Object.entries(filteredIcons).map(([category, icons]) => (
            <StackLayout key={category} gap={0}>
              <Text
                styleAs="h3"
                color="secondary"
                className={styles.categoryTitle}
              >
                {capitalize(category)}
              </Text>
              <FlowLayout justify="start" gap={1}>
                {icons.map(({ componentName: name, Component: Icon }) => (
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
            </StackLayout>
          ))}
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
          {deferredSearch && (
            <Text>
              No icons found for the search term: "
              <strong>{deferredSearch}</strong>"
            </Text>
          )}
        </StackLayout>
      </StackLayout>
    );
  }, [filteredIcons, deferredSearch]);

  const totalCount = Object.entries(allIcons).length;

  return (
    <StackLayout className={styles.root} gap={3}>
      <FlowLayout justify="space-between">
        <FlexItem>
          <FormField>
            <FormFieldLabel>Search icons</FormFieldLabel>
            <Input
              bordered
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
    </StackLayout>
  );
}
