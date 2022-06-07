import { useMemo, useCallback, ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Accordion } from "@jpmorganchase/uitk-lab";
import { createColorMap } from "../../helpers/createColorMap";
import { JSONByScope } from "../../helpers/parseToJson";
import { ThemeMode } from "../../header/ScopeSelector";
import { LightDarkToggle } from "../toggles/LightDarkToggle";
import { FoundationPatternByDensity } from "./general/FoundationPatternByDensity";
import { ColorPattern } from "./color/ColorPattern";
import { ShadowPattern } from "./shadow/ShadowPattern";
import "./Foundations.css";
import { DelayPattern } from "./delay/DelayPattern";
import { OpacityPattern } from "./opacity/OpacityPattern";
import { TypographyPattern } from "./typography/TypographyPattern";
import { PalettePattern } from "./palette/PalettePattern";

const withBaseName = makePrefixer("uitkFoundationsPatternsList");
interface FoundationPatternsListProps {
  extractValue: (val: string) => string;
  jsonInCurrentScope: JSONByScope[];
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternsInScope: string[];
  themeName: string;
}

export const FoundationPatternsList = (
  props: FoundationPatternsListProps
): ReactElement => {
  let jsonByScopeInView = useMemo(() => {
    return Object.values(props.jsonInCurrentScope).filter((js) =>
      Object.keys(js.jsonObj.uitk).some((k) =>
        props.patternsInScope.includes(k)
      )
    );
  }, [props.jsonInCurrentScope, props.patternsInScope]);

  const uitkColorOverrides = useMemo(() => {
    return createColorMap(jsonByScopeInView);
  }, [jsonByScopeInView]);

  if (jsonByScopeInView.every((s) => s.scope.includes("density")))
    jsonByScopeInView = jsonByScopeInView.sort((a, b) => (a > b ? 1 : -1));

  const onModeChange = useMemo(() => {
    return props.onModeChange;
  }, [props.onModeChange]);

  const onModeChanged = useCallback(
    (mode) => {
      onModeChange(mode);
    },
    [onModeChange]
  );
  return (
    <div className={cn(withBaseName())}>
      {!!jsonByScopeInView.filter((s) => ["light", "dark"].includes(s.scope))
        .length && (
        <LightDarkToggle mode={props.mode} onModeChanged={onModeChanged} />
      )}
      <Accordion>
        {jsonByScopeInView.map((s) => {
          return Object.keys(s.jsonObj.uitk)
            .filter((pattern) => props.patternsInScope.includes(pattern))
            .map(function (pattern) {
              return pattern !== "shadow" &&
                pattern !== "color" &&
                pattern !== "delay" &&
                pattern !== "opacity" &&
                pattern !== "typography" &&
                pattern !== "palette" ? (
                <FoundationPatternByDensity
                  key={`${props.themeName}-${pattern}`}
                  patternName={pattern}
                  values={s.jsonObj.uitk[pattern]}
                  themeName={props.themeName}
                  onUpdateJSON={props.onUpdateJSON}
                  extractValue={props.extractValue}
                  scope={s.scope}
                  uitkColorOverrides={uitkColorOverrides}
                />
              ) : pattern === "palette" ? (
                <PalettePattern
                  themeName={props.themeName}
                  onUpdateJSON={props.onUpdateJSON}
                  extractValue={props.extractValue}
                  scope={s.scope}
                  patternName={pattern}
                  palette={s.jsonObj.uitk[pattern]}
                />
              ) : pattern === "typography" ? (
                <TypographyPattern
                  uitkColorOverrides={uitkColorOverrides}
                  themeName={props.themeName}
                  onUpdateJSON={props.onUpdateJSON}
                  extractValue={props.extractValue}
                  scope={s.scope}
                  patternName={pattern}
                  values={s.jsonObj.uitk[pattern]}
                />
              ) : pattern === "delay" ? (
                <DelayPattern
                  uitkColorOverrides={uitkColorOverrides}
                  themeName={props.themeName}
                  onUpdateJSON={props.onUpdateJSON}
                  extractValue={props.extractValue}
                  scope={s.scope}
                  patternName={pattern}
                  values={s.jsonObj.uitk[pattern]}
                />
              ) : pattern === "opacity" ? (
                <OpacityPattern
                  uitkColorOverrides={uitkColorOverrides}
                  themeName={props.themeName}
                  onUpdateJSON={props.onUpdateJSON}
                  extractValue={props.extractValue}
                  scope={s.scope}
                  patternName={pattern}
                  values={s.jsonObj.uitk[pattern]}
                />
              ) : pattern === "shadow" ? (
                <ShadowPattern
                  uitkColorOverrides={uitkColorOverrides}
                  themeName={props.themeName}
                  onUpdateJSON={props.onUpdateJSON}
                  extractValue={props.extractValue}
                  scope={s.scope}
                  pattern={pattern}
                  shadowPattern={s.jsonObj.uitk[pattern]}
                />
              ) : (
                <ColorPattern
                  uitkColorOverrides={uitkColorOverrides}
                  key={`${props.themeName}-${pattern}`}
                  patternName={pattern}
                  values={s.jsonObj.uitk[pattern]}
                  themeName={props.themeName}
                  onUpdateJSON={props.onUpdateJSON}
                  extractValue={props.extractValue}
                  scope={s.scope}
                />
              );
            });
        })}
      </Accordion>
    </div>
  );
};
