import { ReactElement } from "react";
import cn from "classnames";
import { Accordion } from "@jpmorganchase/uitk-lab";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { JSONObj } from "../../../helpers/parseToJson";
import { PaletteSentiment } from "./PaletteSentiment";

const withBaseName = makePrefixer("uitkPalettePattern");

export interface PalettePatternProps {
  extractValue: (value: string) => string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
  themeName: string;
  palette: JSONObj;
}

export const PalettePattern = (props: PalettePatternProps): ReactElement => {
  console.log(props);
  return (
    <Accordion>
      <div className={cn(withBaseName())}>
        {Object.keys(props.palette).map(function (sentiment) {
          return (
            <PaletteSentiment
              extractValue={props.extractValue}
              key={`${props.themeName}-palette--${sentiment}`}
              onUpdateJSON={props.onUpdateJSON}
              sentimentName={sentiment}
              scope={props.scope}
              themeName={props.themeName}
              sentimentValues={props.palette[sentiment]}
            />
          );
        })}
      </div>
    </Accordion>
  );
};
