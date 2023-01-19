import getCharacteristics from "../../utils/getCharacteristics";
import useDynamicImport from "../../utils/useDynamicImportCSSDocgen";

export interface StringIndexedObject<T> {
  [key: string]: T;
}

export interface CSSData extends StringIndexedObject<CSSDataItem> {}

export interface CSSDataItem {
  name: string;
  description: string;
}

const data = {
  "--salt-actionable-cta-background": {
    name: "--salt-actionable-cta-background",
    property: "--button-background",
    fallbackValue: "--salt-actionable-cta-background",
  },
  "--salt-actionable-cta-background-active": {
    name: "--salt-actionable-cta-background-active",
    property: "--button-background-active",
    fallbackValue: "--salt-actionable-cta-background-active",
  },
  "--salt-actionable-cta-background-disabled": {
    name: "--salt-actionable-cta-background-disabled",
    property: "--button-background-disabled",
    fallbackValue: "--salt-actionable-cta-background-disabled",
  },
  "--salt-actionable-cta-background-hover": {
    name: "--salt-actionable-cta-background-hover",
    property: "--button-background-hover",
    fallbackValue: "--salt-actionable-cta-background-hover",
  },
  "--salt-actionable-cta-fontWeight": {
    name: "--salt-actionable-cta-fontWeight",
    property: "--button-fontWeight",
    fallbackValue: "--salt-actionable-cta-fontWeight",
  },
  "--salt-actionable-cta-foreground": {
    name: "--salt-actionable-cta-foreground",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-cta-foreground",
  },
  "--salt-actionable-cta-foreground-active": {
    name: "--salt-actionable-cta-foreground-active",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-cta-foreground-active",
  },
  "--salt-actionable-cta-foreground-disabled": {
    name: "--salt-actionable-cta-foreground-disabled",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-cta-foreground-disabled",
  },
  "--salt-actionable-cta-foreground-hover": {
    name: "--salt-actionable-cta-foreground-hover",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-cta-foreground-hover",
  },
  "--salt-actionable-primary-background": {
    name: "--salt-actionable-primary-background",
    property: "--button-background",
    fallbackValue: "--salt-actionable-primary-background",
  },
  "--salt-actionable-primary-background-active": {
    name: "--salt-actionable-primary-background-active",
    property: "--button-background-active",
    fallbackValue: "--salt-actionable-primary-background-active",
  },
  "--salt-actionable-primary-background-disabled": {
    name: "--salt-actionable-primary-background-disabled",
    property: "--button-background-disabled",
    fallbackValue: "--salt-actionable-primary-background-disabled",
  },
  "--salt-actionable-primary-background-hover": {
    name: "--salt-actionable-primary-background-hover",
    property: "--button-background-hover",
    fallbackValue: "--salt-actionable-primary-background-hover",
  },
  "--salt-actionable-primary-fontWeight": {
    name: "--salt-actionable-primary-fontWeight",
    property: "--button-fontWeight",
    fallbackValue: "--salt-actionable-primary-fontWeight",
  },
  "--salt-actionable-primary-foreground": {
    name: "--salt-actionable-primary-foreground",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-primary-foreground",
  },
  "--salt-actionable-primary-foreground-active": {
    name: "--salt-actionable-primary-foreground-active",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-primary-foreground-active",
  },
  "--salt-actionable-primary-foreground-disabled": {
    name: "--salt-actionable-primary-foreground-disabled",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-primary-foreground-disabled",
  },
  "--salt-actionable-primary-foreground-hover": {
    name: "--salt-actionable-primary-foreground-hover",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-primary-foreground-hover",
  },
  "--salt-actionable-secondary-background": {
    name: "--salt-actionable-secondary-background",
    property: "--button-background",
    fallbackValue: "--salt-actionable-secondary-background",
  },
  "--salt-actionable-secondary-background-active": {
    name: "--salt-actionable-secondary-background-active",
    property: "--button-background-active",
    fallbackValue: "--salt-actionable-secondary-background-active",
  },
  "--salt-actionable-secondary-background-disabled": {
    name: "--salt-actionable-secondary-background-disabled",
    property: "--button-background-disabled",
    fallbackValue: "--salt-actionable-secondary-background-disabled",
  },
  "--salt-actionable-secondary-background-hover": {
    name: "--salt-actionable-secondary-background-hover",
    property: "--button-background-hover",
    fallbackValue: "--salt-actionable-secondary-background-hover",
  },
  "--salt-actionable-secondary-fontWeight": {
    name: "--salt-actionable-secondary-fontWeight",
    property: "--button-fontWeight",
    fallbackValue: "--salt-actionable-secondary-fontWeight",
  },
  "--salt-actionable-secondary-foreground": {
    name: "--salt-actionable-secondary-foreground",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-secondary-foreground",
  },
  "--salt-actionable-secondary-foreground-active": {
    name: "--salt-actionable-secondary-foreground-active",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-secondary-foreground-active",
  },
  "--salt-actionable-secondary-foreground-disabled": {
    name: "--salt-actionable-secondary-foreground-disabled",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-secondary-foreground-disabled",
  },
  "--salt-actionable-secondary-foreground-hover": {
    name: "--salt-actionable-secondary-foreground-hover",
    property: "--saltIcon-color",
    fallbackValue: "--salt-actionable-secondary-foreground-hover",
  },
  "--saltButton-alignItems": {
    name: "--saltButton-alignItems",
    property: "align-items",
    fallbackValue: "center",
  },
  "--saltButton-background": {
    name: "--saltButton-background",
    property: "background",
    fallbackValue: "--button-background",
  },
  "--button-background": {
    name: "--button-background",
    property: "background",
    fallbackValue: "--button-background",
  },
  "--saltButton-borderColor": {
    name: "--saltButton-borderColor",
    property: "border-color",
    fallbackValue: "transparent",
  },
  "--saltButton-borderStyle": {
    name: "--saltButton-borderStyle",
    property: "border-style",
    fallbackValue: "solid",
  },
  "--saltButton-borderWidth": {
    name: "--saltButton-borderWidth",
    property: "border-width",
    fallbackValue: "0",
  },
  "--saltButton-borderRadius": {
    name: "--saltButton-borderRadius",
    property: "border-radius",
    fallbackValue: "0",
  },
  "--saltButton-text-color": {
    name: "--saltButton-text-color",
    property: "color",
    fallbackValue: "--button-text-color",
  },
  "--button-text-color": {
    name: "--button-text-color",
    property: "color",
    fallbackValue: "--button-text-color",
  },
  "--saltButton-cursor": {
    name: "--saltButton-cursor",
    property: "cursor",
    fallbackValue: "pointer",
  },
  "--saltButton-justifyContent": {
    name: "--saltButton-justifyContent",
    property: "justify-content",
    fallbackValue: "center",
  },
  "--saltButton-fontSize": {
    name: "--saltButton-fontSize",
    property: "font-size",
    fallbackValue: "--salt-text-fontSize",
  },
  "--salt-text-fontSize": {
    name: "--salt-text-fontSize",
    property: "font-size",
    fallbackValue: "--salt-text-fontSize",
  },
  "--saltButton-fontFamily": {
    name: "--saltButton-fontFamily",
    property: "font-family",
    fallbackValue: "--salt-text-fontFamily",
  },
  "--salt-text-fontFamily": {
    name: "--salt-text-fontFamily",
    property: "font-family",
    fallbackValue: "--salt-text-fontFamily",
  },
  "--saltButton-lineHeight": {
    name: "--saltButton-lineHeight",
    property: "line-height",
    fallbackValue: "--salt-text-lineHeight",
  },
  "--salt-text-lineHeight": {
    name: "--salt-text-lineHeight",
    property: "line-height",
    fallbackValue: "--salt-text-lineHeight",
  },
  "--saltButton-letterSpacing": {
    name: "--saltButton-letterSpacing",
    property: "letter-spacing",
    fallbackValue: "--salt-actionable-letterSpacing",
  },
  "--salt-actionable-letterSpacing": {
    name: "--salt-actionable-letterSpacing",
    property: "letter-spacing",
    fallbackValue: "--salt-actionable-letterSpacing",
  },
  "--saltButton-textTransform": {
    name: "--saltButton-textTransform",
    property: "text-transform",
    fallbackValue: "--salt-actionable-textTransform",
  },
  "--salt-actionable-textTransform": {
    name: "--salt-actionable-textTransform",
    property: "text-transform",
    fallbackValue: "--salt-actionable-textTransform",
  },
  "--saltButton-padding": {
    name: "--saltButton-padding",
    property: "padding",
    fallbackValue: "--salt-size-unit",
  },
  "--salt-size-unit": {
    name: "--salt-size-unit",
    property: "padding",
    fallbackValue: "--salt-size-unit",
  },
  "--saltButton-margin": {
    name: "--saltButton-margin",
    property: "margin",
    fallbackValue: "0",
  },
  "--saltButton-height": {
    name: "--saltButton-height",
    property: "height",
    fallbackValue: "--salt-size-base",
  },
  "--salt-size-base": {
    name: "--salt-size-base",
    property: "height",
    fallbackValue: "--salt-size-base",
  },
  "--saltButton-minWidth": {
    name: "--saltButton-minWidth",
    property: "min-width",
    fallbackValue: "unset",
  },
  "--saltButton-textAlign": {
    name: "--saltButton-textAlign",
    property: "text-align",
    fallbackValue: "--salt-actionable-textAlign",
  },
  "--salt-actionable-textAlign": {
    name: "--salt-actionable-textAlign",
    property: "text-align",
    fallbackValue: "--salt-actionable-textAlign",
  },
  "--saltButton-width": {
    name: "--saltButton-width",
    property: "width",
    fallbackValue: "auto",
  },
  "--saltButton-fontWeight": {
    name: "--saltButton-fontWeight",
    property: "font-weight",
    fallbackValue: "--button-fontWeight",
  },
  "--button-fontWeight": {
    name: "--button-fontWeight",
    property: "font-weight",
    fallbackValue: "--button-fontWeight",
  },
  "--salt-focused-outlineStyle": {
    name: "--salt-focused-outlineStyle",
    property: "outline-style",
    fallbackValue: "--salt-focused-outlineStyle",
  },
  "--salt-focused-outlineWidth": {
    name: "--salt-focused-outlineWidth",
    property: "outline-width",
    fallbackValue: "--salt-focused-outlineWidth",
  },
  "--salt-focused-outlineColor": {
    name: "--salt-focused-outlineColor",
    property: "outline-color",
    fallbackValue: "--salt-focused-outlineColor",
  },
  "--salt-focused-outlineOffset": {
    name: "--salt-focused-outlineOffset",
    property: "outline-offset",
    fallbackValue: "--salt-focused-outlineOffset",
  },
  "--saltButton-background-hover": {
    name: "--saltButton-background-hover",
    property: "background",
    fallbackValue: "--button-background-hover",
  },
  "--button-background-hover": {
    name: "--button-background-hover",
    property: "background",
    fallbackValue: "--button-background-hover",
  },
  "--saltButton-text-color-hover": {
    name: "--saltButton-text-color-hover",
    property: "color",
    fallbackValue: "--button-text-color-hover",
  },
  "--button-text-color-hover": {
    name: "--button-text-color-hover",
    property: "color",
    fallbackValue: "--button-text-color-hover",
  },
  "--saltButton-background-active-hover": {
    name: "--saltButton-background-active-hover",
    property: "background",
    fallbackValue: "--button-background",
  },
  "--saltButton-text-color-active-hover": {
    name: "--saltButton-text-color-active-hover",
    property: "color",
    fallbackValue: "--button-text-color",
  },
  "--saltButton-background-active": {
    name: "--saltButton-background-active",
    property: "background",
    fallbackValue: "--button-background-active",
  },
  "--button-background-active": {
    name: "--button-background-active",
    property: "background",
    fallbackValue: "--button-background-active",
  },
  "--saltButton-text-color-active": {
    name: "--saltButton-text-color-active",
    property: "color",
    fallbackValue: "--button-text-color-active",
  },
  "--button-text-color-active": {
    name: "--button-text-color-active",
    property: "color",
    fallbackValue: "--button-text-color-active",
  },
  "--saltButton-background-disabled": {
    name: "--saltButton-background-disabled",
    property: "background",
    fallbackValue: "--button-background-disabled",
  },
  "--button-background-disabled": {
    name: "--button-background-disabled",
    property: "background",
    fallbackValue: "--button-background-disabled",
  },
  "--saltButton-text-color-disabled": {
    name: "--saltButton-text-color-disabled",
    property: "color",
    fallbackValue: "--button-text-color-disabled",
  },
  "--button-text-color-disabled": {
    name: "--button-text-color-disabled",
    property: "color",
    fallbackValue: "--button-text-color-disabled",
  },
  "--saltButton-cursor-disabled": {
    name: "--saltButton-cursor-disabled",
    property: "cursor",
    fallbackValue: "--salt-actionable-cursor-disabled",
  },
  "--salt-actionable-cursor-disabled": {
    name: "--salt-actionable-cursor-disabled",
    property: "cursor",
    fallbackValue: "--salt-actionable-cursor-disabled",
  },
};

interface CSSVariable {
  name: string;
  type?: string;
  defaultValue?: string;
}

export interface Characteristic {
  name: string;
  tokens?: string[];
}

export const CharacteristicsTable = ({
  name,
}: {
  name: string;
}): JSX.Element => {
  const cssData: CSSData = useDynamicImport(name);

  const characteristicTokenMap =
    getCharacteristics<Record<string, CSSVariable>>(data);

  return (
    <table>
      <thead>
        <tr>
          <th>Characteristic</th>
          <th>Tokens</th>
        </tr>
      </thead>
      <tbody>
        {data &&
          Object.entries(characteristicTokenMap)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, tokens]) => (
              <tr>
                <td>{name}</td>

                <td>
                  {tokens &&
                    tokens.map((token) => <div key={token}>{token}</div>)}
                </td>
              </tr>
            ))}
      </tbody>
    </table>
  );
};

export default CharacteristicsTable;
