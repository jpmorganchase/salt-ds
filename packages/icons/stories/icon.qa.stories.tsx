import {
  Button,
  Checkbox,
  Dropdown,
  Input,
  Option,
  SaltProvider,
  SaltProviderNext,
  StatusIndicator,
  useDensity,
  useTheme,
} from "@salt-ds/core";
import {
  AddDocumentIcon,
  AddDocumentSolidIcon,
  ChevronDownIcon,
  DownloadIcon,
  SearchIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";
import { type CSSProperties, useState } from "react";
import { allIcons } from "./icon.all";
import "@salt-ds/icons/saltIcons.css";
import "./icon.qa.stories.css";
export default {
  title: "Icons/Icon/Icon QA",
  globals: {
    a11y: {
      manual: true,
    },
  },
} as Meta;

const allIconNames = Object.keys(allIcons);

const sizes = [1, 2, 3] as const;
export const IconSizes: StoryFn = () => {
  return (
    <QAContainer height={500} width={1500} cols={4}>
      <AddDocumentIcon size={1} />
      <AddDocumentIcon size={2} />
      <AddDocumentIcon size={3} />
      <AddDocumentIcon size={4} />
    </QAContainer>
  );
};

export const AllIcons: StoryFn = () => {
  return (
    <>
      {sizes.map((size) => (
        <div
          key={size}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(15, auto)",
            gap: 8,
            padding: "12px 0",
          }}
        >
          {Object.entries(allIcons).map(([iconName, IconComponent]) => (
            <IconComponent key={iconName} size={size} />
          ))}
        </div>
      ))}
    </>
  );
};

AllIcons.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CssBackground: StoryFn = () => {
  return (
    <QAContainer
      width={1400}
      itemPadding={12}
      vertical
      itemWidthAuto
      transposeDensity
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(20, auto)",
          gap: 8,
          padding: "12px 0",
        }}
      >
        {allIconNames.map((iconName) =>
          iconName ? (
            <div
              key={iconName}
              className={`should-not-impact saltIcons-${iconName.replace(
                "Icon",
                "",
              )}`}
            />
          ) : null,
        )}
      </div>
    </QAContainer>
  );
};

CssBackground.parameters = {
  chromatic: { disableSnapshot: false },
};

interface ComponentLegibilityArgs {
  strokeWidth: number;
}

const specimenSizes = [12, 16] as const;
const specimenIcons = [
  { name: "Search", component: SearchIcon },
  { name: "Chevron down", component: ChevronDownIcon },
  { name: "Add document", component: AddDocumentIcon },
  { name: "Add document solid", component: AddDocumentSolidIcon },
] as const;
const statuses = ["info", "success", "warning", "error"] as const;

const ComponentLegibilityExample = ({
  strokeWidth,
}: ComponentLegibilityArgs) => {
  const [selected, setSelected] = useState(true);
  const density = useDensity();
  const { mode } = useTheme();
  const strokeStyle = {
    "--salt-size-icon-strokeWidth": strokeWidth,
  } as CSSProperties;

  return (
    <section
      className="iconLegibility"
      aria-label={`${density} density, ${mode} mode`}
      style={strokeStyle}
    >
      <h2 className="iconLegibility-heading">
        {density} density · {mode}
      </h2>
      <div className="iconLegibility-actions">
        <Button>
          <AddDocumentIcon aria-hidden />
          Create document
        </Button>
        <Button appearance="bordered" aria-label="Download document">
          <DownloadIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="Settings" disabled>
          <SettingsIcon aria-hidden />
        </Button>
      </div>
      <div className="iconLegibility-fields">
        <Input
          inputProps={{ "aria-label": "Search documents" }}
          placeholder="Search documents"
          startAdornment={<SearchIcon aria-hidden />}
        />
        <Dropdown
          aria-label="Document type"
          defaultSelected={["All types"]}
          OverlayProps={{ style: strokeStyle }}
        >
          <Option value="All types" />
          <Option value="Reports" />
          <Option value="Invoices" />
        </Dropdown>
      </div>
      <div className="iconLegibility-actions">
        <Checkbox
          label="Selected"
          checked={selected}
          onChange={(event) => setSelected(event.target.checked)}
        />
        <Checkbox label="Mixed" indeterminate checked />
        <Checkbox label="Unselected" />
      </div>
      <div className="iconLegibility-statuses">
        {statuses.map((status) => (
          <span key={status}>
            <StatusIndicator status={status} aria-hidden />
            {status}
          </span>
        ))}
      </div>
      <div className="iconLegibility-specimens">
        {specimenSizes.map((size) => (
          <div
            key={size}
            style={{ "--saltIcon-size": `${size}px` } as CSSProperties}
          >
            <span>{size}px</span>
            {specimenIcons.map(({ name, component: IconComponent }) => (
              <IconComponent
                key={name}
                aria-label={name}
                className="iconLegibility-specimen"
              />
            ))}
          </div>
        ))}
      </div>
      <p className="iconLegibility-note">
        Components use their native icon sizes. Outlined squares show the full
        view box at 12px and 16px.
      </p>
    </section>
  );
};

