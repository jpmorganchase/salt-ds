import { JSONObj } from "../../../helpers/parseToJson";

export interface ShadowPatternProps {
  extractValue: (value: string) => string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  pattern: string;
  scope: string;
  shadowPattern: JSONObj;
  themeName: string;
  uitkColorOverrides: Record<string, string>;
}
