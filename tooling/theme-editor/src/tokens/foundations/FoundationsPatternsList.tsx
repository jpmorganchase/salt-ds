import { useMemo, useCallback, ReactElement } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { AccordionGroup } from "@salt-ds/lab";
import { createColorMap } from "../../helpers/createColorMap";
import { JSONByScope } from "../../helpers/parseToJson";
import { ThemeMode } from "../../header/ScopeSelector";
import { LightDarkToggle } from "../toggles/LightDarkToggle";
import { FoundationPatternByDensity } from "./general/FoundationPatternByDensity";
import { ColorPattern } from "./color/ColorPattern";
import { IconPattern } from "./icon/IconPattern";
import { ShadowPattern } from "./shadow/ShadowPattern";
import "./Foundations.css";

const withBaseName = makePrefixer("saltFoundationsPatternsList");
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
      Object.keys(js.jsonObj.salt).some((k) =>
        props.patternsInScope.includes(k)
      )
    );
  }, [props.jsonInCurrentScope, props.patternsInScope]);

  const saltColorOverrides = useMemo(() => {
    return createColorMap(jsonByScopeInView);
  }, [jsonByScopeInView]);

  if (jsonByScopeInView.every((s) => s.scope.includes("density")))
    jsonByScopeInView = jsonByScopeInView.sort((a, b) => (a > b ? 1 : -1));

  const onModeChange = useMemo(() => {
    return props.onModeChange;
  }, [props.onModeChange]);

  const onModeChanged = useCallback(
    (mode: ThemeMode) => {
      onModeChange(mode);
    },
    [onModeChange]
  );

  return (
    <div className={clsx(withBaseName())}>
      {!!jsonByScopeInView.filter((s) => ["light", "dark"].includes(s.scope))
        .length && (
        <LightDarkToggle mode={props.mode} onModeChanged={onModeChanged} />
      )}
      <AccordionGroup>
        {jsonByScopeInView.map((s) => {
          return Object.keys(s.jsonObj.salt)
            .filter((pattern) => props.patternsInScope.includes(pattern))
            .map(function (pattern) {
              return s.scope.includes("density") ||
                (pattern !== "shadow" &&
                  pattern !== "color" &&
                  pattern !== "icon") ? (
                <FoundationPatternByDensity
                  key={`${props.themeName}-${pattern}`}
                  patternName={pattern}
                  values={s.jsonObj.salt[pattern]}
                  themeName={props.themeName}
                  onUpdateJSON={props.onUpdateJSON}
                  extractValue={props.extractValue}
                  scope={s.scope}
                  saltColorOverrides={saltColorOverrides}
                />
              ) : pattern === "shadow" ? (
                <div className={clsx(withBaseName("ColorsAndShadows"))}>
                  <ShadowPattern
                    saltColorOverrides={saltColorOverrides}
                    themeName={props.themeName}
                    onUpdateJSON={props.onUpdateJSON}
                    extractValue={props.extractValue}
                    scope={s.scope}
                    pattern={pattern}
                    shadowPattern={s.jsonObj.salt[pattern]}
                  />
                </div>
              ) : pattern === "icon" ? (
                <IconPattern
                  key={`${props.themeName}-${pattern}`}
                  patternName={pattern}
                  values={s.jsonObj.salt[pattern]}
                  themeName={props.themeName}
                  onUpdateJSON={props.onUpdateJSON}
                  extractValue={props.extractValue}
                  scope={s.scope}
                  saltColorOverrides={saltColorOverrides}
                />
              ) : (
                ["mode-all"].includes(s.scope) && (
                  <ColorPattern
                    saltColorOverrides={saltColorOverrides}
                    key={`${props.themeName}-${pattern}`}
                    patternName={pattern}
                    values={s.jsonObj.salt[pattern]}
                    themeName={props.themeName}
                    onUpdateJSON={props.onUpdateJSON}
                    extractValue={props.extractValue}
                    scope={s.scope}
                  />
                )
              );
            });
        })}
      </AccordionGroup>
    </div>
  );
};
