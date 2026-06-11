/**
 * Internal re-export of AG Grid's theming value types so the Salt part files
 * have a single import path that survives any future AG Grid module-layout
 * shuffles.
 *
 * The names mirror `ag-grid-community/dist/types/src/agStack/theming/themeTypes.d.ts`.
 */
export type {
  BorderStyleValue,
  BorderValue,
  ColorSchemeValue,
  ColorValue,
  DurationValue,
  FontFamilyValue,
  FontWeightValue,
  LengthValue,
  ScaleValue,
  ShadowValue,
} from "ag-grid-community";

