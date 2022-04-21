import { ReactElement, useMemo, useCallback } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { JSONByScope } from "../../helpers/parseToJson";
import { LightDarkToggle } from "../toggles/LightDarkToggle";
import { ThemeMode } from "../../header/ScopeSelector";
import { UITK_CHARACTERISTICS } from "../../utils/uitkValues";
import { CharacteristicPatternsList } from "./CharacteristicsPatternsList";
import "./Characteristics.css";

const withBaseName = makePrefixer("uitkCharacteristicsView");
interface CharacteristicsViewProps {
  extractValue: (value: string) => string;
  jsonInCurrentScope: JSONByScope[];
  mode: ThemeMode;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  onModeChanged: (mode: ThemeMode) => void;
}

export const CharacteristicsView = (
  props: CharacteristicsViewProps
): ReactElement => {
  const onModeChange = useMemo(() => {
    return props.onModeChanged;
  }, [props.onModeChanged]);

  const onModeChanged = useCallback(
    (mode) => {
      onModeChange(mode);
    },
    [onModeChange]
  );

  return (
    <div className={cn(withBaseName())}>
      <LightDarkToggle mode={props.mode} onModeChanged={onModeChanged} />
      <CharacteristicPatternsList
        extractValue={props.extractValue}
        jsonInCurrentScope={props.jsonInCurrentScope}
        onUpdateJSON={props.onUpdateJSON}
        patternsInScope={UITK_CHARACTERISTICS}
        scope={props.mode === ThemeMode.LIGHT ? "light" : "dark"}
        themeName={"uitk"}
      />
    </div>
  );
};
