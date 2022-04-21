import { ReactElement, useMemo, useState, useEffect } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Accordion } from "@jpmorganchase/lab";
import { CharacteristicPattern } from "./CharacteristicPattern";
import { JSONByScope, JSONObj } from "../../helpers/parseToJson";
import { useSearchParams } from "react-router-dom";
import { createColorMap } from "../../helpers/createColorMap";
import "./Characteristics.css";

const withBaseName = makePrefixer("uitkCharacteristicPatternsList");
interface CharacteristicPatternsListProps {
  extractValue: (value: string) => string;
  patternsInScope: string[];
  themeName: string;
  jsonInCurrentScope: JSONByScope[];
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  scope: string;
}

export const CharacteristicPatternsList = (
  props: CharacteristicPatternsListProps
): ReactElement => {
  const [expandedCharacteristics, setExpandedCharacteristics] = useState<
    string[]
  >([]);
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const openCharacteristics = searchParams.get("open")?.split("&") || [];
    setExpandedCharacteristics(openCharacteristics);
  }, [searchParams]);

  const jsonByScopeInView = Object.values(props.jsonInCurrentScope).filter(
    (js) =>
      Object.keys(js.jsonObj.uitk).some((k) =>
        props.patternsInScope.includes(k)
      )
  );

  const patternValuesInScope: JSONObj = useMemo(() => {
    const patternvals: JSONObj = {};
    props.patternsInScope.forEach((pattern) => {
      const values: JSONObj = {};
      for (const s of jsonByScopeInView) {
        Object.keys(s.jsonObj.uitk)
          .filter((k) => pattern === k)
          .forEach((k) => {
            values[pattern] = {
              ...values[pattern],
              [s.scope]: s.jsonObj.uitk[k],
            };
          });
      }

      patternvals[pattern] = values[pattern];
    });

    return patternvals;
  }, [props.patternsInScope, jsonByScopeInView]);

  const uitkColorOverrides = useMemo(() => {
    return createColorMap(jsonByScopeInView);
  }, [jsonByScopeInView]);

  return (
    <Accordion>
      <div className={cn(withBaseName())}>
        {Object.keys(patternValuesInScope).map(function (pattern) {
          return (
            <CharacteristicPattern
              extractValue={props.extractValue}
              expandedCharacteristics={expandedCharacteristics}
              key={`${props.themeName}-${pattern}`}
              onUpdateJSON={props.onUpdateJSON}
              patternName={pattern}
              scope={props.scope}
              themeName={props.themeName}
              values={patternValuesInScope[pattern]}
              uitkColorOverrides={uitkColorOverrides}
            />
          );
        })}
      </div>
    </Accordion>
  );
};