export const ComponentLegibility: StoryFn<ComponentLegibilityArgs> = (args) => (
  <QAContainer width={1120} height="auto" cols={1} itemPadding={12}>
    <ComponentLegibilityExample {...args} />
  </QAContainer>
);

ComponentLegibility.args = {
  strokeWidth: 1,
};

ComponentLegibility.argTypes = {
  strokeWidth: {
    name: "--salt-size-icon-strokeWidth",
    description:
      "Inherited stroke width in the 16-unit SVG view box. A value of 1 renders at 0.75px for a 12px icon.",
    control: { type: "range", min: 0.5, max: 1.5, step: 0.05 },
  },
};

ComponentLegibility.parameters = {
  chromatic: { disableSnapshot: false },
};

interface AllIconViewBoxesArgs {
  iconSize: 12 | 16 | 32 | 64;
  mode: "light" | "dark";
  search: string;
  strokeWidth: number;
}

const iconsByFamily = new Map<
  string,
  { name: string; component: typeof AddDocumentIcon }[]
>();
for (const [name, component] of Object.entries(allIcons)) {
  const familyName = name.replace(/(?:Solid)?Icon$/, "");
  const family = iconsByFamily.get(familyName);
  if (family) {
    family.push({ name, component });
  } else {
    iconsByFamily.set(familyName, [{ name, component }]);
  }
}
const iconFamilies = Array.from(iconsByFamily, ([name, variants]) => ({
  name,
  variants: variants.sort((first, second) =>
    first.name.localeCompare(second.name),
  ),
  searchText: variants.map((variant) => variant.name.toLowerCase()).join(" "),
})).sort((first, second) => first.name.localeCompare(second.name));

export const AllIconViewBoxes: StoryFn<AllIconViewBoxesArgs> = ({
  iconSize,
  mode,
  search,
  strokeWidth,
}) => {
  const { themeNext } = useTheme();
  const ChosenSaltProvider = themeNext ? SaltProviderNext : SaltProvider;
  const searchText = search.trim().toLowerCase();
  const visibleFamilies = iconFamilies.filter((family) =>
    family.searchText.includes(searchText),
  );
  const visibleIconCount = visibleFamilies.reduce(
    (count, family) => count + family.variants.length,
    0,
  );

  return (
    <ChosenSaltProvider mode={mode} density="medium">
      <section
        className="iconViewBoxes"
        aria-label="Icon view box comparison"
        style={
          {
            "--saltIcon-size": `${iconSize}px`,
            "--salt-size-icon-strokeWidth": strokeWidth,
          } as CSSProperties
        }
      >
        <header className="iconViewBoxes-header">
          <h2>Icon view boxes</h2>
          <p>
            {visibleIconCount} icons · {iconSize}px · {mode} mode
          </p>
          <p>
            Each outlined square shows the complete 16 × 16 view box. Related
            outline and solid variants stay together. Use the controls to change
            size, stroke width, mode, or filter by name.
          </p>
        </header>
        <ul className="iconViewBoxes-grid">
          {visibleFamilies.map((family) => (
            <li
              className="iconViewBoxes-family"
              key={family.name}
              aria-label={family.name}
            >
              {family.variants.map(({ name, component: IconComponent }) => (
                <figure key={name}>
                  <IconComponent
                    className="iconViewBoxes-specimen"
                    aria-hidden
                  />
                  <figcaption>{name}</figcaption>
                </figure>
              ))}
            </li>
          ))}
        </ul>
        {visibleFamilies.length === 0 ? <p>No matching icons.</p> : null}
      </section>
    </ChosenSaltProvider>
  );
};

AllIconViewBoxes.args = {
  iconSize: 16,
  mode: "light",
  search: "",
  strokeWidth: 1,
};

AllIconViewBoxes.argTypes = {
  iconSize: {
    name: "Icon size (px)",
    options: [12, 16, 32, 64],
    control: { type: "inline-radio" },
  },
  mode: {
    options: ["light", "dark"],
    control: { type: "inline-radio" },
  },
  search: {
    name: "Filter by name",
    control: { type: "text" },
  },
  strokeWidth: {
    name: "--salt-size-icon-strokeWidth",
    description: "Inherited stroke width in the 16-unit SVG view box.",
    control: { type: "range", min: 0.5, max: 1.5, step: 0.05 },
  },
};

AllIconViewBoxes.parameters = {
  chromatic: { disableSnapshot: false },
};
